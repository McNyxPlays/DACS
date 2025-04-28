import { useState } from "react";

function ShopBanner({ setViewMode }) {
  const [isGridView, setIsGridView] = useState(true);

  const handleGridView = () => {
    setViewMode("grid");
    setIsGridView(true);
  };

  const handleListView = () => {
    setViewMode("list");
    setIsGridView(false);
  };

  return (
    <section className="bg-white py-8 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Shop Model Kits
            </h1>
            <p className="text-gray-600">
              Discover our collection of premium model kits and accessories
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
              <span>View:</span>
              <button
                id="gridViewBtn"
                className={`w-8 h-8 flex items-center justify-center rounded rounded-button ${
                  isGridView
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={handleGridView}
              >
                <i className="ri-grid-fill"></i>
              </button>
              <button
                id="listViewBtn"
                className={`w-8 h-8 flex items-center justify-center rounded rounded-button ${
                  !isGridView
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={handleListView}
              >
                <i className="ri-list-check"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ShopBanner;
