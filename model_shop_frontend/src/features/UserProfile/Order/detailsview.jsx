import React from "react";

function StoreOrderDetailsView({ orders, selectedOrder }) {
  const order = orders.find((o) => o.id === selectedOrder);

  if (!order) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Chi tiết đơn hàng
        </h3>
        <p className="text-gray-500">Không tìm thấy đơn hàng.</p>
      </div>
    );
  }

  const orderDetails = [
    {
      label: "Tên mô hình",
      value: order.model,
    },
    {
      label: "Trạng thái",
      value: order.status,
    },
    {
      label: "Ngày đặt",
      value: order.date,
    },
    {
      label: "Tổng tiền",
      value: `${order.total.toLocaleString()} VNĐ`,
    },
    {
      label: "Phương thức thanh toán",
      value: "Chuyển khoản",
    },
    {
      label: "Địa chỉ giao hàng",
      value: "123 Đường ABC, Quận 1, TP.HCM",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Chi tiết đơn hàng #{order.id}
      </h3>
      <div className="space-y-4">
        {orderDetails.map((detail, index) => (
          <div
            key={index}
            className="flex justify-between border-b border-gray-100 py-2"
          >
            <span className="text-gray-600">{detail.label}</span>
            <span className="text-gray-900 font-medium">{detail.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StoreOrderDetailsView;