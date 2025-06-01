import React from "react";
import { FaUser } from "react-icons/fa";

const ProfileBanner = ({ userData, isEditing, setIsEditing }) => {
  return (
    <div className="relative bg-white">
      <div className={`h-[315px] w-full ${userData.banner_image ? '' : 'bg-gradient-to-r from-gray-200 to-gray-300'} rounded-b-2xl overflow-hidden`}>
        {userData.banner_image ? (
          <img
            src={`http://localhost:80/${userData.banner_image}`}
            alt="Profile Banner"
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>
      <div className="container mx-auto px-2">
        <div className="relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0">
          <div className="z-10 rounded-full border-4 border-white overflow-hidden flex items-center justify-center w-32 h-32 sm:w-36 sm:h-36 bg-gray-200">
            {userData.profile_image ? (
              <img
                src={`http://localhost:80/${userData.profile_image}`}
                alt="Profile Picture"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <FaUser className="text-gray-500 text-4xl" />
            )}
          </div>
          <div className="flex-1 text-center sm:text-left sm:ml-6 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white sm:text-gray-900">{userData.name}</h1>
            <p className="text-gray-400 sm:text-gray-600 text-base sm:text-lg">{userData.handle}</p>
            <p className="text-gray-500 sm:text-gray-600 text-sm">{userData.followers || 0} followers • {userData.posts || 0} posts</p>
          </div>
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
            >
              <i className="fas fa-edit mr-2"></i> Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileBanner;