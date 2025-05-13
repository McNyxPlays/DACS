import React, { useState, useEffect } from "react";
import axios from "axios";
import ProfileBanner from "./ProfileBanner";
import ProfileStats from "./ProfileStats";
import SidebarLeft from "./SidebarLeft";
import MainContent from "./MainContent";
import SidebarRight from "./SidebarRight";

const UserProfileOverview = ({ user }) => {
  const [activeTab, setActiveTab] = useState("builds");
  const [isEditing, setIsEditing] = useState(false);
  const [skills, setSkills] = useState([]);
  const [skillsInput, setSkillsInput] = useState("");
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [posts, setPosts] = useState(0);

  // Fetch skills from API
  useEffect(() => {
    axios
      .get("http://localhost/model_shop_backend/api/skills.php", {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.status === "success") {
          setSkills(response.data.skills);
        }
      })
      .catch((error) => {
        console.error("Error fetching skills:", error);
      });

    // Fetch followers, following, and posts
    axios
      .get("http://localhost/model_shop_backend/api/user_stats.php", {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.status === "success") {
          setFollowers(response.data.followers);
          setFollowing(response.data.following);
          setPosts(response.data.posts);
        }
      })
      .catch((error) => {
        console.error("Error fetching user stats:", error);
      });
  }, []);

  // User profile data from props and API
  const userData = {
    name: user?.full_name || "Unknown User",
    handle: user?.email ? `@${user.email.split("@")[0]}` : "@user",
    location: user?.address || "Not specified",
    joinDate: user?.created_at
      ? new Date(user.created_at).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "Unknown",
    bio:
      user?.bio ||
      "Passionate model builder with 5+ years of experience. Specializing in Gundam models and military vehicles. Always looking to learn new techniques and connect with fellow enthusiasts.",
    followers: followers,
    following: following,
    posts: posts,
    profileCompletion: user ? 85 : 50,
  };

  const handleAddSkill = (e) => {
    if (e.key === "Enter" && skillsInput.trim() !== "") {
      axios
        .post(
          "http://localhost/model_shop_backend/api/skills.php",
          { skill_name: skillsInput.trim() },
          { withCredentials: true }
        )
        .then((response) => {
          if (response.data.status === "success") {
            setSkills([...skills, response.data.skill]);
            setSkillsInput("");
          }
        })
        .catch((error) => {
          console.error("Error adding skill:", error);
        });
    }
  };

  const handleRemoveSkill = (skill_id) => {
    axios
      .delete("http://localhost/model_shop_backend/api/skills.php", {
        data: { skill_id },
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.status === "success") {
          setSkills(skills.filter((skill) => skill.skill_id !== skill_id));
        }
      })
      .catch((error) => {
        console.error("Error removing skill:", error);
      });
  };

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
          skills={skills}
          setSkills={setSkills}
          skillsInput={skillsInput}
          setSkillsInput={setSkillsInput}
          handleAddSkill={handleAddSkill}
          handleRemoveSkill={handleRemoveSkill}
        />
        <MainContent activeTab={activeTab} setActiveTab={setActiveTab} />
        <SidebarRight userData={userData} />
      </main>
    </>
  );
};

export default UserProfileOverview;
