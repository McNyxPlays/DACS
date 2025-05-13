import React from "react";

function ConversationView({ messages, selectedConversation }) {
  const conversation = messages.find((m) => m.id === selectedConversation);

  if (!conversation) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Conversation
        </h3>
        <p className="text-gray-500">No conversation found.</p>
      </div>
    );
  }

  const conversationMessages = [
    {
      sender: "User",
      content:
        "Hi, I was interested in renting your sports car for the weekend.",
      time: "1 hour ago",
    },
    {
      sender: conversation.sender,
      content: `Great! Which car were you interested in renting?`,
      time: "11 min. ago",
    },
    {
      sender: "User",
      content:
        "I really like the look of the Porsche 911 you have listed for rental.",
      time: "1 hour ago",
    },
    {
      sender: conversation.sender,
      content:
        "Ah yes, that's one of my favorites. It's definitely a head-turner. Have you ever driven a sports car before?",
      time: "1 hour ago",
    },
    {
      sender: "User",
      content:
        "No, I haven't. But I've always wanted to try one out, and this seems like the perfect opportunity.",
      time: "11 min. ago",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Conversation with {conversation.sender}
      </h3>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {conversationMessages.map((msg, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border border-gray-100 ${
              msg.sender === "User"
                ? "bg-teal-700 text-white ml-8"
                : "bg-teal-100 text-gray-900 mr-8"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{msg.sender}</span>
              <span className="text-xs opacity-80">{msg.time}</span>
            </div>
            <p className="text-sm">{msg.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ConversationView;
