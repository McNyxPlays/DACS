import React, { useState } from "react";

const PrivacySettings = ({ activeSection }) => {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showOnlineStatus: true,
    allowDirectMessages: true,
    showBuildHistory: true,
    whoCanSeeBuilds: "everyone",
  });

  const handlePrivacyToggle = (setting) => {
    setPrivacySettings({
      ...privacySettings,
      [setting]: !privacySettings[setting],
    });
  };

  const handlePrivacyRadioChange = (e) => {
    setPrivacySettings({
      ...privacySettings,
      whoCanSeeBuilds: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Privacy settings saved successfully!");
  };

  return (
    <>
      {activeSection === "privacy" && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Privacy Settings
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h3 className="font-medium text-gray-800">
                    Profile Visibility
                  </h3>
                  <p className="text-sm text-gray-600">
                    Set your profile to public or private
                  </p>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    className={`w-12 h-6 rounded-full ${
                      privacySettings.profileVisibility === "public"
                        ? "bg-blue-600"
                        : "bg-gray-300"
                    } transition-colors duration-200 focus:outline-none cursor-pointer`}
                    onClick={() =>
                      setPrivacySettings({
                        ...privacySettings,
                        profileVisibility:
                          privacySettings.profileVisibility === "public"
                            ? "private"
                            : "public",
                      })
                    }
                  >
                    <span
                      className={`block w-4 h-4 bg-white rounded-full transform transition-transform duration-200 ${
                        privacySettings.profileVisibility === "public"
                          ? "translate-x-7"
                          : "translate-x-1"
                      }`}
                    ></span>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h3 className="font-medium text-gray-800">
                    Show Online Status
                  </h3>
                  <p className="text-sm text-gray-600">
                    Allow others to see when you're online
                  </p>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    className={`w-12 h-6 rounded-full ${
                      privacySettings.showOnlineStatus
                        ? "bg-blue-600"
                        : "bg-gray-300"
                    } transition-colors duration-200 focus:outline-none cursor-pointer`}
                    onClick={() => handlePrivacyToggle("showOnlineStatus")}
                  >
                    <span
                      className={`block w-4 h-4 bg-white rounded-full transform transition-transform duration-200 ${
                        privacySettings.showOnlineStatus
                          ? "translate-x-7"
                          : "translate-x-1"
                      }`}
                    ></span>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h3 className="font-medium text-gray-800">
                    Allow Direct Messages
                  </h3>
                  <p className="text-sm text-gray-600">
                    Allow others to send you direct messages
                  </p>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    className={`w-12 h-6 rounded-full ${
                      privacySettings.allowDirectMessages
                        ? "bg-blue-600"
                        : "bg-gray-300"
                    } transition-colors duration-200 focus:outline-none cursor-pointer`}
                    onClick={() => handlePrivacyToggle("allowDirectMessages")}
                  >
                    <span
                      className={`block w-4 h-4 bg-white rounded-full transform transition-transform duration-200 ${
                        privacySettings.allowDirectMessages
                          ? "translate-x-7"
                          : "translate-x-1"
                      }`}
                    ></span>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h3 className="font-medium text-gray-800">
                    Show Build History
                  </h3>
                  <p className="text-sm text-gray-600">
                    Allow others to see your build history
                  </p>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    className={`w-12 h-6 rounded-full ${
                      privacySettings.showBuildHistory
                        ? "bg-blue-600"
                        : "bg-gray-300"
                    } transition-colors duration-200 focus:outline-none cursor-pointer`}
                    onClick={() => handlePrivacyToggle("showBuildHistory")}
                  >
                    <span
                      className={`block w-4 h-4 bg-white rounded-full transform transition-transform duration-200 ${
                        privacySettings.showBuildHistory
                          ? "translate-x-7"
                          : "translate-x-1"
                      }`}
                    ></span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-3">
                Who can see my builds
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="everyone"
                    name="whoCanSeeBuilds"
                    value="everyone"
                    checked={privacySettings.whoCanSeeBuilds === "everyone"}
                    onChange={handlePrivacyRadioChange}
                    className="mr-2"
                  />
                  <label htmlFor="everyone" className="text-gray-700">
                    Everyone
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="friends"
                    name="whoCanSeeBuilds"
                    value="friends"
                    checked={privacySettings.whoCanSeeBuilds === "friends"}
                    onChange={handlePrivacyRadioChange}
                    className="mr-2"
                  />
                  <label htmlFor="friends" className="text-gray-700">
                    Friends Only
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="onlyMe"
                    name="whoCanSeeBuilds"
                    value="onlyMe"
                    checked={privacySettings.whoCanSeeBuilds === "onlyMe"}
                    onChange={handlePrivacyRadioChange}
                    className="mr-2"
                  />
                  <label htmlFor="onlyMe" className="text-gray-700">
                    Only Me
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-3 hover:bg-gray-50 !rounded-button whitespace-nowrap cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 !rounded-button whitespace-nowrap cursor-pointer"
              >
                Update Privacy
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default PrivacySettings;