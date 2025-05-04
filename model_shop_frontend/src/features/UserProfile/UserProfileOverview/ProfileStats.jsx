import React from "react";

const ProfileStats = ({ userData }) => {
  return (
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
  );
};

export default ProfileStats;