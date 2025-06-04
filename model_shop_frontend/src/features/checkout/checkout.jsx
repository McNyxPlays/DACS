import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Toastify } from "../../components/Toastify";

// Tạo axios instance với CSRF token
const createApiInstance = (csrfToken) => {
  return axios.create({
    baseURL: "http://localhost/api",
    withCredentials: true,
    headers: {
      "X-CSRF-Token": csrfToken || "",
    },
  });
};

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promotionId, setPromotionId] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [activeStep, setActiveStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [storeId, setStoreId] = useState(null);
  const [fullNameError, setFullNameError] = useState(false);
  const [addressError, setAddressError] = useState(false);
  const [guestEmailError, setGuestEmailError] = useState(false);
  const [guestPhoneError, setGuestPhoneError] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const exchangeRate = 25000;
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

  // Lấy CSRF token từ server
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get("http://localhost/api/orders.php?action=csrf_token", {
          withCredentials: true,
        });
        if (response.data.status === "success") {
          setCsrfToken(response.data.csrf_token);
          sessionStorage.setItem("csrf_token", response.data.csrf_token);
        }
      } catch (err) {
        console.error("Failed to fetch CSRF token:", err);
      }
    };

    fetchCsrfToken();
    fetchCartItems();
    fetchStores();
  }, []);

  // Khởi tạo api instance với CSRF token
  const api = createApiInstance(csrfToken);

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
        Toastify.error(
          "Failed to fetch cart: " + (response.data.message || "Unknown error")
        );
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Network or server error";
      setError(`Failed to fetch cart: ${errorMsg}`);
      Toastify.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await api.get("/orders.php?action=stores");
      if (response.data.status === "success") {
        setStores(response.data.data || []);
      } else {
        setError(
          `Failed to fetch stores: ${response.data.message || "Unknown error"}`
        );
        Toastify.error(
          "Failed to fetch stores: " + (response.data.message || "Unknown error")
        );
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Network or server error";
      setError(`Failed to fetch stores: ${errorMsg}`);
      Toastify.error(errorMsg);
    }
  };

  const formatCurrency = (amount) => {
    const value = Number(amount).toFixed(2);
    return `₫${Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
    })}`;
  };

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum +
      (parseFloat(item.price) || 0) *
        exchangeRate *
        (parseInt(item.quantity, 10) || 1),
    0
  );

  const shippingCost =
    shippingMethod === "fast"
      ? 50000
      : shippingMethod === "express"
      ? 100000
      : 0;

  const handleApplyPromo = async () => {
    try {
      const response = await api.post("/promotions_validate.php", {
        code: promoCode,
        total_amount: subtotal / exchangeRate,
        user_id: user ? user.user_id : null,
        guest_email: user ? null : guestEmail,
      });
      if (response.data.status === "success") {
        setDiscount(response.data.discount * exchangeRate);
        setPromotionId(response.data.promotion_id);
        setError("");
        Toastify.success("Promo code applied successfully!");
      } else {
        setError(
          `Invalid promo code: ${response.data.message || "Unknown error"}`
        );
        setDiscount(0);
        setPromotionId(null);
        Toastify.error(response.data.message || "Invalid promo code!");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Network or server error";
      setError(`Failed to apply promo code: ${errorMsg}`);
      setDiscount(0);
      setPromotionId(null);
      Toastify.error(errorMsg);
    }
  };

  const validateFields = () => {
    let isValid = true;
    const errors = [];
    setFullNameError(false);
    setAddressError(false);
    setGuestEmailError(false);
    setGuestPhoneError(false);
    setError("");

    const trimmedFullName = fullName.trim();
    const trimmedGuestEmail = guestEmail.trim();
    const trimmedGuestPhone = guestPhone.trim();

    if (!trimmedFullName) {
      setFullNameError(true);
      errors.push("Please enter your full name");
      isValid = false;
    }
    if (!address && shippingMethod !== "store_pickup") {
      setAddressError(true);
      errors.push("Please enter your address");
      isValid = false;
    }
    if (!user) {
      if (!trimmedGuestEmail) {
        setGuestEmailError(true);
        errors.push("Please enter your email");
        isValid = false;
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedGuestEmail)) {
          setGuestEmailError(true);
          errors.push("Please enter a valid email address");
          isValid = false;
        }
      }
      if (!trimmedGuestPhone) {
        setGuestPhoneError(true);
        errors.push("Please enter your phone number");
        isValid = false;
      } else {
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(trimmedGuestPhone)) {
          setGuestPhoneError(true);
          errors.push("Please enter a valid 10-digit phone number");
          isValid = false;
        }
      }
    }

    if (errors.length > 1) {
      Toastify.error("Please fill in the required information");
    } else if (errors.length === 1) {
      Toastify.error(errors[0]);
    }

    return isValid;
  };

  const handleNextStep = (currentStep) => {
    if (currentStep === 1 && !validateFields()) return;
    setActiveStep(currentStep + 1);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;
    if (!shippingMethod) {
      setError("Please select a shipping method.");
      Toastify.error("Please select a shipping method.");
      return;
    }
    if (shippingMethod === "store_pickup" && !storeId) {
      setError("Please select a store for pickup.");
      Toastify.error("Please select a store for pickup.");
      return;
    }
    if (!paymentMethod) {
      setError("Please select a payment method.");
      Toastify.error("Please select a payment method.");
      return;
    }

    if (!cartItems.length) {
      setError("Your cart is empty.");
      Toastify.error("Your cart is empty.");
      return;
    }

    const shippingAddress = shippingMethod === "store_pickup" ? null : address;
    const totalAmount = subtotal - discount + shippingCost;

    try {
      const orderData = {
        user_id: user ? user.user_id : null,
        guest_email: user ? null : guestEmail.trim() || null,
        guest_phone: user ? null : guestPhone.trim() || null,
        total_amount: totalAmount / exchangeRate,
        discount_amount: discount / exchangeRate,
        shipping_address: shippingAddress,
        shipping_method: shippingMethod,
        shipping_cost: shippingCost / exchangeRate,
        store_id: shippingMethod === "store_pickup" ? parseInt(storeId) : null,
        payment_method: paymentMethod,
        order_details: cartItems.map((item) => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
          price_at_purchase: parseFloat(item.price),
        })),
        promotion_id: promotionId || null,
      };

      const response = await api.post("/orders.php", orderData);
      if (response.data.status === "success") {
        const endpoint = user ? "/carts.php" : "/guest_carts.php";
        const payload = user
          ? { user_id: user.user_id }
          : { session_key: sessionKey };
        try {
          const deleteResponse = await api.delete(endpoint, { data: payload });
          if (deleteResponse.data.status !== "success") {
            console.warn("Failed to clear cart:", deleteResponse.data.message);
            Toastify.warning("Order placed, but failed to clear cart.");
          }
        } catch (err) {
          console.warn("Error clearing cart:", err);
          Toastify.warning("Order placed, but failed to clear cart.");
        }

        setCartItems([]);
        Toastify.success("Order placed successfully!");
        navigate("/ordersuccess", {
          state: {
            order: {
              ...response.data.data,
              details: cartItems.map((item) => ({
                detail_id: `${response.data.data.order_id}_${item.product_id}`,
                product_id: item.product_id,
                name: item.name,
                quantity: item.quantity,
                price_at_purchase: item.price,
              })),
              shipping_method: shippingMethod,
              payment_method: paymentMethod,
              shipping_cost: shippingCost / exchangeRate,
              store_id: storeId,
              promotions: promotionId
                ? [{ code: promoCode, applied_discount: discount / exchangeRate }]
                : [],
              discount_amount: discount / exchangeRate,
            },
          },
        });
      } else {
        setError(
          `Failed to place order: ${response.data.message || "Unknown error"}`
        );
        Toastify.error(
          `Failed to place order: ${response.data.message || "Unknown error"}`
        );
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Network or server error";
      setError(`Failed to place order: ${errorMsg}`);
      Toastify.error(`Failed to place order: ${errorMsg}`);
      console.error("Order Placement Error:", err);
    }
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (cartItems.length === 0)
    return <div className="text-center py-4">Your cart is empty.</div>;

  const shippingOptions = [
    { value: "standard", label: "Standard Shipping (Free)" },
    { value: "fast", label: "Fast Shipping (₫50,000)" },
    { value: "express", label: "Express Shipping (₫100,000)" },
    { value: "store_pickup", label: "Store Pickup (Free)" },
  ];

  const paymentOptions = [
    { value: "cod", label: "Cash on Delivery (COD)" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "momo", label: "Momo E-Wallet" },
    { value: "vnpay", label: "VNPay (ATM / QR / Visa)" },
    { value: "zalopay", label: "ZaloPay" },
  ];

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6">Checkout</h1>
          <p className="text-right text-sm font-semibold">
            Order subtotal ({cartItems.length} items):{" "}
            {formatCurrency(subtotal)}
          </p>
          {error && (
            <div className="text-red-500 text-center mb-4">{error}</div>
          )}
          <div className="mt-6 space-y-6">
            <div className="bg-white p-6 rounded shadow">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                    activeStep >= 1
                      ? "bg-black text-white"
                      : "border border-gray-400 text-gray-600"
                  }`}
                >
                  1
                </div>
                <h2 className="text-lg font-bold">Shipping Address</h2>
              </div>
              {activeStep === 1 && (
                <>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <input
                        type="text"
                        placeholder="Full name *"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          setFullNameError(false);
                        }}
                        className={`border p-2 rounded w-full ${
                          fullNameError
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <input
                        type="text"
                        placeholder="Address *"
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          setAddressError(false);
                        }}
                        className={`border p-2 rounded w-full ${
                          addressError
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        required
                        disabled={shippingMethod === "store_pickup"}
                      />
                    </div>
                    {!user && (
                      <div className="grid grid-cols-1 gap-4">
                        <input
                          type="email"
                          placeholder="Email *"
                          value={guestEmail}
                          onChange={(e) => {
                            setGuestEmail(e.target.value);
                            setGuestEmailError(false);
                          }}
                          className={`border p-2 rounded w-full ${
                            guestEmailError
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          required
                        />
                        <input
                          type="tel"
                          placeholder="Phone *"
                          value={guestPhone}
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(
                              /\D/g,
                              ""
                            );
                            setGuestPhone(numericValue);
                            setGuestPhoneError(false);
                          }}
                          className={`border p-2 rounded w-full ${
                            guestPhoneError
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          required
                          inputMode="numeric"
                          pattern="[0-9]*"
                        />
                      </div>
                    )}
                    <button
                      onClick={() => handleNextStep(1)}
                      className="mt-4 bg-black text-white py-2 px-4 rounded hover:bg-gray-800 w-full"
                    >
                      Proceed to Shipping Method
                    </button>
                  </div>
                </>
              )}
            </div>
            <div className="bg-white p-6 rounded shadow">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                    activeStep >= 2
                      ? "bg-black text-white"
                      : "border border-gray-400 text-gray-600"
                  }`}
                >
                  2
                </div>
                <h2 className="text-lg font-bold">Shipping Method</h2>
              </div>
              {activeStep === 2 && (
                <div className="space-y-4">
                  {shippingOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={option.value}
                        checked={shippingMethod === option.value}
                        onChange={(e) => {
                          setShippingMethod(e.target.value);
                          if (e.target.value === "store_pickup") {
                            setAddress("");
                          }
                          if (e.target.value !== "store_pickup")
                            setStoreId(null);
                        }}
                        className="form-radio"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                  {shippingMethod === "store_pickup" && (
                    <div className="mt-4">
                      <select
                        value={storeId || ""}
                        onChange={(e) =>
                          setStoreId(
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        className="border p-2 rounded w-full"
                        required
                      >
                        <option value="">Select a store *</option>
                        {stores.map((store) => (
                          <option key={store.store_id} value={store.store_id}>
                            {store.name} - {store.address}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <button
                    onClick={() => handleNextStep(2)}
                    className="mt-4 bg-black text-white py-2 px-4 rounded hover:bg-gray-800 w-full"
                  >
                    Proceed to Payment
                  </button>
                </div>
              )}
            </div>
            <div className="bg-white p-6 rounded shadow">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                    activeStep >= 3
                      ? "bg-black text-white"
                      : "border border-gray-400 text-gray-600"
                  }`}
                >
                  3
                </div>
                <h2 className="text-lg font-bold">Payment</h2>
              </div>
              {activeStep === 3 && (
                <div className="space-y-4">
                  {paymentOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={option.value}
                        checked={paymentMethod === option.value}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="form-radio"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                  <button
                    onClick={handlePlaceOrder}
                    className="mt-4 bg-black text-white py-2 px-4 rounded hover:bg-gray-800 w-full"
                  >
                    Place Order
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
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
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shippingMethod === "fast"
                    ? "₫50,000"
                    : shippingMethod === "express"
                    ? "₫100,000"
                    : "FREE"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated tax</span>
                <span>--</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span>Discount ({promoCode})</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(subtotal - discount + shippingCost)}</span>
              </div>
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
                  {item.name}{" "}
                  <span>{formatCurrency(item.price * exchangeRate)}</span>
                </div>
                {item.color && item.color !== "N/A" && (
                  <p className="text-sm text-gray-600">
                    Color: {item.color}
                  </p>
                )}
                {item.size && item.size !== "N/A" && (
                  <p className="text-sm text-gray-600">Size: {item.size}</p>
                )}
                <p className="text-sm text-gray-600">
                  Quantity: {item.quantity}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}