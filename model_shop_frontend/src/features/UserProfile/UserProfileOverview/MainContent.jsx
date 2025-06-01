import React, { useState, useEffect } from "react";
import api from "../../../api/index";
import { Toastify } from "../../../components/Toastify";
import { FaUser } from "react-icons/fa";
import PostDetail from "./PostDetail";

const MainContent = ({ activeTab, setActiveTab, className }) => {
  const [posts, setPosts] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [postContent, setPostContent] = useState("");
  const [postImages, setPostImages] = useState([]);
  const [userData, setUserData] = useState({
    name: "Unknown User",
    profile_image: "",
    user_id: null,
  });
  const [imageLoaded, setImageLoaded] = useState({});
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    if (activeTab === "posts") {
      api
        .get("/posts.php", {
          params: { limit: 10, offset: 0, user_id: "current" },
        })
        .then(async (response) => {
          if (response.data.status === "success") {
            const postsData = response.data.posts;
            const postsWithImages = await Promise.all(
              postsData.map(async (post) => {
                const imageResponse = await api.get("/posts_images.php", {
                  params: { post_id: post.post_id },
                });
                return { ...post, images: imageResponse.data.images || [] };
              })
            );
            setPosts(postsWithImages);
            postsWithImages.forEach((post) => {
              if (post.images && post.images.length > 0) {
                post.images.forEach((image) => {
                  const fullImageUrl = `/Uploads/posts/${image.split('/').pop()}`;
                  if (!imageLoaded[fullImageUrl]) {
                    const img = new Image();
                    img.src = fullImageUrl;
                    img.onload = () =>
                      setImageLoaded((prev) => ({ ...prev, [fullImageUrl]: true }));
                    img.onerror = () =>
                      setImageLoaded((prev) => ({ ...prev, [fullImageUrl]: false }));
                  }
                });
              }
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching posts:", error);
          Toastify.error("Failed to load posts.");
        });

      api
        .get("/user.php")
        .then((response) => {
          if (response.data.status === "success") {
            const fetchedUser = response.data.user;
            setUserData({
              name: fetchedUser.full_name || "Unknown User",
              profile_image: fetchedUser.profile_image || "",
              user_id: fetchedUser.user_id || null,
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, [activeTab, imageLoaded]);

  const handleDeletePost = (postId) => {
    api
      .delete(`/posts.php?post_id=${postId}`)
      .then((response) => {
        if (response.data.status === "success") {
          setPosts(posts.filter((post) => post.post_id !== postId));
          Toastify.success("Post deleted successfully!");
        } else {
          Toastify.error(response.data.message || "Failed to delete post.");
        }
      })
      .catch((error) => {
        console.error("Error deleting post:", error);
        Toastify.error("Failed to delete post.");
      });
    setDropdownOpen(null);
  };

  const handleCreatePost = () => {
    if (!postContent.trim()) {
      Toastify.error("Content is required.");
      return;
    }

    const formData = new FormData();
    formData.append("content", postContent);
    formData.append("post_time_status", "new");
    postImages.forEach((image) => formData.append("images[]", image));

    api
      .post("/posts.php", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        if (response.data.status === "success") {
          setPosts([response.data.post, ...posts]);
          setPostContent("");
          setPostImages([]);
          Toastify.success("Post created successfully!");
        } else {
          Toastify.error(response.data.message || "Failed to create post.");
        }
      })
      .catch((error) => {
        console.error("Error creating post:", error);
        Toastify.error("Failed to create post.");
      });
  };

  const toggleDropdown = (postId) => {
    setDropdownOpen(dropdownOpen === postId ? null : postId);
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  const handleCloseDetail = () => {
    setSelectedPost(null);
  };

  const toggleDropdownAndPrevent = (e, postId) => {
    e.stopPropagation();
    toggleDropdown(postId);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-white rounded-lg shadow-md mb-6">
        {activeTab === "posts" && (
          <div className="p-4 max-w-4xl mx-auto"> {/* Thu hẹp chiều ngang */}
            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <textarea
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm text-gray-700 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What's on your mind?"
                  rows={3}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                />
                {postImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {postImages.map((image, index) => (
                      <div key={index} className="relative">
                        <div className="w-full h-24 bg-black flex items-center justify-center">
                          <img
                            src={URL.createObjectURL(image)}
                            alt="Preview"
                            className="max-w-full h-24 object-contain rounded-lg"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setPostImages(postImages.filter((_, i) => i !== index))
                          }
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3">
                  <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                    <i className="ri-image-add-line text-xl"></i>
                    <span>Photo</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) =>
                        setPostImages([...postImages, ...Array.from(e.target.files)])
                      }
                      className="hidden"
                    />
                  </label>
                  <button
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all"
                    onClick={handleCreatePost}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.post_id}
                  className="border border-gray-200 rounded-lg p-4 mb-6 bg-white shadow-sm max-w-[10000px] mx-auto cursor-pointer"
                  style={{ width: "100%", maxWidth: "10000px" }}
                  onClick={() => handlePostClick(post)}
                >
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {userData.profile_image ? (
                          <img
                            src={`/Uploads/${userData.profile_image}`}
                            alt="User Profile"
                            className="w-full h-full rounded-full object-cover"
                            onError={(e) => (e.target.src = "/Uploads/placeholder.jpg")}
                          />
                        ) : (
                          <FaUser className="text-gray-500 text-2xl" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{userData.name}</p>
                        <p className="text-gray-500 text-sm">
                          {new Date(post.created_at).toLocaleString()} ·{" "}
                          <i className="ri-earth-line"></i> Public
                        </p>
                      </div>
                    </div>
                    {userData.user_id && userData.user_id === post.user_id && (
                      <div className="relative" onClick={(e) => toggleDropdownAndPrevent(e, post.post_id)}>
                        <button
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
                  <p className="text-gray-800 mb-2 whitespace-pre-wrap break-words">
                    {post.content}
                  </p>
                  {post.images && post.images.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 mb-2">
                      {post.images.map((image, index) => {
                        const fullImageUrl = `/Uploads/posts/${image.split('/').pop()}`;
                        return (
                          <div key={index} className="relative">
                            {imageLoaded[fullImageUrl] === undefined ? (
                              <div className="w-full h-48 bg-gray-200 rounded-lg animate-pulse"></div>
                            ) : (
                              <div className="w-full h-48 bg-black flex items-center justify-center rounded-lg">
                                <img
                                  src={
                                    imageLoaded[fullImageUrl] ? fullImageUrl : "/Uploads/placeholder.jpg"
                                  }
                                  alt="Post Image"
                                  className="max-w-full h-48 object-contain border-l-2 border-r-2 border-gray-700 rounded-lg"
                                  onError={(e) => (e.target.src = "/Uploads/placeholder.jpg")}
                                />
                              </div>
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
                </div>
              ))}
              {posts.length === 0 && (
                <div className="text-center text-gray-500 py-6">No posts yet.</div>
              )}
            </div>
          </div>
        )}
        {activeTab !== "posts" && (
          <div className="p-6 text-center text-gray-500">
            Content for {activeTab} tab coming soon...
          </div>
        )}
      </div>
      {selectedPost && (
        <PostDetail
          post={selectedPost}
          user={userData}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default MainContent;