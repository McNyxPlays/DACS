import { useState } from "react";
import FiltersSidebar from "./FiltersSidebar";
import MobileFilterSidebar from "./MobileFilterSidebar";
import ProductsGrid from "./ProductsGrid";
import RecentlyViewed from "../Home/RecentlyViewed";
import ShopBanner from "./ShopBanner";

function Shop() {
  const [viewMode, setViewMode] = useState("grid");

  return (
    <div className="bg-gray-50">
      <ShopBanner setViewMode={setViewMode} />
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            <FiltersSidebar />
            <div className="flex-1">
              <MobileFilterSidebar />
              <ProductsGrid viewMode={viewMode} />
            </div>
          </div>
        </div>
      </section>
      <RecentlyViewed />
    </div>
  );
}

export default Shop;
