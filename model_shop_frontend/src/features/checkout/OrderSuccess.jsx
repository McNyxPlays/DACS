import React from "react";
import { useLocation } from "react-router-dom";

const OrderSuccess = () => {
  const { state } = useLocation();
  const order = state?.order || {};

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-6">Order Successfully Placed</h1>
        <p className="text-lg">
          Thank you for your order! Your order number is{" "}
          <strong>{order.order_code || "N/A"}</strong>.
        </p>
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

export default OrderSuccess;