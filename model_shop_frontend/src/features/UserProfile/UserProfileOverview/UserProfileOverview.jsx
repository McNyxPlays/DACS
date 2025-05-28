import React, { useState, useEffect } from "react";
import api from "../../../api/index";
import { Toastify } from "../../../components/Toastify";
import ProfileBanner from "./ProfileBanner";
import ProfileStats from "./ProfileStats";
import SidebarLeft from "./SidebarLeft";
import MainContent from "./MainContent";
import SidebarRight from "./SidebarRight";

const UserProfileOverview = ({ user }) => {
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: user?.full_name || "Unknown User",
    handle: user?.email ? `@${user.email.split("@")[0]}` : "@user",
    location: user?.address || "Not specified",
    created_at: user?.created_at
      ? new Date(user.created_at).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "Unknown",
    bio: "Passionate model builder.",
    followers: 0,
    posts: 0,
    comments: 0,
    profile_completion: user ? 85 : 50,
  });

  // Fetch user stats
  useEffect(() => {
    api
      .get("/user_stats.php")
      .then((response) => {
        if (response.data.status === "success") {
          setUserData((prev) => ({
            ...prev,
            followers: response.data.followers,
            posts: response.data.posts,
            comments: response.data.comments,
          }));
        }
      })
      .catch((error) => {
        console.error("Error fetching user stats:", error);
        Toastify.error("Failed to load user stats.");
      });
  }, []);

  return (
    <>
      <ProfileBanner
        userData={userData}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
      />
      <ProfileStats userData={userData} />
      <main className="container mx-auto px-4 py-6 flex flex-col md:flex-row">
        <SidebarLeft
          userData={userData}
          isEditing={isEditing}
          setUserData={setUserData}
        />
        <MainContent activeTab={activeTab} setActiveTab={setActiveTab} />
        <SidebarRight userData={userData} />
      </main>
    </>
  );
};

export default UserProfileOverview;