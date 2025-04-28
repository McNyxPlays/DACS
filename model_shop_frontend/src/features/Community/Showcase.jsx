import React from "react";

const Showcase = () => {
  return (
    <div id="showcase" className="bg-white rounded-lg shadow-sm mb-6 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Build Showcase</h2>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700">
            <span>All Categories</span>
            <i className="ri-arrow-down-s-line"></i>
          </button>
          <button className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition">
            <i className="ri-add-line mr-1"></i>Share Build
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-lg overflow-hidden group">
          <div className="relative h-60">
            <img
              src="showcase-image.jpg"
              alt="Gundam Model"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
              <div className="p-4 w-full">
                <h3 className="text-white font-medium">
                  Strike Freedom Gundam
                </h3>
                <div className="flex items-center justify-between text-white/80 text-sm">
                  <span>By James Wilson</span>
                  <div className="flex items-center gap-2">
                    <i className="ri-heart-fill"></i>
                    <span>156</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="user-profile.jpg"
                  alt="User Profile"
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-medium text-gray-900">James Wilson</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500">
                <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full">
                  <i className="ri-heart-line"></i>
                </button>
                <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full">
                  <i className="ri-chat-1-line"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Thêm các mục khác */}
      </div>
      <div className="text-center mt-6">
        <button className="text-primary font-medium hover:underline">
          View More Builds
        </button>
      </div>
    </div>
  );
};

export default Showcase;
