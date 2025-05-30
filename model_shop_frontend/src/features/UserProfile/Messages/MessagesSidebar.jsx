import React, { useState } from "react";
import { FaUser } from "react-icons/fa";

function MessagesSidebar({
  messages,
  selectedConversation,
  setSelectedConversation,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMessages = messages.filter((message) =>
    message.sender.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full lg:w-1/4 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="space-y-3">
        {filteredMessages.length > 0 ? (
          filteredMessages.map((message) => (
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
                <div className="flex items-center gap-2">
                  {message.profile_image ? (
                    <img
                      src={`/api/${message.profile_image}`}
                      alt={`${message.sender}'s profile`}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <FaUser className="w-8 h-8 text-gray-600 rounded-full border-2 border-gray-300" />
                  )}
                  <span className="font-medium text-gray-900 truncate">
                    {message.sender}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {message.unread_count > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {message.unread_count}
                    </span>
                  )}
                  <span className="text-gray-400 text-xs">{message.time}</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {message.content}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">
            {searchTerm ? "No matching conversations found." : "No messages yet."}
          </p>
        )}
      </div>
    </div>
  );
}

export default MessagesSidebar;