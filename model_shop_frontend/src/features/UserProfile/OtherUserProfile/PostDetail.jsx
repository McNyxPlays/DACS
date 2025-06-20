import React, { useState, useEffect } from "react";
import api from "../../../api/index";
import { Toastify } from "../../../components/Toastify";

const PostDetail = ({ post, user, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await api.get(`/comments.php?post_id=${post.post_id}`);
        if (response.data.status === "success") {
          setComments(response.data.comments || []);
        }
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };
    fetchComments();
  }, [post.post_id]);

  const handleLike = async () => {
    if (!user) {
      Toastify.error("Please log in to like posts.");
      return;
    }
    try {
      const response = await api.put("/posts.php?action=like", { post_id: post.post_id });
      setIsLiked(response.data.liked);
      setLikeCount(response.data.like_count);
    } catch (err) {
      console.error("Error liking post:", err);
      Toastify.error("Failed to like post.");
    }
  };

  const handleCommentSubmit = async () => {
    if (!user) {
      Toastify.error("Please log in to comment.");
      return;
    }
    if (!newComment.trim()) return;
    try {
      await api.put("/posts.php?action=comment", {
        post_id: post.post_id,
        content: newComment,
      });
      const newCommentObj = {
        comment_id: Date.now(),
        content: newComment,
        created_at: new Date().toISOString(),
        full_name: user.name, // Sử dụng user.name từ userData
      };
      setComments([...comments, newCommentObj]);
      setNewComment("");
      Toastify.success("Comment added successfully!");
    } catch (err) {
      console.error("Error adding comment:", err);
      Toastify.error("Failed to add comment.");
    }
  };

  const isContentLong = (content) => {
    const lineCount = content.split('\n').length;
    return content.length > 200 || lineCount > 2;
  };

  // Tính tỷ lệ khung hình và điều chỉnh kích thước
  const getImageStyle = (index) => {
    const img = new Image();
    img.src = `/Uploads/posts/${post.images[index].split('/').pop()}`;
    return {
      maxHeight: "300px",
      objectFit: "contain", // Hỗ trợ cả chiều ngang và chiều dọc
      width: "100%",
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Post Details</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <i className="ri-close-line ri-lg"></i>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 200px)" }}> {/* Tăng padding */}
          <div className="mb-6"> {/* Tăng khoảng cách */}
            <div className="flex items-center gap-4 mb-4"> {/* Tăng khoảng cách */}
              {post.profile_image ? (
                <img
                  src={`/Uploads/${post.profile_image}`}
                  alt="User Profile"
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => (e.target.src = "/Uploads/placeholder.jpg")}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <i className="ri-user-line ri-lg text-gray-700"></i>
                </div>
              )}
              <div>
                <div className="font-medium text-gray-900">{post.full_name}</div>
                <div className="text-gray-500 text-sm">
                  {new Date(post.created_at).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="text-gray-800 mb-6 whitespace-pre-wrap break-words"> {/* Tăng khoảng cách */}
              {isContentLong(post.content) ? (
                <>
                  {isExpanded ? post.content : `${post.content.substring(0, 200)}...`}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                    className="text-blue-600 hover:underline text-sm ml-2"
                  >
                    {isExpanded ? "See Less" : "See More"}
                  </button>
                </>
              ) : (
                post.content
              )}
            </div>
            {post.images && post.images.length > 0 && (
              <div className="grid grid-cols-1 gap-4 mb-6"> {/* Tăng khoảng cách */}
                {post.images.map((image, index) => (
                  <div className="w-full h-[300px] bg-black flex items-center justify-center rounded-lg border-2 border-black"> {/* Thêm viền đen */}
                    <img
                      key={index}
                      src={`/Uploads/posts/${image.split('/').pop()}`}
                      alt="Post Image"
                      style={getImageStyle(index)}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => (e.target.src = "/Uploads/placeholder.jpg")}
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between text-sm mb-6"> {/* Tăng khoảng cách */}
              <div className="flex items-center gap-1 text-gray-500">
                <i className="ri-thumb-up-fill text-blue-600"></i>
                <span>{likeCount}</span>
              </div>
              <div className="text-gray-500">
                <span>{comments.length} comments</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mb-6 border-t border-b border-gray-200 py-3"> {/* Tăng khoảng cách */}
            <button
              onClick={handleLike}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${
                isLiked ? "text-blue-600" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <i className={isLiked ? "ri-thumb-up-fill" : "ri-thumb-up-line"}></i>
              <span>{isLiked ? "Unlike" : "Like"}</span>
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              onClick={() => document.getElementById(`modal-comment-${post.post_id}`).focus()}
            >
              <i className="ri-chat-1-line"></i>
              <span>Comment</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <i className="ri-share-forward-line"></i>
              <span>Share</span>
            </button>
          </div>
          <div className="mb-6"> {/* Tăng khoảng cách */}
            <h4 className="font-semibold text-gray-800 mb-4">Comments</h4> {/* Tăng khoảng cách */}
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.comment_id} className="flex gap-4 mb-4"> {/* Tăng khoảng cách */}
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <i className="ri-user-line ri-lg text-gray-700"></i>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{comment.full_name}</div>
                    <div className="text-gray-500 text-sm">
                      {new Date(comment.created_at).toLocaleString()}
                    </div>
                    <p className="text-gray-800">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No comments yet.</p>
            )}
          </div>
        </div>
        {user && (
          <div className="p-6 border-t border-gray-200"> {/* Tăng padding */}
            <div className="flex items-center gap-4"> {/* Tăng khoảng cách */}
              {user.profile_image ? (
                <img
                  src={`/Uploads/${user.profile_image}`}
                  alt="User Profile"
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => (e.target.src = "/Uploads/placeholder.jpg")}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <i className="ri-user-line ri-lg text-gray-700"></i>
                </div>
              )}
              <input
                id={`modal-comment-${post.post_id}`}
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCommentSubmit()}
                className="flex-1 px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetail;