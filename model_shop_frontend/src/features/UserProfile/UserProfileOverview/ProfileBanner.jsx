import React from "react";

const ProfileBanner = ({ userData, isEditing, setIsEditing }) => {
  return (
    <div className="relative">
      <div className="h-64 w-full bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
        <img
          src="https://readdy.ai/api/search-image?query=professional%2520model%2520building%2520workspace%2520with%2520organized%2520tools%252C%2520paints%252C%2520and%2520partially%2520completed%2520models%252C%2520soft%2520studio%2520lighting%2520wide%2520angle%2520view%252C%2520clean%2520modern%2520aesthetic%2520high%2520resolution%2520photography&width=1440&height=400&seq=14&orientation=landscape"
          alt="Profile Banner"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4">
        <div className="relative -mt-24 sm:-mt-16 flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0">
          <div className="z-10 rounded-full border-4 border-white shadow-lg overflow-hidden">
            <img
              src="https://readdy.ai/api/search-image?query=professional%2520headshot%2520of%2520a%2520male%2520model%2520builder%2520with%2520short%2520hair%252C%2520neutral%2520expression%2520studio%2520lighting%2520clean%2520background%2520high%2520quality%2520portrait&width=160&height=160&seq=15&orientation=squarish"
              alt="Profile Picture"
              className="w-32 h-32 object-cover"
            />
          </div>
          <div className="flex-1 text-center sm:text-left sm:ml-6 mb-4 sm:mb-8">
            <h1 className="text-2xl font-bold text-white sm:text-gray-900">
              {userData.name}
            </h1>
            <p className="text-white/90 sm:text-gray-600">{userData.handle}</p>
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
  );
};

export default ProfileBanner;