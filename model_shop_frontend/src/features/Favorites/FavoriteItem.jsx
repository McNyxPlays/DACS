import React from "react";

function FavoriteItem({ item, onRemove }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition group relative">
      <div className="relative h-64 overflow-hidden">
        <img
          src={item.image_url || "/placeholder.jpg"}
          alt={item.name}
          className="w-full h-full object-contain object-center group-hover:scale-105 transition duration-300"
        />
        <button
          onClick={() => onRemove(item.favorite_id)}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 hover:text-gray-800 transition"
        >
          <i className="ri-close-line"></i>
        </button>
      </div>
      <div className="p-4 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-1 uppercase">
          {item.name}
        </h3>
      </div>
    </div>
  );
}

export default FavoriteItem;
