function RecentlyViewed() {
  const products = [
    {
      id: 1,
      name: "RX-78-2 Gundam Ver. 3.0",
      price: 54.99,
      rating: 4.5,
      image:
        "https://readdy.ai/api/search-image?query=professional%2520product%2520photo%2520of%2520a%2520Gundam%2520model%2520kit%2520box%2520and%2520assembled%2520robot%2520figure%252C%2520high%2520quality%2520studio%2520lighting%2520white%2520background%252C%2520commercial%2520product%2520photography%2520style&width=300&height=300&seq=2001&orientation=squarish",
    },
    {
      id: 2,
      name: "Asuka Langley Premium Figure",
      price: 129.99,
      rating: 5.0,
      image:
        "https://readdy.ai/api/search-image?query=professional%2520product%2520photo%2520of%2520an%2520anime%2520figure%252C%2520female%2520character%252C%2520high%2520quality%2520studio%2520lighting%2520white%2520background%252C%2520commercial%2520product%2520photography%2520style&width=300&height=300&seq=2002&orientation=squarish",
    },
    {
      id: 3,
      name: "Professional Painting Kit",
      price: 42.5,
      rating: 4.0,
      image:
        "https://readdy.ai/api/search-image?query=professional%2520product%2520photo%2520of%2520model%2520painting%2520tools%2520set%2520with%2520brushes%2520paints%2520and%2520accessories%252C%2520high%2520quality%2520studio%2520lighting%2520white%2520background%252C%2520commercial%2520product%2520photography%2520style&width=300&height=300&seq=2003&orientation=squarish",
    },
    {
      id: 4,
      name: "Cloud Strife Deluxe Model",
      price: 89.99,
      rating: 3.5,
      image:
        "https://readdy.ai/api/search-image?query=professional%2520product%2520photo%2520of%2520a%2520video%2520game%2520character%2520model%2520kit%252C%2520detailed%2520fantasy%2520warrior%2520figure%252C%2520high%2520quality%2520studio%2520lighting%2520white%2520background%252C%2520commercial%2520product%2520photography%2520style&width=300&height=300&seq=2004&orientation=squarish",
    },
    {
      id: 5,
      name: "Zaku II MS-06S Char Custom",
      price: 45.99,
      rating: 4.0,
      image:
        "https://readdy.ai/api/search-image?query=professional%2520product%2520photo%2520of%2520a%2520robot%2520model%2520kit%2520with%2520mechanical%2520details%252C%2520high%2520quality%2520studio%2520lighting%2520white%2520background%252C%2520commercial%2520product%2520photography%2520style&width=300&height=300&seq=2005&orientation=squarish",
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Recently Viewed
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition group border border-gray-100"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-3">
                <h3 className="font-medium text-gray-900 text-sm">
                  {product.name}
                </h3>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-bold text-gray-900 text-sm">
                    ${product.price.toFixed(2)}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    <i className="ri-star-fill"></i>
                    <span>{product.rating}</span>
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

export default RecentlyViewed;
