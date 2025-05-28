import React, { useState, useEffect } from "react";
import api from "../../../api/index";
import { Toastify } from "../../../components/Toastify";

const MainContent = ({ activeTab, setActiveTab }) => {
  const [posts, setPosts] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  // Fetch user-specific posts
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
          }
        })
        .catch((error) => {
          console.error("Error fetching posts:", error);
          Toastify.error("Failed to load posts.");
        });
    }
  }, [activeTab]);

  const handleDeletePost = (postId) => {
    api
      .delete(`/posts.php?post_id=${postId}`)
      .then((response) => {
        if (response.data.status === "success") {
          setPosts(posts.filter((post) => post.post_id !== postId));
          Toastify.success("Post deleted successfully.");
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

  const toggleDropdown = (postId) => {
    setDropdownOpen(dropdownOpen === postId ? null : postId);
  };

  return (
    <div className="w-full md:w-3/5">
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b flex">
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === "posts"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("posts")}
          >
            My Posts
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === "collections"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("collections")}
          >
            Collections
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === "likes"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("likes")}
          >
            Likes
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === "comments"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("comments")}
          >
            Comments
          </button>
        </div>

        {activeTab === "posts" && (
          <div className="p-4">
            <div className="mb-4">
              <h2 className="font-bold">My Posts</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.map((post) => (
                <div
                  key={post.post_id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow relative"
                >
                  {/* Three-dot dropdown in top-left */}
                  <div className="absolute top-2 left-2">
                    <button
                      onClick={() => toggleDropdown(post.post_id)}
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      <i className="fas fa-ellipsis-v"></i>
                    </button>
                    {dropdownOpen === post.post_id && (
                      <div className="absolute left-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <button
                          onClick={() => handleDeletePost(post.post_id)}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Delete Post
                        </button>
                      </div>
                    )}
                  </div>

                  {post.images && post.images.length > 0 ? (
                    <>
                      <div className="relative">
                        <img
                          src={`http://localhost:8080/${post.images[0]}`}
                          alt={post.title}
                          className="w-full h-48 object-cover object-top"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-serif font-bold text-gray-900">{post.title}</h3>
                        <p className="font-sans text-sm text-gray-600 mt-1">{post.content}</p>
                        <div className="flex flex-wrap gap-1 my-2"></div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>
                            {new Date(post.created_at).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span>
                            {post.like_count || 0} Likes {post.comment_count || 0} Comments
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-3">
                      <h3 className="font-serif font-bold text-gray-900">{post.title}</h3>
                      <p className="font-sans text-sm text-gray-600 mt-1">{post.content}</p>
                      <div className="flex flex-wrap gap-1 my-2"></div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>
                          {new Date(post.created_at).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span>
                          {post.like_count || 0} Likes {post.comment_count || 0} Comments
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {posts.length === 0 && (
                <div className="text-center text-gray-500">No posts yet.</div>
              )}
            </div>

            <div className="mt-6 text-center">
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 whitespace-nowrap cursor-pointer">
                Load More
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainContent;