import React from "react";

function MessagesSidebar({
  messages,
  selectedConversation,
  setSelectedConversation,
}) {
  return (
    <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages</h2>
      <div className="space-y-3">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`cursor-pointer p-4 rounded-lg border border-gray-100 transition-all duration-200 ${
                selectedConversation === message.id
                  ? "bg-primary/10 border-primary shadow-sm"
                  : "hover:bg-gray-50 hover:border-gray-200"
              }`}
              onClick={() => setSelectedConversation(message.id)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 truncate">
                  {message.sender}
                </span>
                <span className="text-gray-400 text-xs">{message.time}</span>
              </div>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {message.content}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No messages yet.</p>
        )}
      </div>
    </div>
  );
}

export default MessagesSidebar;
