import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/index";
import { Toastify } from "../../components/Toastify";
import CartItem from "./CartItem";

function Cart({ isOpen, setIsOpen }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const exchangeRate = 25000; // 1 USD = 25,000 VND
  const user = JSON.parse(sessionStorage.getItem("user"));
  const sessionKey =
    sessionStorage.getItem("guest_session_key") ||
    (() => {
      const newSessionKey = `guest_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      sessionStorage.setItem("guest_session_key", newSessionKey);
      return newSessionKey;
    })();
  const navigate = useNavigate();
  const cartRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchCartItems();
    }
    const handleCartUpdate = () => {
      if (isOpen) {
        setTimeout(() => {
          fetchCartItems();
        }, 500);
      }
    };
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!user) {
        api
          .delete("/guest_carts.php", { data: { session_key: sessionKey } })
          .catch((err) => {
            console.error("Failed to clear guest cart on unload:", err);
          });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user, sessionKey]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

const fetchCartItems = async () => {
  if (!user && !sessionStorage.getItem("guest_session_key")) {
    setCartItems([]);
    setLoading(false);
    setError("");
    return;
  }

  setLoading(true);
  try {
    const endpoint = user ? "/carts.php" : "/guest_carts.php";
    const params = user
      ? { user_id: user.user_id }
      : { session_key: sessionKey };
    const response = await api.get(endpoint, { params });
    if (response.data.status === "success") {
      const items = (response.data.data || []).map((item) => ({
        ...item,
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity, 10) || 1,
      }));
      setCartItems(items);
      setError("");
    } else {
      setError(
        `Failed to fetch cart: ${response.data.message || "Unknown error"}`
      );
      Toastify.error(
        `Failed to fetch cart: ${response.data.message || "Unknown error"}`
      );
    }
  } catch (err) {
    const errorMsg =
      err.response?.data?.message || err.message || "Network or server error";
    setError(`Failed to fetch cart: ${errorMsg}`);
    Toastify.error(`Failed to fetch cart: ${errorMsg}`);
    console.error("Fetch cart error:", {
      error: err,
      response: err.response,
      status: err.response?.status,
      data: err.response?.data,
    });
  } finally {
    setLoading(false);
  }
};

  const handleQuantityChange = async (itemId, delta) => {
    const item = cartItems.find(
      (i) => (user ? i.cart_id : i.guest_cart_id) === itemId
    );
    if (!item) return;
    const newQuantity = Math.max(1, item.quantity + delta);
    try {
      const payload = user
        ? { user_id: user.user_id, cart_id: itemId, quantity: newQuantity }
        : {
            session_key: sessionKey,
            guest_cart_id: itemId,
            quantity: newQuantity,
          };
      const endpoint = user ? "/carts.php" : "/guest_carts.php";
      const response = await api.put(endpoint, payload);
      if (response.data.status === "success") {
        const event = new CustomEvent("cartUpdated");
        window.dispatchEvent(event);
        // Đã xóa Toastify.success(`Updated quantity for ${item.name}`);
      } else {
        Toastify.error(
          `Failed to update quantity: ${
            response.data.message || "Unknown error"
          }`
        );
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Network or server error";
      Toastify.error(`Failed to update quantity: ${errorMsg}`);
      console.error("Update quantity error:", {
        error: err,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
      });
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const endpoint = user ? "/carts.php" : "/guest_carts.php";
      const payload = user
        ? { user_id: user.user_id, cart_id: itemId }
        : { session_key: sessionKey, guest_cart_id: itemId };
      const response = await api.delete(endpoint, { data: payload });
      if (response.data.status === "success") {
        const event = new CustomEvent("cartUpdated");
        window.dispatchEvent(event);
        Toastify.success("Item removed from cart");
      } else {
        Toastify.error(
          `Failed to remove item: ${response.data.message || "Unknown error"}`
        );
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Network or server error";
      Toastify.error(`Failed to remove item: ${errorMsg}`);
      console.error("Remove item error:", {
        error: err,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
      });
    }
  };

  const handleRemoveAll = async () => {
    try {
      const endpoint = user ? "/carts.php" : "/guest_carts.php";
      const payload = user
        ? { user_id: user.user_id }
        : { session_key: sessionKey };
      await api.delete(endpoint, { data: payload });
      const event = new CustomEvent("cartUpdated");
      window.dispatchEvent(event);
      Toastify.success("All items removed from cart");
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Network or server error";
      Toastify.error(`Failed to remove all items: ${errorMsg}`);
      console.error("Remove all error:", {
        error: err,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
      });
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum +
      (parseFloat(item.price) || 0) *
        exchangeRate *
        (parseInt(item.quantity, 10) || 1),
    0
  );

  const handleCheckout = () => {
    navigate("/checkout");
    setIsOpen(false);
  };

  const handleContinueShopping = () => {
    navigate("/shop");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
      onClick={() => setIsOpen(false)}
    >
      <div
        ref={cartRef}
        className="w-full md:w-80 bg-white p-6 rounded-lg shadow-lg h-screen overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Shopping Cart</h2>
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-4">Your cart is empty.</div>
        ) : (
          <>
            <div className="space-y-2 mb-4">
              {cartItems.map((item) => (
                <CartItem
                  key={user ? item.cart_id : item.guest_cart_id}
                  item={item}
                  user={user}
                  exchangeRate={exchangeRate}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
            <div className="mb-4">
              <button
                onClick={handleRemoveAll}
                className="w-full bg-red-500 text-white py-1 rounded-lg hover:bg-red-600 transition text-sm"
              >
                Remove All
              </button>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between text-lg font-semibold">
                <span>Subtotal</span>
                <span>{subtotal.toLocaleString("vi-VN")} VND</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Shipping and taxes calculated at checkout
              </p>
            </div>
            <div className="mt-4 space-y-2">
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={handleContinueShopping}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;
