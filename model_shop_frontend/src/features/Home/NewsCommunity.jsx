function NewsCommunity() {
  const posts = [
    {
      type: "News",
      date: "April 10, 2025",
      title: "Tokyo Model Kit Expo 2025 Announces Exclusive Releases",
      description:
        "Get ready for the biggest model kit event of the year with exclusive limited edition releases from top manufacturers.",
      image:
        "https://readdy.ai/api/search-image?query=professional%20photo%20of%20a%20model%20kit%20exhibition%20or%20convention%20with%20displays%20of%20Gundam%20models%20and%20anime%20figures%2C%20people%20browsing%20displays%2C%20high%20quality%2C%20detailed%2C%20event%20photography&width=600&height=400&seq=2001&orientation=landscape",
      author: "Takashi Yamamoto",
      authorImage:
        "https://readdy.ai/api/search-image?query=professional%20headshot%20portrait%20of%20a%20young%20Asian%20male%20with%20glasses%2C%20neutral%20expression%2C%20studio%20lighting%2C%20simple%20background&width=100&height=100&seq=3001&orientation=squarish",
      views: "2.4k",
      comments: "38",
      tagColor: "bg-blue-100 text-primary",
    },
    {
      type: "Tutorial",
      date: "April 8, 2025",
      title: "Advanced Weathering Techniques for Realistic Models",
      description:
        "Learn professional weathering methods to add realistic battle damage and aging effects to your model kits.",
      image:
        "https://readdy.ai/api/search-image?query=professional%20photo%20of%20a%20person%20customizing%20or%20painting%20a%20Gundam%20model%20kit%2C%20close-up%20of%20hands%20working%20with%20detail%20brushes%20and%20tools%2C%20high%20quality%2C%20detailed%2C%20hobby%20photography&width=600&height=400&seq=2002&orientation=landscape",
      author: "Emma Richardson",
      authorImage:
        "https://readdy.ai/api/search-image?query=professional%20headshot%20portrait%20of%20a%20young%20Caucasian%20female%20with%20short%20hair%2C%20neutral%20expression%2C%20studio%20lighting%2C%20simple%20background&width=100&height=100&seq=3002&orientation=squarish",
      views: "1.8k",
      comments: "52",
      tagColor: "bg-green-100 text-green-700",
    },
    {
      type: "Community",
      date: "April 5, 2025",
      title: 'Showcase: "Midnight Blaze" Custom Gundam by GundamMaster',
      description:
        "Check out this incredible custom build featuring LED modifications and a unique metallic paint scheme.",
      image:
        "https://readdy.ai/api/search-image?query=professional%20photo%20of%20a%20completed%20custom%20Gundam%20model%20with%20unique%20paint%20job%20and%20modifications%2C%20dramatic%20lighting%2C%20detailed%20close-up%2C%20high%20quality%20photography%20on%20simple%20background&width=600&height=400&seq=2003&orientation=landscape",
      author: "Daniel Chen",
      authorImage:
        "https://readdy.ai/api/search-image?query=professional%20headshot%20portrait%20of%20a%20young%20male%20with%20dark%20hair%2C%20neutral%20expression%2C%20studio%20lighting%2C%20simple%20background&width=100&height=100&seq=3003&orientation=squarish",
      views: "3.2k",
      comments: "76",
      tagColor: "bg-purple-100 text-purple-700",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Latest News & Community
          </h2>
          <a
            href="#"
            className="text-primary font-medium flex items-center gap-1 hover:underline"
          >
            View all posts
            <i className="ri-arrow-right-line"></i>
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <div
              key={post.title}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover object-top transition duration-300 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${post.tagColor}`}
                  >
                    {post.type}
                  </span>
                  <span>{post.date}</span>
                </div>
                <h3 className="font-semibold text-xl text-gray-900 mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4">{post.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={post.authorImage}
                      alt={post.author}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm text-gray-700">{post.author}</span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-500">
                    <div className="flex items-center gap-1">
                      <i className="ri-eye-line"></i>
                      <span className="text-sm">{post.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <i className="ri-message-2-line"></i>
                      <span className="text-sm">{post.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default NewsCommunity;
