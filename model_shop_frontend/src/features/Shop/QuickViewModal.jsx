import { useState } from "react";

function QuickViewModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const toggleModal = () => {
    setIsOpen(!isOpen);
    document.body.style.overflow = isOpen ? "auto" : "hidden";
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  return (
    <>
      <button
        className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium transform -translate-y-2 group-hover:translate-y-0 transition-transform rounded-button"
        onClick={toggleModal}
      >
        Quick View
      </button>
      <div
        id="quickViewModal"
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ${
          isOpen ? "" : "hidden"
        }`}
        onClick={toggleModal}
      >
        <div
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                RX-78-2 Gundam Ver. 3.0
              </h2>
              <button
                id="closeQuickViewModal"
                className="text-gray-500 hover:text-gray-700"
                onClick={toggleModal}
              >
                <i className="ri-close-line ri-lg"></i>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="rounded-lg overflow-hidden mb-4">
                  <img
                    src="https://readdy.ai/api/search-image?query=professional%2520product%2520photo%2520of%2520a%2520Gundam%2520model%2520kit%2520box%2520and%2520assembled%2520robot%2520figure%252C%2520high%2520quality%252C%2520detailed%252C%2520studio%2520lighting%252C%2520white%2520background%252C%2520commercial%2520product%2520photography%2520style&width=500&height=500&seq=1001&orientation=squarish"
                    alt="Gundam Model Kit"
                    className="w-full h-auto"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    "https://readdy.ai/api/search-image?query=professional%2520product%2520photo%2520of%2520a%2520Gundam%2520model%2520kit%2520box%2520and%2520assembled%2520robot%2520figure%252C%2520high%2520quality%2520studio%2520lighting%252C%2520white%2520background%252C%2520commercial%2520product%2520photography%2520style&width=100&height=100&seq=3001&orientation=squarish",
                    "https://readdy.ai/api/search-image?query=professional%2520product%2520photo%2520of%2520a%2520Gundam%2520model%2520kit%2520close-up%2520of%2520head%2520and%2520face%252C%2520high%2520quality%2520studio%2520lighting%2520white%2520background%252C%2520commercial%2520product%2520photography%2520style&width=100&height=100&seq=3002&orientation=squarish",
                    "https://readdy.ai/api/search-image?query=professional%2520product%2520photo%2520of%2520a%2520Gundam%2520model%2520kit%2520with%2520weapons%2520and%2520accessories%252C%2520high%2520quality%2520studio%2520lighting%2520white%2520background%252C%2520commercial%2520product%2520photography%2520style&width=100&height=100&seq=3003&orientation=squarish",
                    "https://readdy.ai/api/search-image?query=professional%2520product%2520photo%2520of%2520a%2520Gundam%2520model%2520kit%2520box%2520packaging%252C%2520high%2520quality%2520studio%2520lighting%2520white%2520background%252C%2520commercial%2520product%2520photography%2520style&width=100&height=100&seq=3004&orientation=squarish",
                  ].map((src, index) => (
                    <div
                      key={index}
                      className={`rounded-lg overflow-hidden border-2 ${
                        index === 0 ? "border-primary" : "border-gray-200"
                      }`}
                    >
                      <img
                        src={src}
                        alt="Gundam Model Kit"
                        className="w-full h-auto"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-2">
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-half-fill"></i>
                  <span className="text-gray-600 text-sm ml-1">
                    (42 reviews)
                  </span>
                </div>
                <div className="mb-4">
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    In Stock
                  </span>
                  <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded-full ml-2">
                    New Arrival
                  </span>
                </div>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    $54.99
                  </span>
                </div>
                <p className="text-gray-700 mb-6">
                  The RX-78-2 Gundam Ver. 3.0 is a Master Grade 1/100 scale
                  model kit from the Mobile Suit Gundam series. This version
                  features improved articulation, detail, and color separation
                  compared to previous releases.
                </p>
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Features:
                  </h3>
                  <ul className="list-disc pl-5 text-gray-700 space-y-1">
                    <li>Master Grade 1/100 scale</li>
                    <li>Improved joint system for better posability</li>
                    <li>Detailed inner frame with moving pistons</li>
                    <li>Includes beam rifle, shield, and beam sabers</li>
                    <li>Multiple hand options for different poses</li>
                  </ul>
                </div>
                <div className="mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <button
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 text-gray-500 rounded-l-lg"
                        onClick={() => handleQuantityChange(-1)}
                      >
                        <i className="ri-subtract-line"></i>
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        min="1"
                        className="w-12 h-8 border-y border-gray-300 text-center text-gray-700 focus:outline-none"
                        onChange={(e) =>
                          setQuantity(
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                      />
                      <button
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 text-gray-500 rounded-r-lg"
                        onClick={() => handleQuantityChange(1)}
                      >
                        <i className="ri-add-line"></i>
                      </button>
                    </div>
                    <button className="flex-1 bg-primary text-white py-2 font-medium rounded-button hover:bg-primary/90 transition flex items-center justify-center gap-2">
                      <i className="ri-shopping-cart-line"></i>
                      Add to Cart
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 text-gray-700 hover:text-primary transition">
                    <i className="ri-heart-line"></i>
                    Add to Wishlist
                  </button>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <button className="flex items-center gap-2 text-gray-700 hover:text-primary transition">
                    <i className="ri-share-line"></i>
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default QuickViewModal;
