function TutorialsEvents() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div id="tutorials" className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Latest Tutorials</h2>
          <a href="#" className="text-primary font-medium hover:underline">
            View All
          </a>
        </div>
        <div className="space-y-4">
          <div className="flex gap-4 pb-4 border-b border-gray-200">
            <img
              src="https://readdy.ai/api/search-image?query=close-up%2520photo%2520of%2520hands%2520painting%2520a%2520small%2520model%2520kit%2520figure%2520with%2520fine%2520detail%2520brush%252C%2520professional%2520lighting%252C%2520high%2520quality%2520photography&width=200&height=200&seq=2010&orientation=squarish"
              alt="Painting Tutorial"
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Mastering Fine Detail Painting
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                Learn techniques for painting small details with precision and
                steady hands.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <img
                    src="https://readdy.ai/api/search-image?query=professional%2520portrait%2520photo%2520of%2520an%2520older%2520man%2520with%2520white%2520hair%2520and%2520beard%252C%2520casual%2520attire%252C%2520friendly%2520smile%252C%2520indoor%2520studio%2520lighting%252C%2520high%2520quality%252C%2520photorealistic&width=100&height=100&seq=1008&orientation=squarish"
                    alt="User Profile"
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span>Thomas Wright</span>
                </div>
                <span className="mx-2">•</span>
                <span>April 9, 2025</span>
              </div>
            </div>
          </div>
          {/* Additional tutorials omitted */}
        </div>
      </div>
      <div id="events" className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
          <a href="#" className="text-primary font-medium hover:underline">
            View All
          </a>
        </div>
        <div className="space-y-4">
          <div className="flex gap-4 pb-4 border-b border-gray-200">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex flex-col items-center justify-center text-primary flex-shrink-0">
              <span className="text-xl font-bold">15</span>
              <span className="text-xs">APR</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Virtual Build Night: Gundam Edition
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                Join our monthly virtual build session focused on Gundam kits.
                Share tips and progress live!
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <i className="ri-time-line mr-1"></i>
                <span>8:00 PM - 10:00 PM EST</span>
                <span className="mx-2">•</span>
                <span className="text-primary">Online</span>
              </div>
            </div>
          </div>
          {/* Additional events omitted */}
        </div>
      </div>
    </div>
  );
}

export default TutorialsEvents;
