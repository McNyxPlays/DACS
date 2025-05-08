import React, { useState, useEffect } from "react";
import api from "../../api/index";
import { Toastify } from "../../components/Toastify";

function QuickViewModal({ productId, isOpen, toggleModal }) {
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const exchangeRate = 25000; // 1 USD = 25,000 VND
  const sessionKey =
    sessionStorage.getItem("guest_session_key") ||
    (() => {
      const newSessionKey = `guest_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      sessionStorage.setItem("guest_session_key", newSessionKey);
      return newSessionKey;
    })();
  const [user, setUser] = useState(
    JSON.parse(sessionStorage.getItem("user") || "null")
  );

  useEffect(() => {
    const validateUser = async () => {
      if (user && user.user_id) {
        try {
          const response = await api.get("/user.php");
          if (response.data.status === "success" && response.data.user) {
            setUser(response.data.user);
            sessionStorage.setItem("user", JSON.stringify(response.data.user));
          } else {
            setUser(null);
            sessionStorage.removeItem("user");
          }
        } catch (err) {
          console.error("User validation error:", err);
          setUser(null);
          sessionStorage.removeItem("user");
        }
      }
    };
    validateUser();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && productId) {
      const fetchProduct = async () => {
        setLoading(true);
        try {
          const response = await api.get(
            `/products.php?action=product&id=${productId}`
          );
          if (response.data.status === "success") {
            setProduct(response.data.data);
            setError("");
          } else {
            const errorMsg = response.data.message || "Product not found";
            setError(errorMsg);
            Toastify.error(errorMsg);
            setProduct(null);
          }
        } catch (err) {
          const errorMsg =
            err.response?.data?.message ||
            err.message ||
            "Network or server error";
          setError(`Failed to fetch product: ${errorMsg}`);
          Toastify.error(`Failed to fetch product: ${errorMsg}`);
          console.error("Fetch product error:", {
            error: err,
            response: err.response,
            status: err.response?.status,
            data: err.response?.data,
          });
          setProduct(null);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [isOpen, productId]);

  const handleQuantityChange = (delta) => {
    setQuantity((prev) =>
      Math.max(
        1,
        Math.min(prev + delta, product ? product.stock_quantity : prev)
      )
    );
  };

  const handleAddToCart = async () => {
    if (!product) {
      Toastify.error("No product selected");
      return;
    }
    if (product.stock_quantity < quantity) {
      setError("Insufficient stock");
      Toastify.error("Insufficient stock");
      return;
    }
    try {
      const payload = user
        ? { user_id: user.user_id, product_id: productId, quantity }
        : { session_key: sessionKey, product_id: productId, quantity };
      const endpoint = user ? "/carts.php" : "/guest_carts.php";
      const response = await api.post(endpoint, payload);
      if (response.data.status === "success") {
        const event = new CustomEvent("cartUpdated");
        window.dispatchEvent(event);
        Toastify.success(`Added ${quantity} ${product.name} to cart!`);
        setError("");
      } else {
        const errorMsg = response.data.message || "Unknown error";
        setError(`Failed to add to cart: ${errorMsg}`);
        Toastify.error(`Failed to add to cart: ${errorMsg}`);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Network or server error";
      setError(`Failed to add to cart: ${errorMsg}`);
      Toastify.error(`Failed to add to cart: ${errorMsg}`);
      console.error("Add to cart error:", {
        error: err,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
        payload,
        endpoint,
      });
    }
  };

  const handleAddToWishlist = async () => {
    if (!product) {
      Toastify.error("No product selected");
      return;
    }
    if (!user || !user.user_id) {
      Toastify.error("Please log in to add to wishlist");
      return;
    }
    try {
      const payload = { user_id: user.user_id, product_id: productId };
      const response = await api.post("/favorites.php", payload);
      if (response.data.status === "success") {
        const event = new CustomEvent("favoritesUpdated");
        window.dispatchEvent(event);
        Toastify.success(`Added ${product.name} to wishlist!`);
        setError("");
      } else {
        const errorMsg = response.data.message || "Unknown error";
        setError(`Failed to add to wishlist: ${errorMsg}`);
        Toastify.error(`Failed to add to wishlist: ${errorMsg}`);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Network or server error";
      setError(`Failed to add to wishlist: ${errorMsg}`);
      Toastify.error(`Failed to add to wishlist: ${errorMsg}`);
      console.error("Add to wishlist error:", {
        error: err,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
        payload,
        user: user,
      });
    }
  };

  return (
    <div
      id="quickViewModal"
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ${
        isOpen ? "" : "hidden"
      }`}
      onClick={toggleModal}
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {loading && <p className="text-gray-500">Loading...</p>}
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {product && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {product.name}
                </h2>
                <button
                  id="closeQuickViewModal"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={toggleModal}
                >
                  <i className="ri-close-line ri-lg"></i>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="rounded-lg overflow-hidden mb-4">
                    <img
                      src={product.images[0] || "/placeholder.jpg"}
                      alt={product.name}
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.slice(0, 4).map((src, index) => (
                      <div
                        key={index}
                        className={`rounded-lg overflow-hidden border-2 ${
                          index === 0 ? "border-primary" : "border-gray-200"
                        }`}
                      >
                        <img
                          src={src}
                          alt={`${product.name} thumbnail`}
                          className="w-full h-auto"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-4">
                    {product.badge && (
                      <span
                        className={`inline-block ${
                          product.badgeColor
                        }/10 text-${
                          product.badgeColor === "bg-red-500"
                            ? "red-500"
                            : product.badgeColor === "bg-green-500"
                            ? "green-500"
                            : "primary"
                        } text-xs px-2 py-1 rounded-full ml-2`}
                      >
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-gray-900">
                      {(product.price * exchangeRate).toLocaleString("vi-VN")}{" "}
                      VND
                    </span>
                    {product.discount > 0 && (
                      <span className="text-sm text-gray-500 ml-2">
                        (Save{" "}
                        {(product.discount * exchangeRate).toLocaleString(
                          "vi-VN"
                        )}{" "}
                        VND)
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-6">{product.description}</p>
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Details:
                    </h3>
                    <ul className="list-disc pl-5 text-gray-700 space-y-1">
                      <li>Category: {product.category_name}</li>
                      <li>Brand: {product.brand_name}</li>
                      <li>Status: {product.status}</li>
                      <li>
                        Stock:{" "}
                        {product.stock_quantity > 0
                          ? `${product.stock_quantity} in stock`
                          : "Out of stock"}
                      </li>
                    </ul>
                  </div>
                  <div className="mb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <button
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 text-gray-500 rounded-l-lg"
                          onClick={() => handleQuantityChange(-1)}
                          disabled={product.stock_quantity <= 0}
                        >
                          <i className="ri-subtract-line"></i>
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          min="1"
                          max={product.stock_quantity}
                          className="w-12 h-8 border-y border-gray-300 text-center text-gray-700 focus:outline-none"
                          onChange={(e) =>
                            setQuantity(
                              Math.max(
                                1,
                                Math.min(
                                  parseInt(e.target.value) || 1,
                                  product.stock_quantity
                                )
                              )
                            )
                          }
                          disabled={product.stock_quantity <= 0}
                        />
                        <button
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 text-gray-500 rounded-r-lg"
                          onClick={() => handleQuantityChange(1)}
                          disabled={product.stock_quantity <= 0}
                        >
                          <i className="ri-add-line"></i>
                        </button>
                      </div>
                      <button
                        onClick={handleAddToCart}
                        className={`flex-1 py-2 font-medium rounded-button transition flex items-center justify-center gap-2 ${
                          product.stock_quantity <= 0
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-primary text-white hover:bg-primary/90"
                        }`}
                        disabled={product.stock_quantity <= 0}
                      >
                        <i className="ri-shopping-cart-line"></i>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleAddToWishlist}
                      className={`flex items-center gap-2 transition ${
                        user && user.user_id
                          ? "text-gray-700 hover:text-primary"
                          : "text-gray-400 cursor-not-allowed"
                      }`}
                      disabled={!user || !user.user_id}
                      title={
                        user && user.user_id
                          ? "Add to Wishlist"
                          : "Log in to add to wishlist"
                      }
                    >
                      <i className="ri-heart-line"></i>
                      Add to Wishlist
                    </button>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <button className="flex items-center gap-2 text-gray-700 hover:text-primary transition">
                      <i className="ri-share-line"></i>
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuickViewModal;
