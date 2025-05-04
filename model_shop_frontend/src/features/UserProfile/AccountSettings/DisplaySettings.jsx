import React, { useState } from "react";

const DisplaySettings = ({ activeSection }) => {
  const [displayPreferences, setDisplayPreferences] = useState({
    theme: "light",
    language: "english",
    timezone: "America/New_York",
  });

  const handleDisplayPreferenceChange = (e) => {
    const { name, value } = e.target;
    setDisplayPreferences({
      ...displayPreferences,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Display settings saved successfully!");
  };

  return (
    <>
      {activeSection === "display" && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Display Preferences
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6 mb-6">
              <div>
                <label
                  htmlFor="theme"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Theme
                </label>
                <div className="relative">
                  <select
                    id="theme"
                    name="theme"
                    value={displayPreferences.theme}
                    onChange={handleDisplayPreferenceChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System Default</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <i className="fas fa-chevron-down"></i>
                  </div>
                </div>
              </div>
              <div>
                <label
                  htmlFor="language"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Language
                </label>
                <div className="relative">
                  <select
                    id="language"
                    name="language"
                    value={displayPreferences.language}
                    onChange={handleDisplayPreferenceChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                    <option value="japanese">Japanese</option>
                    <option value="chinese">Chinese</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <i className="fas fa-chevron-down"></i>
                  </div>
                </div>
              </div>
              <div>
                <label
                  htmlFor="timezone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Time Zone
                </label>
                <div className="relative">
                  <select
                    id="timezone"
                    name="timezone"
                    value={displayPreferences.timezone}
                    onChange={handleDisplayPreferenceChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  >
                    <option value="America/New_York">
                      Eastern Time (ET)
                    </option>
                    <option value="America/Chicago">
                      Central Time (CT)
                    </option>
                    <option value="America/Denver">
                      Mountain Time (MT)
                    </option>
                    <option value="America/Los_Angeles">
                      Pacific Time (PT)
                    </option>
                    <option value="Europe/London">
                      Greenwich Mean Time (GMT)
                    </option>
                    <option value="Europe/Paris">
                      Central European Time (CET)
                    </option>
                    <option value="Asia/Tokyo">
                      Japan Standard Time (JST)
                    </option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <i className="fas fa-chevron-down"></i>
                  </div>
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
                Apply Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default DisplaySettings;