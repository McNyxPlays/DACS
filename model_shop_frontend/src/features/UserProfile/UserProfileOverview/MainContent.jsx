import React from "react";

const MainContent = ({ activeTab, setActiveTab }) => {
  return (
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
                  <h3 className="font-medium text-gray-900">P-51D Mustang</h3>
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
  );
};

export default MainContent;
