import React, { useState } from "react";
import ProfileBanner from "./ProfileBanner";
import ProfileStats from "./ProfileStats";
import SidebarLeft from "./SidebarLeft";
import MainContent from "./MainContent";
import SidebarRight from "./SidebarRight";

const UserProfileOverview = ({ user }) => {
  const [activeTab, setActiveTab] = useState("builds");
  const [isEditing, setIsEditing] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [skillsInput, setSkillsInput] = useState("");
  const [skills, setSkills] = useState([
    "Gunpla Building",
    "Weathering",
    "Airbrush",
    "Panel Lining",
    "Diorama Creation",
  ]);

  // User profile data from props
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
    bio: "Passionate model builder with 5+ years of experience. Specializing in Gundam models and military vehicles. Always looking to learn new techniques and connect with fellow enthusiasts.",
    followers: 245,
    following: 127,
    posts: 86,
    profileCompletion: user ? 85 : 50,
  };

  const handleAddSkill = (e) => {
    if (e.key === "Enter" && skillsInput.trim() !== "") {
      setSkills([...skills, skillsInput.trim()]);
      setSkillsInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const togglePrivacySettings = () => {
    setIsPrivacyOpen(!isPrivacyOpen);
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
          skillsInput={skillsInput}
          setSkillsInput={setSkillsInput}
          handleAddSkill={handleAddSkill}
          handleRemoveSkill={handleRemoveSkill}
          isPrivacyOpen={isPrivacyOpen}
          togglePrivacySettings={togglePrivacySettings}
        />
        <MainContent activeTab={activeTab} setActiveTab={setActiveTab} />
        <SidebarRight userData={userData} />
      </main>
    </>
  );
};

export default UserProfileOverview;
