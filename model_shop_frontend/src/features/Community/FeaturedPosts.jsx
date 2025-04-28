// components/FeaturedPosts/FeaturedPosts.jsx
import React from "react";

const FeaturedPosts = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
      <div className="flex border-b border-gray-200">
        <button className="flex-1 py-4 px-6 text-primary font-medium border-b-2 border-primary">
          Featured
        </button>
        <button className="flex-1 py-4 px-6 text-gray-600 hover:text-gray-900 transition">
          Latest
        </button>
        {/* Thêm các tab khác */}
      </div>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img
            src="user-profile.jpg"
            alt="User Profile"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-gray-500 cursor-pointer hover:bg-gray-200 transition">
            What would you like to share today?
          </div>
          <button>
            <i className="ri-image-add-line ri-lg"></i>
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="border border-gray-200 rounded-lg p-4 mb-4 post-card">
          <div className="flex justify-between mb-3">
            <div className="flex items-center gap-3">
              <img
                src="user-profile.jpg"
                alt="User Profile"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="font-medium text-gray-900">Akiko Tanaka</div>
                <div className="text-gray-500 text-sm">
                  April 10, 2025 · Public
                </div>
              </div>
            </div>
          </div>
          <p className="text-gray-800 mb-3">
            Just finished my first PG Unleashed RX-78-2 Gundam!
          </p>
          <div className="grid grid-cols-2 gap-2">
            <img
              src="gundam-image.jpg"
              alt="Gundam Model"
              className="w-full h-48 object-cover rounded-lg"
            />
            {/* Thêm hình ảnh khác */}
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-500">
              <span>128</span>
            </div>
            <div className="flex items-center gap-4 text-gray-500">
              <span>42 comments</span>
              <span>12 shares</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
            <button className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <i className="ri-thumb-up-line"></i>
              <span>Like</span>
            </button>
            {/* Thêm các nút khác */}
          </div>
        </div>
        <div className="text-center">
          <button className="text-primary font-medium hover:underline">
            View More Posts
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedPosts;
