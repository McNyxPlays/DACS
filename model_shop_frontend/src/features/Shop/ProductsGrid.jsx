import React, { useState, useEffect } from "react";
import api from "../../api/index";
import QuickViewModal from "./QuickViewModal";
import { Toastify } from "../../components/Toastify";

function ProductsGrid({ viewMode, filters, setFilters, categories, brands }) {
  const [sortOption, setSortOption] = useState("Popularity");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_products: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickViewProductId, setQuickViewProductId] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
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
  const user = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest("#sortDropdown")) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [filters, sortOption, currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        category_ids: filters.category_ids.join(","),
        brand_ids: filters.brand_ids.join(","),
        sort:
          sortOption === "Price: Low to High"
            ? "price_low"
            : sortOption === "Price: High to Low"
            ? "price_high"
            : sortOption === "Newest First"
            ? "newest"
            : "popularity",
        page: currentPage,
      };
      const response = await api.get("/products.php", { params });
      if (response.data.status === "success") {
        setProducts(response.data.data);
        setPagination(response.data.pagination);
        setError("");
      } else {
        const errorMsg = response.data.message || "Unknown error";
        setProducts([]);
        setError(`Failed to fetch products: ${errorMsg}`);
        Toastify.error(`Failed to fetch products: ${errorMsg}`);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Network or server error";
      setProducts([]);
      setError(`Failed to fetch products: ${errorMsg}`);
      Toastify.error(`Failed to fetch products: ${errorMsg}`);
      console.error("Fetch products error:", {
        error: err,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSortSelect = (option) => {
    setSortOption(option);
    setIsSortOpen(false);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const toggleQuickView = (productId) => {
    setQuickViewProductId(productId);
    setIsQuickViewOpen(!isQuickViewOpen);
  };

  const handleRemoveCategory = (id) => {
    setFilters((prev) => ({
      ...prev,
      category_ids: prev.category_ids.filter((cid) => cid !== id),
    }));
  };

  const handleRemoveBrand = (id) => {
    setFilters((prev) => ({
      ...prev,
      brand_ids: prev.brand_ids.filter((bid) => bid !== id),
    }));
  };

  const handleAddToCart = async (productId) => {
    const product = products.find((p) => p.product_id === productId);
    if (!product) {
      Toastify.error("Product not found");
      console.log("Product not found for ID:", productId);
      return;
    }
    if (product.stock_quantity <= 0) {
      setError("Product is out of stock");
      Toastify.error("Product is out of stock");
      return;
    }
    try {
      const payload = user
        ? { user_id: user.user_id, product_id: productId, quantity: 1 }
        : { session_key: sessionKey, product_id: productId, quantity: 1 };
      const endpoint = user ? "/carts.php" : "/guest_carts.php";
      const response = await api.post(endpoint, payload);
      console.log("Add to cart response:", response.data);
      if (response.data.status === "success") {
        setProducts((prevProducts) =>
          prevProducts.map((p) =>
            p.product_id === productId
              ? { ...p, stock_quantity: p.stock_quantity - 1 }
              : p
          )
        );
        const event = new CustomEvent("cartUpdated");
        window.dispatchEvent(event);
        Toastify.success(`Added ${product.name} to cart!`);
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

  return (
    <div className="flex-1">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-gray-700">
              {pagination.total_products} products
            </span>
            <div className="h-4 w-px bg-gray-300 mx-1"></div>
            <div className="flex items-center gap-2">
              <span className="text-gray-700 text-sm">Sort by:</span>
              <div className="relative">
                <button
                  id="sortDropdown"
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white rounded-button"
                  onClick={() => setIsSortOpen(!isSortOpen)}
                >
                  <span>{sortOption}</span>
                  <i className="ri-arrow-down-s-line"></i>
                </button>
                <div
                  id="sortOptions"
                  className={`absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg py-2 z-10 ${
                    isSortOpen ? "" : "hidden"
                  }`}
                >
                  {[
                    "Popularity",
                    "Newest First",
                    "Price: Low to High",
                    "Price: High to Low",
                  ].map((option) => (
                    <button
                      key={option}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => handleSortSelect(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.category_ids.map((id) => {
              const category = categories.find((c) => c.category_id == id);
              return category ? (
                <span
                  key={id}
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {category.name}
                  <button
                    onClick={() => handleRemoveCategory(id)}
                    className="w-4 h-4 flex items-center justify-center rounded-full bg-primary text-white text-xs"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </span>
              ) : null;
            })}
            {filters.brand_ids.map((id) => {
              const brand = brands.find((b) => b.brand_id == id);
              return brand ? (
                <span
                  key={id}
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {brand.name}
                  <button
                    onClick={() => handleRemoveBrand(id)}
                    className="w-4 h-4 flex items-center justify-center rounded-full bg-primary text-white text-xs"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </span>
              ) : null;
            })}
          </div>
        </div>
      </div>
      {loading && <p className="text-gray-500">Loading products...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div
        id="productsContainer"
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "flex flex-col gap-6"
        }
      >
        {products.map((product) => (
          <div
            key={product.product_id}
            className={
              viewMode === "grid"
                ? "bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition group"
                : "bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition group flex"
            }
          >
            <div
              className={
                viewMode === "grid"
                  ? "relative h-64 overflow-hidden"
                  : "relative w-80 overflow-hidden"
              }
            >
              <img
                src={product.image || "/placeholder.jpg"}
                alt={product.name}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-300"
              />
              {product.badge && (
                <span
                  className={`absolute top-3 left-3 ${product.badgeColor} text-white text-xs font-medium px-2 py-1 rounded`}
                >
                  {product.badge}
                </span>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => toggleQuickView(product.product_id)}
                  className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium transform -translate-y-2 group-hover:translate-y-0 transition-transform rounded-button"
                >
                  Quick View
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
              <p className="text-gray-500 text-sm mb-3">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 text-lg">
                  {(product.price * exchangeRate).toLocaleString("vi-VN")} VND
                </span>
                <button
                  onClick={() => handleAddToCart(product.product_id)}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full hover:bg-primary hover:text-white transition rounded-button"
                  disabled={product.stock_quantity <= 0}
                >
                  <i className="ri-shopping-cart-line"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
          >
            <i className="ri-arrow-left-s-line"></i>
          </button>
          {Array.from(
            { length: Math.min(pagination.total_pages, 5) },
            (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 flex items-center justify-center rounded-full ${
                    page === currentPage
                      ? "bg-primary text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                  } transition`}
                >
                  {page}
                </button>
              );
            }
          )}
          {pagination.total_pages > 5 && (
            <span className="w-10 h-10 flex items-center justify-center text-gray-500">
              ...
            </span>
          )}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.total_pages}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
          >
            <i className="ri-arrow-right-s-line"></i>
          </button>
        </div>
      </div>
      <QuickViewModal
        productId={quickViewProductId}
        isOpen={isQuickViewOpen}
        toggleModal={() => toggleQuickView(null)}
      />
    </div>
  );
}

export default ProductsGrid;
