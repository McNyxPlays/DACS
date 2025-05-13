const NotificationItem = ({ notification }) => (
  <div className="bg-white p-4 rounded-lg shadow-md flex items-start gap-4">
    <div className="flex-1">
      <h3 className="font-semibold">{notification.title}</h3>
      <p className="text-sm text-gray-500">{notification.time}</p>
      <p className="mt-2">{notification.description}</p>
    </div>
    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
      {notification.actionText}
    </button>
  </div>
);
