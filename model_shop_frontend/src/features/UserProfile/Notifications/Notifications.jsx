import React, { useState, useEffect } from "react";
import axios from "../../api/index";
import NotificationsSidebar from "./NotificationsSidebar";
import NotificationsHeader from "./NotificationsHeader";
import NotificationItem from "./NotificationItem";
import NotificationsPagination from "./NotificationsPagination";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [category, setCategory] = useState("All Categories");
  const [sort, setSort] = useState("Newest First");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/notifications.php", {
          params: {
            filter,
            category,
            sort,
            page: currentPage,
          },
        });
        setNotifications(response.data.notifications);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [filter, category, sort, currentPage]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleMarkAsRead = async () => {
    try {
      await axios.post("/api/notifications.php?action=markAsRead");
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.post("/api/notifications.php?action=delete");
      setNotifications([]);
    } catch (error) {
      console.error("Error deleting notifications:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-4">
      {/* Sidebar */}
      <NotificationsSidebar
        filter={filter}
        category={category}
        onFilterChange={handleFilterChange}
        onCategoryChange={handleCategoryChange}
      />

      {/* Main Content */}
      <div className="flex-1">
        <NotificationsHeader
          sort={sort}
          onSortChange={handleSortChange}
          onMarkAsRead={handleMarkAsRead}
          onDelete={handleDelete}
        />

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-4">No notifications found.</div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <NotificationsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Notifications;
