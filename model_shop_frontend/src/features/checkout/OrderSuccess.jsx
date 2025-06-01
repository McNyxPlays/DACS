import React from "react";
import { useLocation } from "react-router-dom";

const OrderSuccess = () => {
  const { state } = useLocation();
  const order = state?.order || {};
  const exchangeRate = 25000;

  const formatCurrency = (amount) => {
    return `₫${Math.round(amount * exchangeRate).toLocaleString('en-US')}`;
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-6">Order Successfully Placed</h1>
        <p className="text-lg">
          Thank you for your order! Your order number is{" "}
          <strong>{order.order_code || "N/A"}</strong>.
        </p>
        {order.promo_code && order.discount_amount > 0 && (
          <p className="text-lg mt-4">
            Promo code <strong>{order.promo_code}</strong> applied, saving you{" "}
            <strong>{formatCurrency(order.discount_amount)}</strong>.
          </p>
        )}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <p>Subtotal: {formatCurrency(order.total_amount - order.shipping_cost + (order.discount_amount || 0))}</p>
          <p>Shipping: {formatCurrency(order.shipping_cost)}</p>
          {order.discount_amount > 0 && <p>Discount: -{formatCurrency(order.discount_amount)}</p>}
          <p className="font-bold">Total: {formatCurrency(order.total_amount)}</p>
        </div>
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