import React, { useState } from "react";
import { FaUser } from "react-icons/fa";
import PostDetail from "./PostDetail";

const UserPosts = ({ posts, currentUser, onLike, onCommentSubmit }) => {
  const [selectedPost, setSelectedPost] = useState(null);

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  const handleCloseDetail = () => {
    setSelectedPost(null);
  };

  return (
    <div className="w-full">
      <div className="p-4 max-w-2xl mx-auto">
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.post_id}
              className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm cursor-pointer"
              onClick={() => handlePostClick(post)}
            >
              <div className="flex justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {post.profile_image ? (
                      <img
                        src={`/Uploads/${post.profile_image}`}
                        alt="User Profile"
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => (e.target.src = "/Uploads/placeholder.jpg")}
                      />
                    ) : (
                      <FaUser className="text-gray-500 text-xl" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{post.full_name}</p>
                    <p className="text-gray-500 text-sm">
                      {new Date(post.created_at).toLocaleString()} ·{" "}
                      <i className="ri-earth-line"></i> Public
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-gray-800 mb-2 whitespace-pre-wrap break-words">
                {post.content}
              </p>
              {post.images && post.images.length > 0 && (
                <div className="grid grid-cols-1 gap-2 mb-2">
                  {post.images.map((image, index) => (
                    <div key={index} className="relative">
                      <div className="w-full h-80 bg-black flex items-center justify-center rounded-lg">
                        <img
                          src={`/Uploads/posts/${image.split('/').pop()}`}
                          alt="Post Image"
                          className="max-w-full h-80 object-contain border-l-2 border-r-2 border-gray-700 rounded-lg"
                          onError={(e) => (e.target.src = "/Uploads/placeholder.jpg")}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {posts.length === 0 && (
            <div className="text-center text-gray-500 py-6">No posts yet.</div>
          )}
        </div>
      </div>
      {selectedPost && (
        <PostDetail
          post={selectedPost}
          user={currentUser}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default UserPosts;