const NotificationsHeader = ({
  sort,
  onSortChange,
  onMarkAsRead,
  onDelete,
}) => (
  <div className="flex justify-between items-center mb-4">
    <select
      value={sort}
      onChange={(e) => onSortChange(e.target.value)}
      className="p-2 rounded border"
    >
      <option>Newest First</option>
      <option>Oldest First</option>
    </select>
    <div className="flex gap-2">
      <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
        Select All
      </button>
      <button
        onClick={onMarkAsRead}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
