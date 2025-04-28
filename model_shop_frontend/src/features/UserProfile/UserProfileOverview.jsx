import React, { useState, useEffect } from "react";
import * as echarts from "echarts";

const UserProfileOverview = () => {
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

  // User profile data
  const userData = {
    name: "Michael Chen",
    handle: "@mchen",
    location: "San Francisco, CA",
    joinDate: "April 2023",
    bio: "Passionate model builder with 5+ years of experience. Specializing in Gundam models and military vehicles. Always looking to learn new techniques and connect with fellow enthusiasts.",
    followers: 245,
    following: 127,
    posts: 86,
    profileCompletion: 85,
  };

  // Chart initialization for skills breakdown
  useEffect(() => {
    const chartDom = document.getElementById("skills-chart");
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      const option = {
        animation: false,
        tooltip: {
          trigger: "item",
        },
        legend: {
          show: false,
        },
        series: [
          {
            name: "Skills",
            type: "pie",
            radius: ["40%", "70%"],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: "#fff",
              borderWidth: 2,
            },
            label: {
              show: false,
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 12,
                fontWeight: "bold",
              },
            },
            labelLine: {
              show: false,
            },
            data: [
              {
                value: 35,
                name: "Gunpla Building",
                itemStyle: { color: "#3B82F6" },
              },
              {
                value: 25,
                name: "Weathering",
                itemStyle: { color: "#10B981" },
              },
              { value: 20, name: "Airbrush", itemStyle: { color: "#F59E0B" } },
              {
                value: 15,
                name: "Panel Lining",
                itemStyle: { color: "#8B5CF6" },
              },
              {
                value: 5,
                name: "Diorama Creation",
                itemStyle: { color: "#EC4899" },
              },
            ],
          },
        ],
      };
      myChart.setOption(option);

      // Resize chart when window size changes
      window.addEventListener("resize", () => {
        myChart.resize();
      });

      return () => {
        window.removeEventListener("resize", () => {
          myChart.resize();
        });
        myChart.dispose();
      };
    }
  }, [activeTab]);

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
      {/* Profile Banner */}
      <div className="relative">
        <div className="h-64 w-full bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
          <img
            src="https://readdy.ai/api/search-image?query=professional%2520model%2520building%2520workspace%2520with%2520organized%2520tools%252C%2520paints%252C%2520and%2520partially%2520completed%2520models%252C%2520soft%2520studio%2520lighting%252C%2520wide%2520angle%2520view%252C%2520clean%2520modern%2520aesthetic%252C%2520high%2520resolution%2520photography&width=1440&height=400&seq=14&orientation=landscape"
            alt="Profile Banner"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4">
          <div className="relative -mt-24 sm:-mt-16 flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0">
            <div className="z-10 rounded-full border-4 border-white shadow-lg overflow-hidden">
              <img
                src="https://readdy.ai/api/search-image?query=professional%2520headshot%2520of%2520a%2520male%2520model%2520builder%2520with%2520short%2520hair%252C%2520neutral%2520expression%252C%2520studio%2520lighting%252C%2520clean%2520background%252C%2520high%2520quality%2520portrait&width=160&height=160&seq=15&orientation=squarish"
                alt="Profile Picture"
                className="w-32 h-32 object-cover"
              />
            </div>
            <div className="flex-1 text-center sm:text-left sm:ml-6 mb-4 sm:mb-8">
              <h1 className="text-2xl font-bold text-white sm:text-gray-900">
                {userData.name}
              </h1>
              <p className="text-white/90 sm:text-gray-600">
                {userData.handle}
              </p>
            </div>
            <div className="flex space-x-3 mb-4 sm:mb-8">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 !rounded-button whitespace-nowrap cursor-pointer flex items-center"
              >
                <i className="fas fa-edit mr-2"></i> Edit Profile
              </button>
              <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 !rounded-button whitespace-nowrap cursor-pointer flex items-center">
                <i className="fas fa-share-alt mr-2"></i> Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Stats Bar */}
      <div className="bg-white border-t border-b border-gray-200 py-4 mb-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-center sm:justify-start space-x-8 sm:space-x-12">
            <div className="text-center">
              <div className="text-xl font-bold">{userData.posts}</div>
              <div className="text-sm text-gray-500">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{userData.followers}</div>
              <div className="text-sm text-gray-500">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{userData.following}</div>
              <div className="text-sm text-gray-500">Following</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 flex flex-col md:flex-row">
        {/* Left Sidebar */}
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

        {/* Main Content Area */}
        <div className="w-full md:w-3/5">
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b flex">
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === "builds"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
                onClick={() => setActiveTab("builds")}
              >
                Builds
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === "activity"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
                onClick={() => setActiveTab("activity")}
              >
                Activity
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === "collections"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
                onClick={() => setActiveTab("collections")}
              >
                Collections
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === "likes"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
                onClick={() => setActiveTab("likes")}
              >
                Likes
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === "comments"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
                onClick={() => setActiveTab("comments")}
              >
                Comments
              </button>
            </div>

            {activeTab === "builds" && (
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold">My Builds</h2>
                  <div className="flex space-x-2">
                    <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50 !rounded-button whitespace-nowrap cursor-pointer">
                      <i className="fas fa-filter mr-1"></i> Filter
                    </button>
                    <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50 !rounded-button whitespace-nowrap cursor-pointer">
                      <i className="fas fa-sort mr-1"></i> Sort
                    </button>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 !rounded-button whitespace-nowrap cursor-pointer">
                      <i className="fas fa-plus mr-1"></i> New Build
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Build 1 */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative">
                      <img
                        src="https://readdy.ai/api/search-image?query=highly%2520detailed%2520Gundam%2520model%2520kit%252C%2520RG%2520Gundam%252000%2520The%25200%2520Raiser%252C%2520perfect%2520lighting%252C%2520studio%2520photography%252C%2520dramatic%2520pose%252C%2520high%2520resolution%252C%2520professional%2520product%2520photography%252C%2520clean%2520background%252C%2520intricate%2520details%2520visible&width=400&height=300&seq=16&orientation=landscape"
                        alt="Gundam model"
                        className="w-full h-48 object-cover object-top"
                      />
                      <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        Featured
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900">
                        RG Gundam 00 Raiser
                      </h3>
                      <div className="flex flex-wrap gap-1 my-2">
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                          Gunpla
                        </span>
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                          1/144
                        </span>
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                          Weathered
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>April 15, 2025</span>
                        <div className="flex space-x-3">
                          <span className="flex items-center">
                            <i className="far fa-heart mr-1"></i> 42
                          </span>
                          <span className="flex items-center">
                            <i className="far fa-comment mr-1"></i> 15
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Build 2 */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative">
                      <img
                        src="https://readdy.ai/api/search-image?query=highly%2520detailed%25201%252F35%2520scale%2520King%2520Tiger%2520tank%2520model%252C%2520perfect%2520weathering%252C%2520realistic%2520diorama%2520with%2520vegetation%2520and%2520terrain%252C%2520studio%2520lighting%252C%2520professional%2520photography%252C%2520high%2520resolution%252C%2520intricate%2520details%2520visible%252C%2520museum%2520quality%2520model&width=400&height=300&seq=17&orientation=landscape"
                        alt="Tank model"
                        className="w-full h-48 object-cover object-top"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900">
                        King Tiger Tank Diorama
                      </h3>
                      <div className="flex flex-wrap gap-1 my-2">
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                          Military
                        </span>
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                          1/35
                        </span>
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                          Diorama
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>March 28, 2025</span>
                        <div className="flex space-x-3">
                          <span className="flex items-center">
                            <i className="far fa-heart mr-1"></i> 67
                          </span>
                          <span className="flex items-center">
                            <i className="far fa-comment mr-1"></i> 23
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Build 3 */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative">
                      <img
                        src="https://readdy.ai/api/search-image?query=highly%2520detailed%2520aircraft%2520model%252C%2520perfect%2520weathering%252C%2520realistic%2520details%252C%2520studio%2520lighting%252C%2520professional%2520photography%252C%2520high%2520resolution%252C%2520intricate%2520details%2520visible%252C%2520museum%2520quality%2520model%252C%25201%252F48%2520scale&width=400&height=300&seq=18&orientation=landscape"
                        alt="Aircraft model"
                        className="w-full h-48 object-cover object-top"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900">
                        P-51D Mustang
                      </h3>
                      <div className="flex flex-wrap gap-1 my-2">
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                          Aircraft
                        </span>
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                          1/48
                        </span>
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                          WWII
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>February 12, 2025</span>
                        <div className="flex space-x-3">
                          <span className="flex items-center">
                            <i className="far fa-heart mr-1"></i> 38
                          </span>
                          <span className="flex items-center">
                            <i className="far fa-comment mr-1"></i> 11
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Build 4 */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative">
                      <img
                        src="https://readdy.ai/api/search-image?query=highly%2520detailed%2520sci-fi%2520mecha%2520model%2520kit%252C%2520perfect%2520lighting%252C%2520studio%2520photography%252C%2520dramatic%2520pose%252C%2520high%2520resolution%252C%2520professional%2520product%2520photography%252C%2520clean%2520background%252C%2520intricate%2520details%2520visible%252C%2520custom%2520paint%2520job&width=400&height=300&seq=19&orientation=landscape"
                        alt="Mecha model"
                        className="w-full h-48 object-cover object-top"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900">
                        MG Barbatos Custom
                      </h3>
                      <div className="flex flex-wrap gap-1 my-2">
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                          Gunpla
                        </span>
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                          1/100
                        </span>
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                          Custom
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>January 30, 2025</span>
                        <div className="flex space-x-3">
                          <span className="flex items-center">
                            <i className="far fa-heart mr-1"></i> 54
                          </span>
                          <span className="flex items-center">
                            <i className="far fa-comment mr-1"></i> 19
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 !rounded-button whitespace-nowrap cursor-pointer">
                    Load More
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full md:w-1/5 mt-6 md:mt-0 md:ml-6">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <h2 className="font-medium mb-3">Profile Completion</h2>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${userData.profileCompletion}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {userData.profileCompletion}% complete
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                <span className="text-gray-700">Profile picture uploaded</span>
              </div>
              <div className="flex items-center text-sm">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                <span className="text-gray-700">Bio information added</span>
              </div>
              <div className="flex items-center text-sm">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                <span className="text-gray-700">Skills added</span>
              </div>
              <div className="flex items-center text-sm">
                <i className="far fa-circle text-gray-400 mr-2"></i>
                <span className="text-gray-500">
                  Connect more social accounts
                </span>
              </div>
              <div className="flex items-center text-sm">
                <i className="far fa-circle text-gray-400 mr-2"></i>
                <span className="text-gray-500">Verify email address</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <h2 className="font-medium mb-4">Skills Breakdown</h2>
            <div id="skills-chart" className="w-full h-48"></div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <h2 className="font-medium mb-3">Recent Achievements</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mr-3">
                  <i className="fas fa-trophy text-blue-600"></i>
                </div>
                <div>
                  <p className="text-sm font-medium">Featured Builder</p>
                  <p className="text-xs text-gray-500">April 2025</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-full p-2 mr-3">
                  <i className="fas fa-award text-green-600"></i>
                </div>
                <div>
                  <p className="text-sm font-medium">100+ Followers</p>
                  <p className="text-xs text-gray-500">March 2025</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-full p-2 mr-3">
                  <i className="fas fa-medal text-purple-600"></i>
                </div>
                <div>
                  <p className="text-sm font-medium">Contest Winner</p>
                  <p className="text-xs text-gray-500">February 2025</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="font-medium mb-3">Connected Accounts</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <i className="fab fa-instagram text-pink-600 w-8 text-lg"></i>
                  <span className="text-sm">Instagram</span>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <i className="fab fa-youtube text-red-600 w-8 text-lg"></i>
                  <span className="text-sm">YouTube</span>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <i className="fab fa-twitter text-blue-400 w-8 text-lg"></i>
                  <span className="text-sm">Twitter</span>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <i className="fab fa-facebook text-blue-600 w-8 text-lg"></i>
                  <span className="text-sm">Facebook</span>
                </div>
                <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full !rounded-button whitespace-nowrap cursor-pointer">
                  Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default UserProfileOverview;
