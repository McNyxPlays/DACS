import React, { useState, useEffect } from "react";
import api from "../../api/index";
import { Toastify } from "../../components/Toastify";
import CartItem from "./CartItem";

function Cart() {
  const [viewMode, setViewMode] = useState("grid");
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

  useEffect(() => {
    fetchCartItems();
    const handleCartUpdate = () => {
      setTimeout(() => {
        fetchCartItems();
      }, 500);
    };
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!user) {
        const payload = { session_key: sessionKey };
        api.delete("/guest_carts.php", { data: payload }).catch((err) => {
          console.error("Failed to clear guest cart on unload:", err);
        });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user, sessionKey]);

  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const endpoint = user ? "/carts.php" : "/guest_carts.php";
      const params = user
        ? { user_id: user.user_id }
        : { session_key: sessionKey };
      const response = await api.get(endpoint, { params });
      if (response.data.status === "success") {
        setCartItems(response.data.data || []);
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
        Toastify.success(`Updated quantity for ${item.name}`);
      } else {
        const errorMsg = response.data.message || "Unknown error";
        Toastify.error(`Failed to update quantity: ${errorMsg}`);
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
        const errorMsg = response.data.message || "Unknown error";
        Toastify.error(`Failed to remove item: ${errorMsg}`);
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

  const totalPrice =
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) *
    exchangeRate;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Your Cart</h1>
      <div className="flex justify-between items-center mb-6">
        <span className="text-gray-700 text-lg">
          {cartItems.length} items in cart
        </span>
        <div className="flex items-center gap-3">
          <span className="text-gray-700 text-sm">View mode:</span>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded ${
              viewMode === "grid"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } transition`}
          >
            <i className="ri-grid-fill"></i>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded ${
              viewMode === "list"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } transition`}
          >
            <i className="ri-list-check"></i>
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[400px] py-12">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your cart...</p>
        </div>
      )}
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      {cartItems.length === 0 && !loading && (
        <p className="text-gray-500 text-center">Your cart is empty.</p>
      )}

      {cartItems.length > 0 && !loading && (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {cartItems.map((item) => (
                <CartItem
                  key={user ? item.cart_id : item.guest_cart_id}
                  item={item}
                  user={user}
                  viewMode={viewMode}
                  exchangeRate={exchangeRate}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto mb-8">
              <table className="min-w-full bg-white rounded-lg shadow-sm">
                <thead>
                  <tr
                    className="bg-gray-100 text-gray-7

00 text-left"
                  >
                    <th className="py-4 px-6">Product</th>
                    <th className="py-4 px-6">Price</th>
                    <th className="py-4 px-6">Quantity</th>
                    <th className="py-4 px-6">Total</th>
                    <th className="py-4 px-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <CartItem
                      key={user ? item.cart_id : item.guest_cart_id}
                      item={item}
                      user={user}
                      viewMode={viewMode}
                      exchangeRate={exchangeRate}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemoveItem}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center">
            <div>
              <p className="text-xl font-bold text-gray-900">
                Total: {totalPrice.toLocaleString("vi-VN")} VND
              </p>
              <p className="text-sm text-gray-500">
                Shipping and taxes calculated at checkout
              </p>
            </div>
            <button
              onClick={() =>
                alert("Proceed to checkout functionality coming soon!")
              }
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
