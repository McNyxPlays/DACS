import "./Hero.css";

function Hero() {
  return (
    <section className="hero-section relative">
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/40"></div>
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Build Your Dream Models
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Discover premium model kits, rare collectibles, and everything you
            need to bring your imagination to life.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-primary text-white px-6 py-3 font-medium rounded-button whitespace-nowrap hover:bg-primary/90 transition">
              Shop Now
            </button>
            <button className="bg-white text-gray-900 px-6 py-3 font-medium border border-gray-300 rounded-button whitespace-nowrap hover:bg-gray-50 transition">
              Join Community
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
