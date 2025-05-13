import React, { useState, useEffect } from "react";
import MessagesSidebar from "./MessagesSidebar";
import ConversationView from "./ConversationView";

function Messages() {
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    const mockMessages = [
      {
        id: 1,
        sender: "RentCar - Car Rental Service",
        time: "1 hour ago",
        content: "Hi there, how can I help you?",
      },
      {
        id: 2,
        sender: "Robert Fox",
        time: "1 hour ago",
        content:
          "I keep getting 'error while creating a new popup' for the first time setup.",
      },
      {
        id: 3,
        sender: "Rebel Automotive",
        time: "1 hour ago",
        content:
          "I keep getting 'error while creating a new popup' for the first time setup.",
      },
      {
        id: 4,
        sender: "Floyd Miles",
        time: "1 hour ago",
        content:
          "I keep getting 'error while creating a new popup' for the first time setup.",
      },
      {
        id: 5,
        sender: "Cameron Williamson",
        time: "1 hour ago",
        content:
          "I keep getting 'error while creating a new popup' for the first time setup.",
      },
      {
        id: 6,
        sender: "Jane Cooper",
        time: "1 hour ago",
        content:
          "I keep getting 'error while creating a new popup' for the first time setup.",
      },
      {
        id: 7,
        sender: "Courtney Henry",
        time: "1 hour ago",
        content:
          "I keep getting 'error while creating a new popup' for the first time setup.",
      },
    ];
    setMessages(mockMessages);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <MessagesSidebar
          messages={messages}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
        />
        <div className="w-full lg:w-2/3">
          {selectedConversation ? (
            <ConversationView
              messages={messages}
              selectedConversation={selectedConversation}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                No Conversation Selected
              </h3>
              <p className="text-gray-500">
                Select a conversation from the sidebar to view messages.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;
