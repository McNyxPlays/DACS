function FeaturedProducts() {
  const products = [
    {
      image:
        "https://readdy.ai/api/search-image?query=professional%20product%20photo%20of%20a%20Gundam%20model%20kit%20box%20and%20assembled%20robot%20figure%2C%20high%20quality%2C%20detailed%2C%20studio%20lighting%2C%20white%20background%2C%20commercial%20product%20photography%20style&width=500&height=500&seq=1001&orientation=squarish",
      label: "New Arrival",
      labelColor: "bg-primary",
      name: "RX-78-2 Gundam Ver. 3.0",
      description: "Master Grade 1/100 Scale",
      rating: 4.5,
      reviews: 42,
      price: 54.99,
    },
    {
      image:
        "https://readdy.ai/api/search-image?query=professional%20product%20photo%20of%20an%20anime%20figure%2C%20female%20character%2C%20high%20quality%2C%20detailed%2C%20studio%20lighting%2C%20white%20background%2C%20commercial%20product%20photography%20style&width=500&height=500&seq=1002&orientation=squarish",
      label: "Limited Edition",
      labelColor: "bg-secondary",
      name: "Asuka Langley Premium Figure",
      description: "Evangelion Collection",
      rating: 5,
      reviews: 87,
      price: 129.99,
    },
    {
      image:
        "https://readdy.ai/api/search-image?query=professional%20product%20photo%20of%20model%20painting%20tools%20set%20with%20brushes%2C%20paints%20and%20accessories%2C%20high%20quality%2C%20detailed%2C%20studio%20lighting%2C%20white%20background%2C%20commercial%20product%20photography%20style&width=500&height=500&seq=1003&orientation=squarish",
      label: null,
      name: "Professional Painting Kit",
      description: "15 Colors + 6 Brushes",
      rating: 4,
      reviews: 36,
      price: 42.5,
    },
    {
      image:
        "https://readdy.ai/api/search-image?query=professional%20product%20photo%20of%20a%20video%20game%20character%20model%20kit%2C%20detailed%20fantasy%20warrior%20figure%2C%20high%20quality%2C%20studio%20lighting%2C%20white%20background%2C%20commercial%20product%20photography%20style&width=500&height=500&seq=1004&orientation=squarish",
      label: null,
      name: "Cloud Strife Deluxe Model",
      description: "Final Fantasy VII Remake",
      rating: 3.5,
      reviews: 23,
      price: 89.99,
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Featured Products
          </h2>
          <a
            href="#"
            className="text-primary font-medium flex items-center gap-1 hover:underline"
          >
            View all
            <i className="ri-arrow-right-line"></i>
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.name}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <div className="relative h-64">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-top"
                />
                {product.label && (
                  <span
                    className={`absolute top-3 left-3 ${product.labelColor} text-white text-xs font-medium px-2 py-1 rounded`}
                  >
                    {product.label}
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1 text-amber-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`ri-star-${
                        i < Math.floor(product.rating)
                          ? "fill"
                          : i < product.rating
                          ? "half-fill"
                          : "line"
                      }`}
                    ></i>
                  ))}
                  <span className="text-gray-600 text-sm ml-1">
                    ({product.reviews})
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  {product.name}
                </h3>
                <p className="text-gray-500 text-sm mb-3">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                  <button className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full hover:bg-primary hover:text-white transition">
                    <i className="ri-shopping-cart-line"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
