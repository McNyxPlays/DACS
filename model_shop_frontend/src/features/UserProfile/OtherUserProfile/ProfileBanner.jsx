import React from "react";
import { FaUser } from "react-icons/fa";

const ProfileBanner = ({ userData, isEditing, setIsEditing, handleFollow, handleMessage, isFollowing, currentUser }) => {
  return (
    <div className="relative bg-white">
      <div
        className={`h-[200px] w-full ${userData.banner_image ? "" : "bg-gray-200"} overflow-hidden border-t border-b border-gray-300`}
      >
        {userData.banner_image ? (
          <img
            src={`http://localhost:80/${userData.banner_image}`}
            alt="Profile Banner"
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>
      <div className="container mx-auto px-4">
        <div className="relative">
          <div className="absolute -top-20">
            <div className="rounded-full border-4 border-white overflow-hidden flex items-center justify-center w-36 h-36 bg-gray-200">
              {userData.profile_image ? (
                <img
                  src={`http://localhost:80/${userData.profile_image}`}
                  alt="Profile Picture"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <FaUser className="text-gray-500 text-5xl" />
              )}
            </div>
          </div>
          <div className="pt-24 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{userData.name}</h1>
              <p className="text-gray-500 text-base mt-2">{userData.handle}</p>
              <p className="text-gray-500 text-base mt-2">
                {userData.followers || 0} followers • {userData.posts || 0} posts
              </p>
            </div>
            <div className="mt-6 sm:mt-0 flex space-x-4">
              <button
                onClick={handleFollow}
                className={`px-5 py-2 rounded-md text-base font-semibold ${
                  isFollowing
                    ? "bg-gray-300 text-gray-700 hover:bg-gray-400"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
              <button
                onClick={handleMessage}
                className="bg-blue-600 text-white px-5 py-2 rounded-md text-base font-semibold hover:bg-blue-700"
              >
                Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileBanner;