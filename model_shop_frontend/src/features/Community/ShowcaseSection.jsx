function ShowcaseSection() {
  return (
    <div id="showcase" className="bg-white rounded-lg shadow-sm mb-6 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Build Showcase</h2>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 rounded-button whitespace-nowrap">
            <span>All Categories</span>
            <i className="ri-arrow-down-s-line"></i>
          </button>
          <button className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition rounded-button whitespace-nowrap">
            <i className="ri-add-line mr-1"></i>Share Build
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-lg overflow-hidden group">
          <div className="relative h-60">
            <img
              src="https://readdy.ai/api/search-image?query=detailed%2520photo%2520of%2520a%2520completed%2520gundam%2520model%2520kit%2520with%2520dynamic%2520pose%252C%2520perfect%2520paint%2520job%2520and%2520panel%2520lining%252C%2520professional%2520lighting%252C%2520high%2520quality%2520photography&width=400&height=400&seq=2004&orientation=squarish"
              alt="Gundam Model"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
              <div className="p-4 w-full">
                <h3 className="text-white font-medium">
                  Strike Freedom Gundam
                </h3>
                <div className="flex items-center justify-between text-white/80 text-sm">
                  <span>By James Wilson</span>
                  <div className="flex items-center gap-2">
                    <i className="ri-heart-fill"></i>
                    <span>156</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="https://readdy.ai/api/search-image?query=professional%2520portrait%2520photo%2520of%2520a%2520young%2520man%2520with%2520dark%2520hair%252C%2520casual%2520attire%252C%2520friendly%2520smile%252C%2520indoor%2520studio%2520lighting%252C%2520high%2520quality%252C%2520photorealistic&width=100&height=100&seq=1010&orientation=squarish"
                  alt="User Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-medium text-gray-900">James Wilson</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500">
                <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full">
                  <i className="ri-heart-line"></i>
                </button>
                <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full">
                  <i className="ri-chat-1-line"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Additional showcase items omitted */}
      </div>
      <div className="text-center mt-6">
        <button className="text-primary font-medium hover:underline">
          View More Builds
        </button>
      </div>
    </div>
  );
}

export default ShowcaseSection;
