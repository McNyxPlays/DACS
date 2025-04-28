import Hero from "./Hero/Hero";
import Categories from "./Categories";
import FeaturedProducts from "./FeaturedProducts";
import NewsCommunity from "./NewsCommunity";

function Home() {
  return (
    <div className="bg-gray-50">
      <Hero />
      <Categories />
      <FeaturedProducts />
      <NewsCommunity />
    </div>
  );
}

export default Home;
