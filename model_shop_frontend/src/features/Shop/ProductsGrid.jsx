import { useEffect, useState } from "react";

function ProductsGrid() {
  const [viewMode, setViewMode] = useState("grid");
  const [sortOption, setSortOption] = useState("Popularity");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const products = [
    {
      id: 1,
      name: "RX-78-2 Gundam Ver. 3.0",
      description: "Master Grade 1/100 Scale",
      price: 54.99,
      image:
        "https://readdy.ai/api/search-image?query=professional%2520product%2520photo%2520of%2520a%2520Gundam%2520model%2520kit%2520box%2520and%2520assembled%2520robot%2520figure%252C%2520high%2520quality%252C%2520detailed%252C%2520studio%2520lighting%252C%2520white%2520background%252C%2520commercial%2520product%2520photography%2520style&width=500&height=500&seq=1001&orientation=squarish",
      rating: 4.5,
      reviews: 42,
      badge: "New Arrival",
      badgeColor: "bg-primary",
    },
    // Thêm các sản phẩm khác tương tự...
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest("#sortDropdown")) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSortSelect = (option) => {
    setSortOption(option);
    setIsSortOpen(false);
  };

  return (
    <div className="flex-1">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-gray-700">248 products</span>
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
                    "Rating",
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
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1">
              Gundam Kits
              <button className="w-4 h-4 flex items-center justify-center rounded-full bg-primary text-white text-xs">
                <i className="ri-close-line"></i>
              </button>
            </span>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1">
              $0 - $200
              <button className="w-4 h-4 flex items-center justify-center rounded-full bg-primary text-white text-xs">
                <i className="ri-close-line"></i>
              </button>
            </span>
          </div>
        </div>
      </div>
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
            key={product.id}
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
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-300"
              />
              <span
                className={`absolute top-3 left-3 ${product.badgeColor} text-white text-xs font-medium px-2 py-1 rounded`}
              >
                {product.badge}
              </span>
              <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium transform -translate-y-2 group-hover:translate-y-0 transition-transform rounded-button">
                  Quick View
                </button>
              </div>
            </div>
            <div
              className={
                viewMode === "grid"
                  ? "p-4"
                  : "flex-1 p-6 flex flex-col justify-between"
              }
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <i
                      key={i}
                      className={
                        i < Math.floor(product.rating)
                          ? "ri-star-fill"
                          : i < product.rating
                          ? "ri-star-half-fill"
                          : "ri-star-line"
                      }
                    ></i>
                  ))}
                  <span className="text-gray-600 text-sm ml-1">
                    ({product.reviews})
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  {product.name}
                </h3>
                <p className="text-gray-500 text-sm mb-3">
                  {product.description}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                <button className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full hover:bg-primary hover:text-white transition rounded-button">
                  <i className="ri-shopping-cart-line"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <div className="flex items-center gap-2">
          <a
            href="#"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            <i className="ri-arrow-left-s-line"></i>
          </a>
          <a
            href="#"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white"
          >
            1
          </a>
          <a
            href="#"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            2
          </a>
          <a
            href="#"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            3
          </a>
          <span className="w-10 h-10 flex items-center justify-center text-gray-500">
            ...
          </span>
          <a
            href="#"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            12
          </a>
          <a
            href="#"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            <i className="ri-arrow-right-s-line"></i>
          </a>
        </div>
      </div>
    </div>
  );
}

export default ProductsGrid;
