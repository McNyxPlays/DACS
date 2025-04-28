import { useState } from "react";

function MobileFilterSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    document.body.style.overflow = isOpen ? "auto" : "hidden";
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
                <li className="flex items-center">
                  <label className="custom-checkbox">
                    <input type="checkbox" defaultChecked />
                    <span className="checkmark"></span>
                  </label>
                  <span className="ml-2 text-gray-700">All Categories</span>
                  <span className="ml-auto text-gray-500 text-sm">(248)</span>
                </li>
                <li className="flex items-center">
                  <label className="custom-checkbox">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                  </label>
                  <span className="ml-2 text-gray-700">Gundam Kits</span>
                  <span className="ml-auto text-gray-500 text-sm">(86)</span>
                </li>
                <li className="flex items-center">
                  <label className="custom-checkbox">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                  </label>
                  <span className="ml-2 text-gray-700">Anime Figures</span>
                  <span className="ml-auto text-gray-500 text-sm">(52)</span>
                </li>
                <li className="flex items-center">
                  <label className="custom-checkbox">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                  </label>
                  <span className="ml-2 text-gray-700">DIY Models</span>
                  <span className="ml-auto text-gray-500 text-sm">(38)</span>
                </li>
                <li className="flex items-center">
                  <label className="custom-checkbox">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                  </label>
                  <span className="ml-2 text-gray-700">Tools & Paints</span>
                  <span className="ml-auto text-gray-500 text-sm">(45)</span>
                </li>
                <li className="flex items-center">
                  <label className="custom-checkbox">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                  </label>
                  <span className="ml-2 text-gray-700">Game Figures</span>
                  <span className="ml-auto text-gray-500 text-sm">(27)</span>
                </li>
              </ul>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
              <div className="px-1">
                <input
                  type="range"
                  min="0"
                  max="500"
                  defaultValue="200"
                  className="price-slider"
                  id="mobilePriceRange"
                />
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>$0</span>
                  <span id="mobilePriceValue">$200</span>
                  <span>$500+</span>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Brands</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <label className="custom-checkbox">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                  </label>
                  <span className="ml-2 text-gray-700">Bandai</span>
                </li>
                <li className="flex items-center">
                  <label className="custom-checkbox">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                  </label>
                  <span className="ml-2 text-gray-700">Kotobukiya</span>
                </li>
                <li className="flex items-center">
                  <label className="custom-checkbox">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                  </label>
                  <span className="ml-2 text-gray-700">Good Smile Company</span>
                </li>
                <li className="flex items-center">
                  <label className="custom-checkbox">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                  </label>
                  <span className="ml-2 text-gray-700">Tamiya</span>
                </li>
                <li className="flex items-center">
                  <label className="custom-checkbox">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                  </label>
                  <span className="ml-2 text-gray-700">Max Factory</span>
                </li>
              </ul>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Ratings</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <label className="custom-checkbox">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                  </label>
                  <div className="ml-2 flex items-center">
                    <div className="flex text-amber-400">
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                    </div>
                    <span className="ml-1 text-gray-700">(5.0)</span>
                  </div>
                </li>
                <li className="flex items-center">
                  <label className="custom-checkbox">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                  </label>
                  <div className="ml-2 flex items-center">
                    <div className="flex text-amber-400">
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-line"></i>
                    </div>
                    <span className="ml-1 text-gray-700">(4.0 & up)</span>
                  </div>
                </li>
                <li className="flex items-center">
                  <label className="custom-checkbox">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                  </label>
                  <div className="ml-2 flex items-center">
                    <div className="flex text-amber-400">
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-line"></i>
                      <i className="ri-star-line"></i>
                    </div>
                    <span className="ml-1 text-gray-700">(3.0 & up)</span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Availability</h3>
              <ul className="space-y-2">
                <li className="flex items-center justify-between">
                  <span className="text-gray-700">In Stock</span>
                  <label className="custom-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="switch-slider"></span>
                  </label>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-gray-700">On Sale</span>
                  <label className="custom-switch">
                    <input type="checkbox" />
                    <span className="switch-slider"></span>
                  </label>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-gray-700">New Arrivals</span>
                  <label className="custom-switch">
                    <input type="checkbox" />
                    <span className="switch-slider"></span>
                  </label>
                </li>
              </ul>
            </div>
            <div className="pt-6 flex flex-col gap-3">
              <button className="w-full bg-primary text-white py-2 font-medium rounded-button hover:bg-primary/90 transition">
                Apply Filters
              </button>
              <button className="w-full bg-gray-100 text-gray-700 py-2 font-medium rounded-button hover:bg-gray-200 transition">
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
