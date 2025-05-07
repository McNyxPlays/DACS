import React from "react";

function FiltersSidebar({ filters, setFilters, categories, brands }) {
  const handleCategoryChange = (categoryId) => {
    const id = Number(categoryId);
    setFilters((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(id)
        ? prev.category_ids.filter((idNum) => idNum !== id)
        : [...prev.category_ids, id],
    }));
  };

  const handleBrandChange = (brandId) => {
    const id = Number(brandId);
    setFilters((prev) => ({
      ...prev,
      brand_ids: prev.brand_ids.includes(id)
        ? prev.brand_ids.filter((idNum) => idNum !== id)
        : [...prev.brand_ids, id],
    }));
  };

  const handleStatusChange = (statusKey) => {
    setFilters((prev) => ({
      ...prev,
      [statusKey]: !prev[statusKey],
    }));
  };

  const clearFilters = () => {
    setFilters((prev) => ({
      ...prev,
      category_ids: [],
      brand_ids: [],
      status_new: false,
      status_available: false,
      status_sale: false,
    }));
  };

  return (
    <div id="filterSidebar" className="w-full md:w-64 lg:w-72 md:block">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
          <ul className="space-y-2">
            {(categories || []).map((category) => (
              <li key={category.category_id} className="flex items-center">
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.category_ids.includes(
                      category.category_id
                    )}
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
            {(brands || []).map((brand) => (
              <li key={brand.brand_id} className="flex items-center">
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.brand_ids.includes(brand.brand_id)}
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
          <h3 className="font-semibold text-gray-900 mb-4">Status</h3>
          <ul className="space-y-2">
            <li className="flex items-center justify-between">
              <span className="text-gray-700">New</span>
              <label className="custom-switch">
                <input
                  type="checkbox"
                  checked={filters.status_new}
                  onChange={() => handleStatusChange("status_new")}
                />
                <span className="switch-slider"></span>
              </label>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-gray-700">Available</span>
              <label className="custom-switch">
                <input
                  type="checkbox"
                  checked={filters.status_available}
                  onChange={() => handleStatusChange("status_available")}
                />
                <span className="switch-slider"></span>
              </label>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-gray-700">On Sale</span>
              <label className="custom-switch">
                <input
                  type="checkbox"
                  checked={filters.status_sale}
                  onChange={() => handleStatusChange("status_sale")}
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
