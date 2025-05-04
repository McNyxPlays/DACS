import React from "react";

const SidebarLeft = ({
  userData,
  isEditing,
  skills,
  skillsInput,
  setSkillsInput,
  handleAddSkill,
  handleRemoveSkill,
  isPrivacyOpen,
  togglePrivacySettings,
}) => {
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
          {skills.map((skill, index) => (
            <div
              key={index}
              className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full flex items-center"
            >
              <span>{skill}</span>
              {isEditing && (
                <button
                  onClick={() => handleRemoveSkill(skill)}
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
          <div className="flex items-center">
            <i className="fab fa-instagram text-pink-600 w-8 text-lg"></i>
            <a
              href="https://instagram.com/mchen_models"
              className="text-sm text-blue-600 hover:underline"
            >
              @mchen_models
            </a>
          </div>
          <div className="flex items-center">
            <i className="fab fa-youtube text-red-600 w-8 text-lg"></i>
            <a
              href="https://youtube.com/@MichaelsModelWorkshop"
              className="text-sm text-blue-600 hover:underline"
            >
              Michael's Model Workshop
            </a>
          </div>
          <div className="flex items-center">
            <i className="fab fa-twitter text-blue-400 w-8 text-lg"></i>
            <a
              href="https://twitter.com/mchen_builds"
              className="text-sm text-blue-600 hover:underline"
            >
              @mchen_builds
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-medium">Privacy Settings</h2>
          <button
            onClick={togglePrivacySettings}
            className="text-blue-600 text-sm hover:text-blue-800 cursor-pointer"
          >
            <i
              className={`fas fa-chevron-${isPrivacyOpen ? "up" : "down"}`}
            ></i>
          </button>
        </div>
        {isPrivacyOpen && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">
                Show my online status
              </label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  id="toggle1"
                  defaultChecked
                  className="sr-only"
                />
                <label
                  htmlFor="toggle1"
                  className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                >
                  <span className="block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out translate-x-4"></span>
                </label>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">
                Allow message requests
              </label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  id="toggle2"
                  defaultChecked
                  className="sr-only"
                />
                <label
                  htmlFor="toggle2"
                  className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                >
                  <span className="block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out translate-x-4"></span>
                </label>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">
                Show my activity feed
              </label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  id="toggle3"
                  defaultChecked
                  className="sr-only"
                />
                <label
                  htmlFor="toggle3"
                  className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                >
                  <span className="block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out translate-x-4"></span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarLeft;