import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../api/index";
import LeftSidebar from "./LeftSidebar";
import FeaturedContent from "./FeaturedContent";
import FeaturedPosts from "./FeaturedPosts";
import ForumsSection from "./ForumsSection";
import TutorialsEvents from "./TutorialsEvents";
import RightSidebar from "./RightSidebar";
import { Toastify } from "../../components/Toastify";

function Community() {
  const { user } = useOutletContext();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []); // Fetch posts on mount

  const fetchPosts = async () => {
    try {
      const response = await api.get("/posts.php", {
        params: { limit: 10, offset: 0 },
      });
      if (response.data.status === "success") {
        setPosts(response.data.posts);
      } else {
        Toastify.error("Failed to fetch posts: " + (response.data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      Toastify.error("Failed to fetch posts.");
    }
  };

  const handleLike = async (postId, isLiked) => {
    if (!user) {
      Toastify.error("Please log in to like posts.");
      return;
    }
    try {
      const response = await api.put("/posts.php?action=like", { post_id: postId });
      setPosts(
        posts.map((post) =>
          post.post_id === postId
            ? { ...post, is_liked: response.data.liked, like_count: response.data.like_count }
            : post
        )
      );
    } catch (err) {
      console.error("Error liking post:", err);
      Toastify.error("Failed to like post.");
    }
  };

  const handleCommentSubmit = async (postId, content) => {
    if (!user) {
      Toastify.error("Please log in to comment.");
      return;
    }
    if (!content.trim()) return;
    try {
      await api.put("/posts.php?action=comment", { post_id: postId, content });
      setPosts(
        posts.map((post) =>
          post.post_id === postId ? { ...post, comment_count: post.comment_count + 1 } : post
        )
      );
      Toastify.success("Comment added successfully!");
    } catch (err) {
      console.error("Error adding comment:", err);
      Toastify.error("Failed to add comment.");
    }
  };

  const handlePostSubmit = (newPostData) => {
    setPosts([newPostData, ...posts]);
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter((post) => post.post_id !== postId));
  };

  // Optional: Add a refresh function to trigger fetchPosts on navigation
  const refreshPosts = () => {
    fetchPosts();
  };

  return (
    <div className="bg-gray-50 font-inter">
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-8">
            <LeftSidebar />
            <div className="flex-1 max-w-[650px] mx-auto">
              <FeaturedContent user={user} onPostSubmit={handlePostSubmit} />
              <FeaturedPosts
                posts={posts}
                user={user}
                onLike={handleLike}
                onCommentSubmit={handleCommentSubmit}
                onDeletePost={handleDeletePost}
              />
              <ForumsSection />
              <TutorialsEvents />
            </div>
            <div className="lg:w-80">
              {user ? <RightSidebar user={user} /> : <div className="hidden lg:block"></div>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Community;