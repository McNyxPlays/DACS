import React from "react";
import { useLocation } from "react-router-dom";

const OrderSuccess = () => {
  const { state } = useLocation();
  const order = state?.order || {};
  const exchangeRate = 25000;

  const formatCurrency = (amount) => {
    const value = (Number(amount) * exchangeRate).toFixed(2);
    return `₫${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  if (!order.order_id) {
    return (
      <div className="bg-gray-100 min-h-screen p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6">Error</h1>
          <p className="text-lg">No order information available.</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-6 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Order Successfully Placed
        </h1>
        <p className="text-lg text-center">
          Thank you for your order! Your order number is{" "}
          <strong>{order.order_code || "N/A"}</strong>.
        </p>
        {order.promotions?.length > 0 && order.discount_amount > 0 && (
          <p className="text-lg text-center mt-4">
            Promo code <strong>{order.promotions[0]?.code || "N/A"}</strong>{" "}
            applied, saving you{" "}
            <strong>{formatCurrency(order.discount_amount)}</strong>.
          </p>
        )}
        <div className="mt-6 bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4">
            {order.details?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Items Ordered</h3>
                {order.details.map((item) => (
                  <div
                    key={item.detail_id}
                    className="border-b py-2"
                  >
                    <div className="flex justify-between">
                      <span>{item.name || "N/A"}</span>
                      <span>{formatCurrency(item.price_at_purchase)}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity || 1}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  {formatCurrency(
                    order.total_amount -
                      order.shipping_cost +
                      (order.discount_amount || 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{order.shipping_cost === 0 ? "Free" : formatCurrency(order.shipping_cost)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
            {order.shipping_method === "store_pickup" ? (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Pickup Location</h3>
                <p>Store ID: {order.store_id || "N/A"}</p>
              </div>
            ) : (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Shipping Address</h3>
                <p>{order.shipping_address || "N/A"}</p>
              </div>
            )}
          </div>
        </div>
        <div className="text-center mt-6">
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;