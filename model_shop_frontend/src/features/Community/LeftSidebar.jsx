function LeftSidebar() {
  return (
    <div className="w-full lg:w-64 space-y-6">
      {/* Community Menu */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-gray-900 mb-4 px-2">Community</h3>
        <ul className="space-y-1">
          <li>
            <a
              href="#"
              className="flex items-center gap-3 px-2 py-2 rounded-lg bg-primary/10 text-primary font-medium"
            >
              <i className="ri-home-4-line"></i>
              <span>Home</span>
            </a>
          </li>
          <li>
            <a
              href="#forums"
              className="flex items-center gap-3 px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              <i className="ri-discuss-line"></i>
              <span>Forums</span>
            </a>
          </li>
          {/* Other menu items omitted for brevity */}
        </ul>
      </div>
      {/* Popular Tags */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-gray-900 mb-4 px-2">Popular Tags</h3>
        <div className="flex flex-wrap gap-2 px-2">
          <a
            href="#"
            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition"
          >
            #Gundam
          </a>
          <a
            href="#"
            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition"
          >
            #Weathering
          </a>
          {/* Other tags omitted */}
        </div>
      </div>
      {/* Community Guidelines */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary rounded-full">
            <i className="ri-file-list-3-line ri-lg"></i>
          </div>
          <h3 className="font-semibold text-gray-900">Community Guidelines</h3>
        </div>
        <p className="text-gray-600 text-sm px-2 mb-3">
          Please follow our community rules to ensure a positive experience for
          everyone.
        </p>
        <a
          href="#"
          className="text-primary text-sm font-medium hover:underline px-2"
        >
          Read Guidelines
        </a>
      </div>
    </div>
  );
}

export default LeftSidebar;
