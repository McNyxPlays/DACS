const NotificationsSidebar = ({
  filter,
  category,
  onFilterChange,
  onCategoryChange,
}) => (
  <div className="w-full md:w-64 bg-gray-100 p-4 rounded-lg sticky top-4">
    <h2 className="font-bold mb-4">Notifications</h2>
    <div className="flex gap-2 mb-4">
      {["All", "Unread", "Read"].map((f) => (
        <button
          key={f}
          className={`px-4 py-2 rounded ${
            filter === f ? "bg-blue-500 text-white" : "bg-white"
          }`}
          onClick={() => onFilterChange(f)}
        >
          {f}
        </button>
      ))}
    </div>
    <select
      value={category}
      onChange={(e) => onCategoryChange(e.target.value)}
      className="w-full p-2 rounded border"
    >
      {[
        "All Categories",
        "System",
        "Social",
        "Challenge",
        "Shopping",
        "Events",
        "Account",
      ].map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  </div>
);
