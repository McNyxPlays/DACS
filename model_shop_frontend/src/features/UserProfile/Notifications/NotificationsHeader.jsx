import React from "react";

const NotificationsHeader = ({ sort, onSortChange, onMarkAsRead, onDelete }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center mb-4">
      <div>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-4 py-2 rounded bg-gray-100 focus:outline-none"
        >
          <option value="Newest First">Newest First</option>
          <option value="Oldest First">Oldest First</option>
        </select>
      </div>
      <div>
        <button
          onClick={onMarkAsRead}
          className="px-4 py-2 bg-blue-500 text-white rounded mr-2 hover:bg-blue-600"
        >
          Mark as Read
        </button>
        <button
          onClick={onDelete}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default NotificationsHeader;