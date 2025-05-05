import React, { useState, useEffect } from "react";
import api from "../../api/index";

function FiltersSidebar({ onFilterChange }) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [statusNew, setStatusNew] = useState(false);
  const [statusUsed, setStatusUsed] = useState(false);
  const [statusCustom, setStatusCustom] = useState(false);
  const [statusHot, setStatusHot] = useState(false);
  const [statusAvailable, setStatusAvailable] = useState(false);
  const [statusSale, setStatusSale] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/products.php?action=categories");
        if (response.data.status === "success") {
          setCategories(response.data.data);
        } else {
          setError("Failed to fetch categories");
        }
      } catch (err) {
        setError(
          "Failed to fetch categories: " + (err.message || "Unknown error")
        );
        console.error(err);
      }
    };

    const fetchBrands = async () => {
      try {
        const response = await api.get("/products.php?action=brands");
        if (response.data.status === "success") {
          setBrands(response.data.data);
        } else {
          setError("Failed to fetch brands");
        }
      } catch (err) {
        setError("Failed to fetch brands: " + (err.message || "Unknown error"));
        console.error(err);
      }
    };

    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    onFilterChange({
      category_ids: selectedCategories,
      brand_ids: selectedBrands,
      min_rating: minRating,
      status_new: statusNew,
      status_used: statusUsed,
      status_custom: statusCustom,
      status_hot: statusHot,
      status_available: statusAvailable,
      status_sale: statusSale,
    });
  }, [
    selectedCategories,
    selectedBrands,
    minRating,
    statusNew,
    statusUsed,
    statusCustom,
    statusHot,
    statusAvailable,
    statusSale,
  ]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleBrandChange = (brandId) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId]
    );
  };

  const handleRatingChange = (rating) => {
    setMinRating(minRating === rating ? 0 : rating);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMinRating(0);
    setStatusNew(false);
    setStatusUsed(false);
    setStatusCustom(false);
    setStatusHot(false);
    setStatusAvailable(false);
    setStatusSale(false);
  };

  return (
    <div id="filterSidebar" className="w-full md:w-64 lg:w-72 md:block">
      <div className="bg-white rounded-lg shadow-sm p-6">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.category_id} className="flex items-center">
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.category_id)}
                    onChange={() => handleCategoryChange(category.category_id)}
                  />
                  <span className="checkmark"></span>
                </label>
                <span className="ml-2 text-gray-700">{category.name}</span>
                <span className="ml-auto text-gray-500 text-sm">
                  ({category.product_count})
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-6 border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Brands</h3>
          <ul className="space-y-2">
            {brands.map((brand) => (
              <li key={brand.brand_id} className="flex items-center">
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand.brand_id)}
                    onChange={() => handleBrandChange(brand.brand_id)}
                  />
                  <span className="checkmark"></span>
                </label>
                <span className="ml-2 text-gray-700">{brand.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-6 border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Ratings</h3>
          <ul className="space-y-2">
            {[5, 4, 3].map((rating) => (
              <li key={rating} className="flex items-center">
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={minRating === rating}
                    onChange={() => handleRatingChange(rating)}
                  />
                  <span className="checkmark"></span>
                </label>
                <div className="ml-2 flex items-center">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }, (_, i) => (
                      <i
                        key={i}
                        className={i < rating ? "ri-star-fill" : "ri-star-line"}
                      ></i>
                    ))}
                  </div>
                  <span className="ml-1 text-gray-700">({rating}.0 & up)</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-6 border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Status</h3>
          <ul className="space-y-2">
            <li className="flex items-center justify-between">
              <span className="text-gray-700">New</span>
              <label className="custom-switch">
                <input
                  type="checkbox"
                  checked={statusNew}
                  onChange={() => setStatusNew(!statusNew)}
                />
                <span className="switch-slider"></span>
              </label>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-gray-700">Used</span>
              <label className="custom-switch">
                <input
                  type="checkbox"
                  checked={statusUsed}
                  onChange={() => setStatusUsed(!statusUsed)}
                />
                <span className="switch-slider"></span>
              </label>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-gray-700">Custom</span>
              <label className="custom-switch">
                <input
                  type="checkbox"
                  checked={statusCustom}
                  onChange={() => setStatusCustom(!statusCustom)}
                />
                <span className="switch-slider"></span>
              </label>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-gray-700">Hot</span>
              <label className="custom-switch">
                <input
                  type="checkbox"
                  checked={statusHot}
                  onChange={() => setStatusHot(!statusHot)}
                />
                <span className="switch-slider"></span>
              </label>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-gray-700">Available</span>
              <label className="custom-switch">
                <input
                  type="checkbox"
                  checked={statusAvailable}
                  onChange={() => setStatusAvailable(!statusAvailable)}
                />
                <span className="switch-slider"></span>
              </label>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-gray-700">On Sale</span>
              <label className="custom-switch">
                <input
                  type="checkbox"
                  checked={statusSale}
                  onChange={() => setStatusSale(!statusSale)}
                />
                <span className="switch-slider"></span>
              </label>
            </li>
          </ul>
        </div>
        <button
          onClick={clearFilters}
          className="w-full bg-gray-100 text-gray-700 py-2 font-medium rounded-button hover:bg-gray-200 transition"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
}

export default FiltersSidebar;
