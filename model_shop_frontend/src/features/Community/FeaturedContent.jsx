import React, { useState, useEffect } from "react";
import styles from "../../styles/CommunityHub.module.css";
import api from "../../api/index";

function FeaturedContent({ user }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    images: [],
  });
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.get("/posts.php", {
        params: { limit: 10, offset: 0 },
      });
      setPosts(response.data.posts);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to post.");
      return;
    }

    const formData = new FormData();
    formData.append("title", newPost.title);
    formData.append("content", newPost.content);
    formData.append("status", "new");
    newPost.images.forEach((image, index) => {
      formData.append(`images[${index}]`, image);
    });

    try {
      const response = await api.post("/posts.php", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPosts([response.data.post, ...posts]);
      setNewPost({ title: "", content: "", images: [] });
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Failed to create post.");
    }
  };

  const handleLike = async (postId, isLiked) => {
    if (!user) {
      alert("Please log in to like posts.");
      return;
    }

    try {
      const response = await api.put("/posts.php?action=like", {
        post_id: postId,
      });
      setPosts(
        posts.map((post) =>
          post.post_id === postId
            ? {
                ...post,
                is_liked: response.data.liked,
                like_count: response.data.like_count,
              }
            : post
        )
      );
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleCommentSubmit = async (postId) => {
    if (!user) {
      alert("Please log in to comment.");
      return;
    }

    const content = commentInputs[postId] || "";
    if (!content.trim()) return;

    try {
      const response = await api.put("/posts.php?action=comment", {
        post_id: postId,
        content,
      });
      setPosts(
        posts.map((post) =>
          post.post_id === postId
            ? { ...post, comment_count: post.comment_count + 1 }
            : post
        )
      );
      setCommentInputs({ ...commentInputs, [postId]: "" });
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
      <div className="flex border-b border-gray-200">
        <button className="flex-1 py-4 px-6 text-primary font-medium border-b-2 border-primary">
          Featured
        </button>
        <button className="flex-1 py-4 px-6 text-gray-600 hover:text-gray-900 transition">
          Latest
        </button>
        <button className="flex-1 py-4 px-6 text-gray-600 hover:text-gray-900 transition">
          Popular
        </button>
        <button className="flex-1 py-4 px-6 text-gray-600 hover:text-gray-900 transition">
          Following
        </button>
      </div>
      {user && (
        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handlePostSubmit}>
            <div className="flex items-center gap-3">
              <img
                src={
                  user.profile_image ||
                  "https://readdy.ai/api/search-image?query=professional%2520portrait%2520photo%2520of%2520a%2520young%2520man%2520with%2520short%2520brown%2520hair%2520and%2520casual%2520attire%252C%2520neutral%2520expression%252C%2520looking%2520at%2520camera%252C%2520indoor%2520studio%2520lighting%252C%2520high%2520quality%252C%2520photorealistic&width=100&height=100&seq=1001&orientation=squarish"
                }
                alt="User Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Post title..."
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost({ ...newPost, title: e.target.value })
                  }
                  className="w-full mb-2 px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <textarea
                  placeholder="What would you like to share today?"
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost({ ...newPost, content: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="mt-2">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) =>
                  setNewPost({ ...newPost, images: Array.from(e.target.files) })
                }
                className="text-sm text-gray-500"
              />
              <button
                type="submit"
                className="mt-2 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition"
              >
                Post
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="p-4">
        {posts.map((post) => (
          <div
            key={post.post_id}
            className={`border border-gray-200 rounded-lg p-4 mb-4 ${styles.postCard}`}
          >
            <div className="flex justify-between mb-3">
              <div className="flex items-center gap-3">
                <img
                  src={
                    post.profile_image ||
                    "https://readdy.ai/api/search-image?query=professional%2520portrait%2520photo%2520of%2520a%2520young%2520man%2520with%2520short%2520brown%2520hair%2520and%2520casual%2520attire%252C%2520neutral%2520expression%252C%2520looking%2520at%2520camera%252C%2520indoor%2520studio%2520lighting%252C%2520high%2520quality%252C%2520photorealistic&width=100&height=100&seq=1001&orientation=squarish"
                  }
                  alt="User Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-medium text-gray-900">
                    {post.full_name}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {new Date(post.created_at).toLocaleDateString()} ·{" "}
                    <i className="ri-earth-line"></i> Public
                  </div>
                </div>
              </div>
              <div className={styles.postActions}>
                <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full">
                  <i className="ri-more-2-fill"></i>
                </button>
              </div>
            </div>
            <h3 className="text-gray-800 font-medium mb-2">{post.title}</h3>
            <p className="text-gray-800 mb-3">{post.content}</p>
            {post.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {post.images.map((image, index) => (
                  <img
                    key={index}
                    src={`http://localhost:5173/${image}`}
                    alt="Post Image"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
            <div className="flex items-center justify-between text-sm mt-3">
              <div className="flex items-center gap-1 text-gray-500">
                <div className="flex -space-x-1">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                    <i className="ri-thumb-up-fill"></i>
                  </div>
                </div>
                <span>{post.like_count}</span>
              </div>
              <div className="flex items-center gap-4 text-gray-500">
                <span>{post.comment_count} comments</span>
                <span>12 shares</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
              <button
                onClick={() => handleLike(post.post_id, post.is_liked)}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <i
                  className={
                    post.is_liked ? "ri-thumb-up-fill" : "ri-thumb-up-line"
                  }
                ></i>
                <span>{post.is_liked ? "Unlike" : "Like"}</span>
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                onClick={() =>
                  document.getElementById(`comment-${post.post_id}`).focus()
                }
              >
                <i className="ri-chat-1-line"></i>
                <span>Comment</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                <i className="ri-share-forward-line"></i>
                <span>Share</span>
              </button>
            </div>
            <div className="mt-3">
              <input
                id={`comment-${post.post_id}`}
                type="text"
                placeholder="Write a comment..."
                value={commentInputs[post.post_id] || ""}
                onChange={(e) =>
                  setCommentInputs({
                    ...commentInputs,
                    [post.post_id]: e.target.value,
                  })
                }
                onKeyPress={(e) =>
                  e.key === "Enter" && handleCommentSubmit(post.post_id)
                }
                className="w-full px-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        ))}
        <div className="text-center">
          <button className="text-primary font-medium hover:underline">
            View More Posts
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeaturedContent;
