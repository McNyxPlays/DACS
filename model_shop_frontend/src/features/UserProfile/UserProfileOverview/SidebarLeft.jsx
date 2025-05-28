import React, { useEffect, useState } from "react";
import api from "../../../api/index";
import { Toastify } from "../../../components/Toastify";

const SidebarLeft = ({ userData, isEditing, setUserData }) => {
  const [socialLinks, setSocialLinks] = useState([]);
  const [bioInput, setBioInput] = useState(userData.bio);

  // Fetch social links and bio from API
  useEffect(() => {
    api
      .get("/social_links.php")
      .then((response) => {
        if (response.data.status === "success") {
          setSocialLinks(response.data.social_links);
          // Use the first social link's bio if available
          if (response.data.social_links.length > 0 && response.data.social_links[0].bio) {
            setBioInput(response.data.social_links[0].bio);
            setUserData((prev) => ({ ...prev, bio: response.data.social_links[0].bio }));
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching social links:", error);
        Toastify.error("Failed to load social links.");
      });
  }, [setUserData]);

  // Handle bio update when editing
  const handleBioUpdate = () => {
    if (!isEditing) return;
    api
      .put("/social_links.php", {
        link_id: socialLinks.length > 0 ? socialLinks[0].link_id : null,
        platform: socialLinks.length > 0 ? socialLinks[0].platform : "other",
        link_url: socialLinks.length > 0 ? socialLinks[0].link_url : "",
        display_name: socialLinks.length > 0 ? socialLinks[0].display_name : "",
        bio: bioInput,
      })
      .then((response) => {
        if (response.data.status === "success") {
          setUserData((prev) => ({ ...prev, bio: bioInput }));
          Toastify.success("Bio updated successfully!");
        }
      })
      .catch((error) => {
        console.error("Error updating bio:", error);
        Toastify.error("Failed to update bio.");
      });
  };

  return (
    <div className="w-full md:w-1/5 mb-6 md:mb-0 md:mr-6">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h2 className="font-medium mb-3">About</h2>
        {isEditing ? (
          <textarea
            className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-700 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={5}
            value={bioInput}
            onChange={(e) => setBioInput(e.target.value)}
            onBlur={handleBioUpdate}
          />
        ) : (
          <p className="text-lg text-gray-700 mb-3">{userData.bio}</p>
        )}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <i className="fas fa-map-marker-alt w-5 text-gray-500"></i>
            <span>{userData.location}</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-calendar-alt w-14"></i>
            <span>Joined {userData.created_at}</span>
          </div>
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
              />
              <a
                href={link.link_url}
                className="text-sm text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
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