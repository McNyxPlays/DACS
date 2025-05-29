import React, { useState, useEffect } from "react";
import api from "../../api/index";
import { Toastify } from "../../components/Toastify";
import PostDetail from "./PostDetail";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:5173";

const FeaturedPosts = ({ posts, user, onLike, onCommentSubmit, onDeletePost }) => {
  const [commentInputs, setCommentInputs] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [imageLoaded, setImageLoaded] = useState({});
  const [expandedPosts, setExpandedPosts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    setImageLoaded({});
    posts.forEach((post) => {
      if (post.images && post.images.length > 0) {
        post.images.forEach((image) => {
          const fullImageUrl = `${BASE_URL}/${image}`;
          console.log(`Attempting to load image: ${fullImageUrl}`); // Debug log
          if (!imageLoaded[fullImageUrl]) {
            const img = new Image();
            img.src = fullImageUrl;
            img.onload = () => {
              console.log(`Image loaded successfully: ${fullImageUrl}`);
              setImageLoaded((prev) => ({ ...prev, [fullImageUrl]: true }));
            };
            img.onerror = () => {
              console.log(`Image failed to load: ${fullImageUrl}`);
              setImageLoaded((prev) => ({ ...prev, [fullImageUrl]: false }));
            };
          }
        });
      }
    });
  }, [posts]);

  const handleCommentChange = (postId, value) => {
    setCommentInputs({ ...commentInputs, [postId]: value });
  };

  const handleCommentSubmitWrapper = (postId) => {
    const content = commentInputs[postId] || "";
    onCommentSubmit(postId, content);
    setCommentInputs({ ...commentInputs, [postId]: "" });
  };

  const toggleDropdown = (postId) => {
    setDropdownOpen(dropdownOpen === postId ? null : postId);
  };

  const handleDeletePost = async (postId) => {
    if (!user) {
      Toastify.error("Please log in to delete posts.");
      return;
    }

    try {
      await api.delete(`/posts.php?post_id=${postId}`);
      Toastify.success("Post deleted successfully!");
      if (onDeletePost) onDeletePost(postId);
    } catch (err) {
      console.error("Error deleting post:", err);
      Toastify.error("Failed to delete post.");
    }
    setDropdownOpen(null);
  };

  const openPostDetail = (post) => {
    setSelectedPost(post);
  };

  const closePostDetail = () => {
    setSelectedPost(null);
  };

  const navigateToProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const toggleExpandPost = (postId) => {
    setExpandedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const isContentLong = (content) => {
    return content.length > 100 || content.split('\n').length > 1;
  };

  return (
    <div className="p-4">
      {posts.map((post) => (
        <div
          key={post.post_id}
          className="border border-gray-200 rounded-lg p-4 mb-6 bg-white shadow-sm max-w-[10000px] mx-auto"
          style={{ width: "100%", maxWidth: "10000px" }}
          onClick={() => openPostDetail(post)}
        >
          <div className="flex justify-between mb-2">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigateToProfile(post.user_id);
              }}
            >
              {post.profile_image ? (
                <img
                  src={`${BASE_URL}/Uploads/avatars/${post.profile_image}`}
                  alt="User Profile"
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => (e.target.src = "/placeholder.jpg")}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <i className="ri-user-line ri-lg text-gray-700"></i>
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="font-medium text-gray-900">{post.full_name}</div>
                </div>
                <div className="text-gray-500 text-sm">
                  {new Date(post.created_at).toLocaleString()} ·{" "}
                  <i className="ri-earth-line"></i> Public
                </div>
              </div>
            </div>
            {user && user.user_id === post.user_id && (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => toggleDropdown(post.post_id)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <i className="ri-more-2-fill ri-lg"></i>
                </button>
                {dropdownOpen === post.post_id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => handleDeletePost(post.post_id)}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      Delete Post
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <p
            className={`text-gray-800 mb-2 whitespace-pre-wrap break-words ${
              !expandedPosts[post.post_id] && isContentLong(post.content)
                ? "line-clamp-1"
                : ""
            }`}
          >
            {post.content}
          </p>
          {isContentLong(post.content) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpandPost(post.post_id);
              }}
              className="text-blue-600 hover:underline text-sm"
            >
              {expandedPosts[post.post_id] ? "See Less" : "See More"}
            </button>
          )}
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-1 gap-2 mb-2">
              {post.images.map((image, index) => {
                const fullImageUrl = `${BASE_URL}/${image}`;
                return (
                  <div key={index} className="relative">
                    {imageLoaded[fullImageUrl] === undefined ? (
                      <div className="w-full h-48 bg-gray-200 rounded-lg animate-pulse"></div>
                    ) : (
                      <img
                        src={imageLoaded[fullImageUrl] ? fullImageUrl : "/placeholder.jpg"}
                        alt="Post Image"
                        className="w-full rounded-lg object-cover border-l-2 border-r-2 border-gray-700"
                        onError={(e) => (e.target.src = "/placeholder.jpg")}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex items-center justify-between text-sm mb-2">
            <div className="flex items-center gap-1 text-gray-500">
              <i className="ri-thumb-up-fill text-blue-600"></i>
              <span>{post.like_count || 0}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <span>{post.comment_count || 0} comments</span>
              <span>shares</span>
            </div>
          </div>
          <div
            className="flex items-center justify-between pt-2 border-t border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onLike(post.post_id, post.is_liked)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${
                post.is_liked ? "text-blue-600" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <i
                className={post.is_liked ? "ri-thumb-up-fill" : "ri-thumb-up-line"}
              ></i>
              <span>{post.is_liked ? "Unlike" : "Like"}</span>
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              onClick={() => document.getElementById(`comment-${post.post_id}`).focus()}
            >
              <i className="ri-chat-1-line"></i>
              <span>Comment</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <i className="ri-share-forward-line"></i>
              <span>Share</span>
            </button>
          </div>
          <div className="mt-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              {user && (
                <>
                  {user.profile_image ? (
                    <img
                      src={`${BASE_URL}/Uploads/avatars/${user.profile_image}`}
                      alt="User Profile"
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => (e.target.src = "/placeholder.jpg")}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <i className="ri-user-line ri-lg text-gray-700"></i>
                    </div>
                  )}
                </>
              )}
              <input
                id={`comment-${post.post_id}`}
                type="text"
                placeholder="Write a comment..."
                value={commentInputs[post.post_id] || ""}
                onChange={(e) => handleCommentChange(post.post_id, e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && handleCommentSubmitWrapper(post.post_id)
                }
                className="flex-1 px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      ))}
      <div className="text-center">
        <button className="text-primary font-medium hover:underline">
          View More Posts
        </button>
      </div>

      {selectedPost && (
        <PostDetail post={selectedPost} user={user} onClose={closePostDetail} />
      )}
    </div>
  );
};

export default FeaturedPosts;