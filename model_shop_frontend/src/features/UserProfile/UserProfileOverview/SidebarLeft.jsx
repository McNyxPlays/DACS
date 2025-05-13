import React, { useEffect, useState } from "react";
import axios from "axios";

const SidebarLeft = ({
  userData,
  isEditing,
  skills,
  setSkills,
  skillsInput,
  setSkillsInput,
  handleAddSkill,
  handleRemoveSkill,
}) => {
  const [socialLinks, setSocialLinks] = useState([]);

  // Fetch social links from API
  useEffect(() => {
    axios
      .get("http://localhost/model_shop_backend/api/social_links.php", {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.status === "success") {
          setSocialLinks(response.data.social_links);
        }
      })
      .catch((error) => {
        console.error("Error fetching social links:", error);
      });
  }, []);

  return (
    <div className="w-full md:w-1/5 mb-6 md:mb-0 md:mr-6">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h2 className="font-medium mb-3">About</h2>
        {isEditing ? (
          <textarea
            className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-700 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={5}
            defaultValue={userData.bio}
          ></textarea>
        ) : (
          <p className="text-sm text-gray-700 mb-3">{userData.bio}</p>
        )}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <i className="fas fa-map-marker-alt w-5 text-gray-400"></i>
            <span>{userData.location}</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-calendar-alt w-5 text-gray-400"></i>
            <span>Joined {userData.joinDate}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-medium">Skills</h2>
          {isEditing && (
            <button className="text-blue-600 text-sm hover:text-blue-800 cursor-pointer">
              <i className="fas fa-plus"></i>
            </button>
          )}
        </div>
        {isEditing ? (
          <div className="mb-3">
            <input
              type="text"
              placeholder="Add a skill and press Enter"
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              onKeyDown={handleAddSkill}
            />
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2 mb-3">
          {skills.map((skill) => (
            <div
              key={skill.skill_id}
              className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full flex items-center"
            >
              <span>{skill.skill_name}</span>
              {isEditing && (
                <button
                  onClick={() => handleRemoveSkill(skill.skill_id)}
                  className="ml-1 text-gray-500 hover:text-red-500 cursor-pointer"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-medium">Social Links</h2>
          {isEditing && (
            <button className="text-blue-600 text-sm hover:text-blue-800 cursor-pointer">
              <i className="fas fa-edit"></i>
            </button>
          )}
        </div>
        <div className="space-y-3">
          {socialLinks.map((link) => (
            <div key={link.link_id} className="flex items-center">
              <i
                className={`fab fa-${link.platform} text-${
                  link.platform === "instagram"
                    ? "pink"
                    : link.platform === "youtube"
                    ? "red"
                    : link.platform === "twitter"
                    ? "blue"
                    : "blue"
                }-600 w-8 text-lg`}
              ></i>
              <a
                href={link.link_url}
                className="text-sm text-blue-600 hover:underline"
              >
                {link.display_name}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SidebarLeft;
