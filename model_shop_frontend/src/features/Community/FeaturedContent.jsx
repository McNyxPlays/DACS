import styles from "../../styles/CommunityHub.module.css";

function FeaturedContent() {
  return (
    <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
      <div className="flex border-b border-gray-200">
        <button className="flex-1 py-4 px-6 text-primary font-medium border-b-2 border-primary">
          Featured
        </button>
        <button className="flex-1 py-4 px-6 text-gray-600 hover:text-gray-900 transition">
          Latest
        </button>
        <button className="flex-1 py-4 px-6 text-gray-600 hover:text-gray-900 transition">
          Popular
        </button>
        <button className="flex-1 py-4 px-6 text-gray-600 hover:text-gray-900 transition">
          Following
        </button>
      </div>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img
            src="https://readdy.ai/api/search-image?query=professional%2520portrait%2520photo%2520of%2520a%2520young%2520man%2520with%2520short%2520brown%2520hair%2520and%2520casual%2520attire%252C%2520neutral%2520expression%252C%2520looking%2520at%2520camera%252C%2520indoor%2520studio%2520lighting%252C%2520high%2520quality%252C%2520photorealistic&width=100&height=100&seq=1001&orientation=squarish"
            alt="User Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-gray-500 cursor-pointer hover:bg-gray-200 transition">
            What would you like to share today?
          </div>
          <button className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full">
            <i className="ri-image-add-line ri-lg"></i>
          </button>
        </div>
      </div>
      <div className="p-4">
        <div
          className={`border border-gray-200 rounded-lg p-4 mb-4 ${styles.postCard}`}
        >
          <div className="flex justify-between mb-3">
            <div className="flex items-center gap-3">
              <img
                src="https://readdy.ai/api/search-image?query=professional%2520portrait%2520photo%2520of%2520an%2520asian%2520woman%2520with%2520long%2520black%2520hair%252C%2520smiling%252C%2520casual%2520attire%252C%2520indoor%2520studio%2520lighting%252C%2520high%2520quality%252C%2520photorealistic&width=100&height=100&seq=1002&orientation=squarish"
                alt="User Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-medium text-gray-900">Akiko Tanaka</div>
                <div className="text-gray-500 text-sm">
                  April 10, 2025 · <i className="ri-earth-line"></i> Public
                </div>
              </div>
            </div>
            <div className={styles.postActions}>
              <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full">
                <i className="ri-more-2-fill"></i>
              </button>
            </div>
          </div>
          <p className="text-gray-800 mb-3">
            Just finished my first PG Unleashed RX-78-2 Gundam! The inner frame
            detail is incredible. Took me about 3 weeks of evening work. What do
            you think?
          </p>
          <div className="grid grid-cols-2 gap-2">
            <img
              src="https://readdy.ai/api/search-image?query=detailed%2520photo%2520of%2520a%2520completed%2520gundam%2520model%2520kit%2520RX-78-2%2520with%2520incredible%2520detail%252C%2520perfect%2520panel%2520lining%252C%2520on%2520display%2520stand%252C%2520professional%2520lighting%252C%2520high%2520quality%2520photography&width=400&height=300&seq=2001&orientation=landscape"
              alt="Gundam Model"
              className="w-full h-48 object-cover rounded-lg"
            />
            <img
              src="https://readdy.ai/api/search-image?query=close-up%2520detailed%2520photo%2520of%2520gundam%2520model%2520kit%2520inner%2520frame%2520mechanics%252C%2520showing%2520intricate%2520details%2520and%2520perfect%2520paint%2520job%252C%2520professional%2520lighting%252C%2520high%2520quality%2520photography&width=400&height=300&seq=2002&orientation=landscape"
              alt="Gundam Inner Frame"
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
          <div className="flex items-center justify-between text-sm mt-3">
            <div className="flex items-center gap-1 text-gray-500">
              <div className="flex -space-x-1">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                  <i className="ri-thumb-up-fill"></i>
                </div>
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                  <i className="ri-heart-fill"></i>
                </div>
              </div>
              <span>128</span>
            </div>
            <div className="flex items-center gap-4 text-gray-500">
              <span>42 comments</span>
              <span>12 shares</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
            <button className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <i className="ri-thumb-up-line"></i>
              <span>Like</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <i className="ri-chat-1-line"></i>
              <span>Comment</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <i className="ri-share-forward-line"></i>
              <span>Share</span>
            </button>
          </div>
        </div>
        <div className="text-center">
          <button className="text-primary font-medium hover:underline">
            View More Posts
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeaturedContent;
