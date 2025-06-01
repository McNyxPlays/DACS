import React, { useState, useEffect } from "react";
import OrderHistorySidebar from "./leftsidebar";
import OrderHistoryDetailsView from "./detailsview";

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const mockOrders = [
      {
        id: 1,
        model: "Gundam RX-78-2",
        status: "Đã mua",
        date: "19/05/2025",
        total: 550000,
      },
      {
        id: 2,
        model: "Zaku II",
        status: "Đang giao",
        date: "18/05/2025",
        total: 320000,
      },
      {
        id: 3,
        model: "Gundam Wing",
        status: "Đã mua",
        date: "17/05/2025",
        total: 600000,
      },
    ];
    setOrders(mockOrders);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <OrderHistorySidebar
          orders={orders}
          selectedOrder={selectedOrder}
          setSelectedOrder={setSelectedOrder}
        />
        <div className="w-full lg:w-2/3">
          {selectedOrder ? (
            <OrderHistoryDetailsView orders={orders} selectedOrder={selectedOrder} />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Không có đơn hàng được chọn
              </h3>
              <p className="text-gray-500">
                Chọn một đơn hàng từ danh sách để xem chi tiết.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderHistory;