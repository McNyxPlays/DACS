import React, { useState } from "react";

function MobileFilterSidebar({ filters, setFilters, categories, brands }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    document.body.style.overflow = isOpen ? "auto" : "hidden";
  };

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

  const applyFilters = () => {
    toggleSidebar();
  };

  return (
    <>
      <button
        id="filterToggle"
        className="md:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 rounded-button whitespace-nowrap"
        onClick={toggleSidebar}
      >
        <i className="ri-filter-3-line"></i>
        <span>Filters</span>
      </button>
      <div
        id="mobileFilterSidebar"
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${
          isOpen ? "" : "hidden"
        }`}
        onClick={toggleSidebar}
      >
        <div
          className="absolute right-0 top-0 h-full w-80 bg-white p-6 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Filters</h2>
            <button
              id="closeMobileFilter"
              className="text-gray-500 hover:text-gray-700"
              onClick={toggleSidebar}
            >
              <i className="ri-close-line ri-lg"></i>
            </button>
          </div>
          <div className="space-y-6">
            <div>
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
                        onChange={() =>
                          handleCategoryChange(category.category_id)
                        }
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
            <div className="border-t border-gray-200 pt-6">
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
            <div className="border-t border-gray-200 pt-6">
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
            <div className="pt-6 flex flex-col gap-3">
              <button
                onClick={applyFilters}
                className="w-full bg-primary text-white py-2 font-medium rounded-button hover:bg-primary/90 transition"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="w-full bg-gray-100 text-gray-700 py-2 font-medium rounded-button hover:bg-gray-200 transition"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MobileFilterSidebar;
