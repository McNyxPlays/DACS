import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import styles from "../../styles/CommunityHub.module.css";
import api from "../../api/index";

function RightSidebar({ user }) {
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({ followers: 0, following: 0, posts: 0 });
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    images: [],
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (user && user.user_id) {
        try {
          const userResponse = await api.get("/user.php");
          const statsResponse = await api.get("/user_stats.php");
          setUserData(userResponse.data.user);
          setStats({
            followers: statsResponse.data.followers,
            following: statsResponse.data.following,
            posts: statsResponse.data.posts,
          });
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      }
    };

    fetchUserData();
  }, [user]);

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
      // Optionally update posts in FeaturedContent if needed (requires parent state management)
      alert("Post created successfully!");
      setNewPost({ title: "", content: "", images: [] });
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Failed to create post.");
    }
  };

  return (
    <div className="w-full lg:w-80 space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={
              userData?.profile_image ||
              "https://readdy.ai/api/search-image?query=professional%2520portrait%2520photo%2520of%2520a%2520young%2520man%2520with%2520short%2520brown%2520hair%2520and%2520casual%2520attire%252C%2520neutral%2520expression%252C%2520looking%2520at%2520camera%252C%2520indoor%2520studio%2520lighting%252C%2520high%2520quality%252C%2520photorealistic&width=100&height=100&seq=1001&orientation=squarish"
            }
            alt="User Profile"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <div className="font-medium text-gray-900">Guest User</div>
            <div className="text-xs text-gray-500">
              Intermediate Builder • Member since{" "}
              {userData?.created_at?.substring(0, 4) || "2024"}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-gray-100 rounded p-2 text-center">
            <div className="font-bold text-gray-900">{stats.posts}</div>
            <div className="text-xs text-gray-600">Posts</div>
          </div>
          <div className="bg-gray-100 rounded p-2 text-center">
            <div className="font-bold text-gray-900">{stats.followers}</div>
            <div className="text-xs text-gray-600">Followers</div>
          </div>
        </div>
        <div className="flex justify-center">
          <NavLink
            to="/profile"
            className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition whitespace-nowrap"
          >
            <i className="ri-user-settings-line mr-1"></i>Edit Profile
          </NavLink>
        </div>
      </div>
      {user && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <form onSubmit={handlePostSubmit} className="space-y-2">
            <div className="flex items-center gap-3">
              <img
                src={
                  user.profile_image ||
                  "https://readdy.ai/api/search-image?query=professional%2520portrait%2520photo%2520of%2520a%2520young%2520man%2520with%2520short%2520brown%2520hair%2520and%2520casual%2520attire%252C%2520neutral%2520expression%252C%2520looking%2520at%2520camera%252C%2520indoor%2520studio%2520lighting%252C%2520high%2520quality%252C%2520photorealistic&width=100&height=100&seq=1001&orientation=squarish"
                }
                alt="User Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
              <input
                type="text"
                placeholder="Post title..."
                value={newPost.title}
                onChange={(e) =>
                  setNewPost({ ...newPost, title: e.target.value })
                }
                className="w-full px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <textarea
              placeholder="What would you like to share today?"
              value={newPost.content}
              onChange={(e) =>
                setNewPost({ ...newPost, content: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            />
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
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-gray-900 mb-4 px-2">
          Active Discussions
        </h3>
        <div className="space-y-3">
          <div className="flex gap-3 p-2 hover:bg-gray-50 rounded-lg">
            <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary rounded-full flex-shrink-0">
              <i className="ri-discuss-line"></i>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 text-sm">
                What's your favorite panel lining technique?
              </h4>
              <div className="flex items-center text-xs text-gray-500">
                <span>32 replies</span>
                <span className="mx-1">•</span>
                <span>1 hour ago</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 text-center">
          <a
            href="#"
            className="text-primary text-sm font-medium hover:underline"
          >
            View More
          </a>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-gray-900 mb-4 px-2">
          Community Poll
        </h3>
        <div className="px-2">
          <h4 className="font-medium text-gray-900 mb-3">
            What's your favorite model kit scale?
          </h4>
          <div className="space-y-2 mb-4">
            <div className="flex items-center">
              <label className={styles.customCheckbox}>
                <input type="radio" name="scale" value="1/144" />
                <span className={styles.checkmark}></span>
              </label>
              <span className="ml-2 text-gray-700">1/144 Scale</span>
            </div>
          </div>
          <button className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary/90 transition rounded-button whitespace-nowrap">
            Vote
          </button>
        </div>
      </div>
    </div>
  );
}

export default RightSidebar;
