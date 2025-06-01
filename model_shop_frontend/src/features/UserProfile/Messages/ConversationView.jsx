import React, { useState, useEffect, useRef } from "react";
import api from "../../../api/index";
import { FaUser } from "react-icons/fa";

function ConversationView({ selectedConversation, user }) {
  const [conversationMessages, setConversationMessages] = useState([]);
  const [otherUserName, setOtherUserName] = useState("Unknown");
  const [newMessage, setNewMessage] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) {
        setConversationMessages([]);
        setOtherUserName("Unknown");
        return;
      }

      try {
        const response = await api.get(`/messages.php?conversation_id=${selectedConversation}`);
        if (response.data.success) {
          setConversationMessages(response.data.data || []);
          setOtherUserName(response.data.other_user_name || "Unknown");
        }
      } catch (err) {
        console.error("Failed to fetch messages: " + (err.message || "Unknown error"));
      }
    };

    fetchMessages();
  }, [selectedConversation]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversationMessages]);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4"];
      const maxSize = 10 * 1024 * 1024;
      if (!validTypes.includes(file.type)) {
        return;
      }
      if (file.size > maxSize) {
        return;
      }
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !mediaFile) return;

    try {
      const formData = new FormData();
      // Use other_user_id from the conversation to determine receiver_id
      const response = await api.get(`/messages.php?conversation_id=${selectedConversation}`);
      if (!response.data.success) {
        throw new Error("Failed to fetch conversation details");
      }
      const receiver_id = response.data.data[0]?.sender_id === user.user_id 
        ? response.data.data[0]?.receiver_name === response.data.other_user_name 
          ? response.data.data[0]?.sender_id 
          : user.user_id 
        : response.data.data[0]?.sender_id;

      formData.append("receiver_id", receiver_id);
      formData.append("sender_id", user.user_id);
      formData.append("content", newMessage);
      if (mediaFile) {
        formData.append("media", mediaFile);
      }

      const sendResponse = await api.post("/messages.php", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (sendResponse.data.success) {
        setConversationMessages([...conversationMessages, sendResponse.data.data]);
        setNewMessage("");
        setMediaFile(null);
        setMediaPreview(null);
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }
    } catch (err) {
      console.error("Failed to send message: " + (err.message || "Unknown error"));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!selectedConversation) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Conversation
        </h3>
        <p className="text-gray-500">No conversation found.</p>
      </div>
    );
  }

  const profileImageUrl = user.profile_image ? `/api/${user.profile_image}` : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-[70vh]">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {otherUserName}
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt="Profile"
            className="w-8 h-8 rounded-full ml-2 inline-block"
          />
        ) : (
          <FaUser className="w-8 h-8 ml-2 inline-block text-gray-600 rounded-full border-2 border-gray-300" />
        )}
      </h3>
      <div
        ref={chatContainerRef}
        className="flex-1 space-y-4 overflow-y-auto pr-2"
      >
        {conversationMessages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender_id === user.user_id ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`inline-block p-4 rounded-lg border border-gray-100 ${
                msg.sender_id === user.user_id
                  ? "bg-teal-700 text-white rounded-br-none"
                  : "bg-teal-100 text-gray-900 rounded-bl-none"
              }`}
              style={{ maxWidth: "70%" }}
            >
              {msg.sender_id !== user.user_id && (
                <span className="text-sm font-medium block mb-1">{msg.sender_name}</span>
              )}
              <div className="flex flex-col">
                {msg.content && <p className="text-sm break-words mb-1">{msg.content}</p>}
                {msg.media && (
                  <div className="mt-2">
                    {msg.media.media_type === "image" ? (
                      <img
                        src={`/api/${msg.media.media_url}`}
                        alt="Message media"
                        className="max-w-full rounded-lg"
                      />
                    ) : (
                      <video
                        src={`/api/${msg.media.media_url}`}
                        controls
                        className="max-w-full rounded-lg"
                      />
                    )}
                  </div>
                )}
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs opacity-80">
                    {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.sender_id === user.user_id && (
                    <span className="text-xs">
                      {msg.is_read ? "✔️ Seen" : ""}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {mediaPreview && (
          <div className="flex items-center gap-2">
            {mediaFile.type.startsWith("image") ? (
              <img
                src={mediaPreview}
                alt="Media preview"
                className="w-20 h-20 object-cover rounded-lg"
              />
            ) : (
              <video
                src={mediaPreview}
                className="w-20 h-20 object-cover rounded-lg"
                controls
              />
            )}
            <button
              onClick={() => {
                setMediaFile(null);
                setMediaPreview(null);
              }}
              className="text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            rows="2"
          />
          <label className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-pointer">
            <span>Attach</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,video/mp4"
              onChange={handleMediaChange}
              className="hidden"
            />
          </label>
          <button
            onClick={handleSendMessage}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConversationView;