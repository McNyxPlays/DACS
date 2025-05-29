import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/index";

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [guestEmail, setGuestEmail] = useState(""); // Thêm trường email
  const [guestPhone, setGuestPhone] = useState(""); // Thêm trường phone
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
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

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
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
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Network or server error";
      setError(`Failed to fetch cart: ${errorMsg}`);
    } finally {
      setLoading(false);
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

  const handleApplyPromo = async () => {
    try {
      const response = await api.post("/promotions.php", { code: promoCode });
      if (response.data.status === "success") {
        const discountValue = response.data.discount || 0;
        setDiscount(discountValue);
        setError("");
      } else {
        setError(
          `Invalid promo code: ${response.data.message || "Unknown error"}`
        );
        setDiscount(0);
      }
    } catch (err) {
      setError(
        `Failed to apply promo code: ${err.message || "Network or server error"}`
      );
      setDiscount(0);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!fullName || !address || (!user && (!guestEmail || !guestPhone))) {
      setError("All fields marked with * are required.");
      return;
    }

    const shippingAddress = address;
    const totalAmount = subtotal - discount;

    try {
      const orderData = {
        user_id: user ? user.user_id : null,
        guest_email: user ? null : guestEmail,
        guest_phone: user ? null : guestPhone,
        total_amount: totalAmount / exchangeRate,
        discount_amount: discount / exchangeRate,
        shipping_address: shippingAddress,
        payment_method: "cod",
        order_details: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_purchase: item.price,
        })),
        promo_code: promoCode || null, // Gửi promoCode
      };

      const response = await api.post("/orders.php", orderData);
      if (response.data.status === "success") {
        // Xóa giỏ hàng
        const endpoint = user ? "/carts.php" : "/guest_carts.php";
        const payload = user
          ? { user_id: user.user_id }
          : { session_key: sessionKey };
        await api.delete(endpoint, { data: payload });

        // Truyền thêm cartItems để hiển thị chi tiết trong OrderConfirmation
        navigate("/orderconfirmation", {
          state: {
            order: {
              ...response.data.data,
              items: cartItems,
            },
          },
        });
      } else {
        setError(
          `Failed to place order: ${response.data.message || "Unknown error"}`
        );
      }
    } catch (err) {
      setError(
        `Failed to place order: ${err.message || "Network or server error"}`
      );
    }
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error)
    return <div className="text-red-500 text-center py-4">{error}</div>;
  if (cartItems.length === 0)
    return <div className="text-center py-4">Your cart is empty.</div>;

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Left Section */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6">Checkout</h1>
          <p className="text-right text-sm font-semibold">
            Order subtotal ({cartItems.length} items): $
            {(subtotal / exchangeRate).toFixed(2)}
          </p>
          <div className="mt-6 space-y-6">
            <div className="bg-white p-6 rounded shadow">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-sm">
                  1
                </div>
                <h2 className="text-lg font-bold">Shipping address</h2>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Address lookup powered by Google, view{" "}
                <a className="underline" href="#">
                  Privacy policy
                </a>
                . To opt out, change cookie{" "}
                <a className="underline" href="#">
                  preferences
                </a>
                .
              </p>
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    placeholder="Full name *"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="border p-2 rounded w-full"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    placeholder="Address *"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="border p-2 rounded w-full"
                    required
                  />
                </div>
                {!user && (
                  <div className="grid grid-cols-1 gap-4">
                    <input
                      type="email"
                      placeholder="Email *"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="border p-2 rounded w-full"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone *"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="border p-2 rounded w-full"
                      required
                    />
                  </div>
                )}
                <button
                  type="submit"
                  className="mt-4 bg-black text-white py-2 px-4 rounded hover:bg-gray-800 w-full"
                >
                  Proceed to Checkout
                </button>
              </form>
            </div>

            {["Shipping method", "Payment", "Review & place order"].map(
              (label, i) => (
                <div key={i} className="bg-white p-6 rounded shadow">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border border-gray-400 text-gray-600 flex items-center justify-center text-sm">
                      {i + 2}
                    </div>
                    <h2 className="text-lg font-bold">{label}</h2>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-bold mb-2">Summary</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Enter code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="border p-2 rounded flex-1"
              />
              <button
                onClick={handleApplyPromo}
                className="bg-gray-800 text-white px-4 rounded"
              >
                →
              </button>
            </div>
            <div className="text-sm space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${(subtotal / exchangeRate).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>FREE</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated tax</span>
                <span>--</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>${(discount / exchangeRate).toFixed(2)}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${((subtotal - discount) / exchangeRate).toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Or 4 interest-free payments of $
                {(subtotal / (4 * exchangeRate)).toFixed(2)} with Klarna.{" "}
                <a href="#" className="underline">
                  Learn More
                </a>
              </p>
              <p className="text-xs text-gray-500">
                Or 4 interest-free payments of $
                {(subtotal / (4 * exchangeRate)).toFixed(2)} with Afterpay.{" "}
                <a href="#" className="underline">
                  Learn More
                </a>
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-bold mb-4">
              🛒 Cart ({cartItems.length} Items)
            </h2>
            {cartItems.map((item) => (
              <div
                key={user ? item.cart_id : item.guest_cart_id}
                className="border-b py-2"
              >
                <div className="flex justify-between font-semibold">
                  {item.name} <span>${item.price.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600">
                  Color: {item.color || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Size: {item.size || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Quantity: {item.quantity}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded shadow text-sm text-gray-600">
            <p className="mb-2">
              <strong>Need help?</strong>
            </p>
            <a href="#" className="underline block mb-1">
              Visit our Help Center
            </a>
            <p>
              Call us
              <br />
              855-427-6657
              <br />
              Mon-Fri 6am-5pm PST
            </p>
            <div className="mt-4">
              <img
                src="https://seal.digicert.com/seals/cascade/?tag=W7fM0mSm&format=png"
                alt="Digicert"
                className="h-10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}