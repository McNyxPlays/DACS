import React from "react";

function CartItem({
  item,
  user,
  viewMode,
  exchangeRate,
  onQuantityChange,
  onRemove,
}) {
  const itemId = user ? item.cart_id : item.guest_cart_id;
  const itemPrice = item.price * exchangeRate;
  const itemTotal = itemPrice * item.quantity;

  if (viewMode === "list") {
    return (
      <tr className="border-b border-gray-200 hover:bg-gray-50">
        <td className="py-4 px-6 flex items-center gap-4">
          <div className="w-24 h-24 overflow-hidden rounded-lg">
            <img
              src={item.image || "/placeholder.jpg"}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-500">
              {item.description || "No description available"}
            </p>
            {item.badge && (
              <span
                className={`inline-block mt-1 ${item.badgeColor} text-white text-xs font-medium px-2 py-1 rounded`}
              >
                {item.badge}
              </span>
            )}
          </div>
        </td>
        <td className="py-4 px-6">
          <span className="font-medium text-gray-900">
            {itemPrice.toLocaleString("vi-VN")} VND
          </span>
        </td>
        <td className="py-4 px-6">
          <div className="flex items-center gap-2">
            <button
              className="w-8 h-8 flex items-center justify-center border border-gray-300 text-gray-500 rounded-l-lg hover:bg-gray-100"
              onClick={() => onQuantityChange(itemId, -1)}
            >
              <i className="ri-subtract-line"></i>
            </button>
            <span className="w-12 h-8 flex items-center justify-center border-y border-gray-300 text-gray-700">
              {item.quantity}
            </span>
            <button
              className="w-8 h-8 flex items-center justify-center border border-gray-300 text-gray-500 rounded-r-lg hover:bg-gray-100"
              onClick={() => onQuantityChange(itemId, 1)}
            >
              <i className="ri-add-line"></i>
            </button>
          </div>
        </td>
        <td className="py-4 px-6">
          <span className="font-medium text-gray-900">
            {itemTotal.toLocaleString("vi-VN")} VND
          </span>
        </td>
        <td className="py-4 px-6">
          <button
            onClick={() => onRemove(itemId)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Remove
          </button>
        </td>
      </tr>
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition group">
      <div className="relative h-64 overflow-hidden">
        <img
          src={item.image || "/placeholder.jpg"}
          alt={item.name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-300"
        />
        {item.badge && (
          <span
            className={`absolute top-3 left-3 ${item.badgeColor} text-white text-xs font-medium px-2 py-1 rounded`}
          >
            {item.badge}
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1 text-amber-400 mb-2">
          {Array.from({ length: 5 }, (_, i) => (
            <i
              key={i}
              className={
                i < Math.floor(item.rating || 0)
                  ? "ri-star-fill"
                  : i < (item.rating || 0)
                  ? "ri-star-half-fill"
                  : "ri-star-line"
              }
            ></i>
          ))}
          <span className="text-gray-600 text-sm ml-1">
            ({item.review_count || 0})
          </span>
        </div>
        <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
        <p className="text-gray-500 text-sm mb-3">
          {item.description || "No description available"}
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900">
              {itemPrice.toLocaleString("vi-VN")} VND
            </span>
            <div className="flex items-center gap-2">
              <button
                className="w-8 h-8 flex items-center justify-center border border-gray-300 text-gray-500 rounded-l-lg hover:bg-gray-100"
                onClick={() => onQuantityChange(itemId, -1)}
              >
                <i className="ri-subtract-line"></i>
              </button>
              <span className="w-12 h-8 flex items-center justify-center border-y border-gray-300 text-gray-700">
                {item.quantity}
              </span>
              <button
                className="w-8 h-8 flex items-center justify-center border border-gray-300 text-gray-500 rounded-r-lg hover:bg-gray-100"
                onClick={() => onQuantityChange(itemId, 1)}
              >
                <i className="ri-add-line"></i>
              </button>
            </div>
          </div>
          <button
            onClick={() => onRemove(itemId)}
            className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartItem;
