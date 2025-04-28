import { useState } from "react";

function FiltersSidebar() {
  const [price, setPrice] = useState(0); // State to track the slider value

  const handlePriceChange = (e) => {
    setPrice(e.target.value); // Update the price state when the slider moves
  };

  return (
    <div id="filterSidebar" className="w-full md:w-64 lg:w-72 md:block">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
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
        <div className="mb-6 border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
          <div className="px-1">
            <input
              type="range"
              min="0"
              max="500"
              value={price}
              onChange={handlePriceChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${
                  (price / 500) * 100
                }%, #e5e7eb ${(price / 500) * 100}%, #e5e7eb 100%)`,
              }}
              id="priceRange"
            />
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>$0</span>
              <span></span>
              <span id="priceValue">${price}</span>
            </div>
          </div>
        </div>
        <div className="mb-6 border-t border-gray-200 pt-6">
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
        <div className="mb-6 border-t border-gray-200 pt-6">
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
        <div className="mb-6 border-t border-gray-200 pt-6">
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
        <button className="w-full bg-gray-100 text-gray-700 py-2 font-medium rounded-button hover:bg-gray-200 transition">
          Clear All Filters
        </button>
      </div>
    </div>
  );
}

export default FiltersSidebar;
