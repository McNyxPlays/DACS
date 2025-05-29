import React from "react";
import { useLocation } from "react-router-dom";

const OrderConfirmation = () => {
  const { state } = useLocation();
  const order = state?.order || {};

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-6">Order Confirmation</h1>
        <p className="text-lg">
          Thank you for your order! Your order number is{" "}
          <strong>{order.order_code}</strong>.
        </p>
        <p className="mt-4">Total: ${(order.total_amount || 0).toFixed(2)}</p>
        <p className="mt-2">Shipping Address: {order.shipping_address}</p>

        {/* Hiển thị chi tiết sản phẩm */}
        {order.items && order.items.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.cart_id || item.guest_cart_id}
                  className="flex items-center gap-4 border-b py-2"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => (e.target.src = "/placeholder.jpg")}
                    />
                  )}
                  <div className="flex-1 text-left">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      Price: ${(item.price || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Color: {item.color || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Size: {item.size || "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => (window.location.href = "/")}
          className="mt-6 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;