function Categories() {
  const categories = [
    { name: "Gundam Kits", icon: "ri-robot-line" },
    { name: "DIY Models", icon: "ri-tools-line" },
    { name: "Game Figures", icon: "ri-gamepad-line" },
    { name: "Anime Figures", icon: "ri-film-line" },
    { name: "Tools & Paints", icon: "ri-brush-line" },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Explore Categories
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find exactly what you're looking for from our extensive collection
            of model kits and accessories
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {categories.map((category) => (
            <a href="#" key={category.name} className="group">
              <div className="bg-gray-100 rounded-lg p-6 flex flex-col items-center transition duration-300 group-hover:shadow-md group-hover:bg-gray-50">
                <div className="w-16 h-16 flex items-center justify-center mb-4 text-primary">
                  <i className={`${category.icon} ri-2x`}></i>
                </div>
                <h3 className="font-medium text-gray-900 text-center">
                  {category.name}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;
