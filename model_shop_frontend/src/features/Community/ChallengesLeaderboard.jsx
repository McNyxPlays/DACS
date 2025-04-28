function ChallengesLeaderboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div id="challenges" className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Active Challenges</h2>
          <a href="#" className="text-primary font-medium hover:underline">
            View All
          </a>
        </div>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="relative h-40">
              <img
                src="https://readdy.ai/api/search-image?query=detailed%2520photo%2520of%2520a%2520post-apocalyptic%2520diorama%2520scene%2520with%2520abandoned%2520buildings%2520and%2520vehicles%252C%2520professional%2520lighting%252C%2520high%2520quality%2520photography&width=600&height=300&seq=2013&orientation=landscape"
                alt="Apocalypse Challenge"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-4 w-full">
                  <div className="flex justify-between items-center">
                    <h3 className="text-white font-medium">
                      Post-Apocalyptic Diorama Challenge
                    </h3>
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm text-gray-500">
                  <i className="ri-calendar-line mr-1"></i>
                  <span>Ends in 12 days</span>
                </div>
                <div className="text-sm text-gray-500">
                  <i className="ri-user-line mr-1"></i>
                  <span>78 participants</span>
                </div>
              </div>
              <div className="flex justify-between">
                <button className="text-primary font-medium hover:underline text-sm">
                  View Details
                </button>
                <button className="bg-primary text-white px-3 py-1 rounded-lg text-sm hover:bg-primary/90 transition rounded-button whitespace-nowrap">
                  Join Challenge
                </button>
              </div>
            </div>
          </div>
          {/* Additional challenges omitted */}
        </div>
      </div>
      <div id="leaderboard" className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Top Builders</h2>
          <button className="flex items-center gap-2 text-sm text-gray-700">
            <span>This Month</span>
            <i className="ri-arrow-down-s-line"></i>
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold mr-3">
              1
            </div>
            <img
              src="https://readdy.ai/api/search-image?query=professional%2520portrait%2520photo%2520of%2520an%2520asian%2520woman%2520with%2520long%2520black%2520hair%252C%2520smiling%252C%2520casual%2520attire%252C%2520indoor%2520studio%2520lighting%252C%2520high%2520quality%252C%2520photorealistic&width=100&height=100&seq=1002&orientation=squarish"
              alt="User Profile"
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Akiko Tanaka</div>
              <div className="text-xs text-gray-500">
                Master Builder • 15 completed builds
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900">3,245</div>
              <div className="text-xs text-gray-500">points</div>
            </div>
          </div>
          {/* Additional builders omitted */}
        </div>
        <div className="text-center mt-4">
          <a href="#" className="text-primary font-medium hover:underline">
            View Full Leaderboard
          </a>
        </div>
      </div>
    </div>
  );
}

export default ChallengesLeaderboard;
