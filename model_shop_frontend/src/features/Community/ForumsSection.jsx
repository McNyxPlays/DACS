import styles from "../../styles/CommunityHub.module.css";

function ForumsSection() {
  return (
    <div id="forums" className="bg-white rounded-lg shadow-sm mb-6 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Discussion Forums</h2>
        <button className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition rounded-button whitespace-nowrap">
          <i className="ri-add-line mr-1"></i>New Topic
        </button>
      </div>
      <div className="space-y-4">
        <div
          className={`border border-gray-200 rounded-lg overflow-hidden ${styles.forumCategoryItem}`}
        >
          <div className="flex items-center p-4 bg-gray-50">
            <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary rounded-full mr-3">
              <i className="ri-tools-line ri-lg"></i>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Building Techniques</h3>
              <p className="text-gray-500 text-sm">
                Tips, tricks, and discussions about model building techniques
              </p>
            </div>
            <div className="hidden md:flex items-center gap-10 text-sm text-gray-500">
              <div className="text-center">
                <div className="font-medium text-gray-700">1,245</div>
                <div>Topics</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-700">8,731</div>
                <div>Posts</div>
              </div>
            </div>
            <div
              className={`hidden md:flex items-center ml-4 ${styles.hoverShow}`}
            >
              <a href="#" className="text-primary font-medium hover:underline">
                View All
              </a>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="flex items-center p-4 hover:bg-gray-50">
              <img
                src="https://readdy.ai/api/search-image?query=professional%2520portrait%2520photo%2520of%2520a%2520young%2520woman%2520with%2520short%2520blonde%2520hair%252C%2520casual%2520attire%252C%2520friendly%2520smile%252C%2520indoor%2520studio%2520lighting%252C%2520high%2520quality%252C%2520photorealistic&width=100&height=100&seq=1004&orientation=squarish"
                alt="User Profile"
                className="w-10 h-10 rounded-full object-cover mr-3"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  Best airbrush for beginners?
                </h4>
                <div className="flex items-center text-sm text-gray-500">
                  <span>
                    Started by <span className="text-primary">Emma Wilson</span>
                  </span>
                  <span className="mx-2">•</span>
                  <span>32 replies</span>
                  <span className="mx-2">•</span>
                  <span>2 hours ago</span>
                </div>
              </div>
              <i className="ri-arrow-right-s-line ri-lg text-gray-400"></i>
            </div>
            {/* Additional topics omitted */}
          </div>
        </div>
        <div className="text-center mt-6">
          <a href="#" className="text-primary font-medium hover:underline">
            View All Categories
          </a>
        </div>
      </div>
    </div>
  );
}

export default ForumsSection;
