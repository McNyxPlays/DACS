import LeftSidebar from "./LeftSidebar";
import FeaturedContent from "./FeaturedContent";
import ForumsSection from "./ForumsSection";
import ShowcaseSection from "./ShowcaseSection";
import TutorialsEvents from "./TutorialsEvents";
import RightSidebar from "./RightSidebar";

function Community() {
  return (
    <div className="bg-gray-50 font-inter">
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            <LeftSidebar />
            <div className="flex-1">
              <FeaturedContent />
              <ForumsSection />
              <ShowcaseSection />
              <TutorialsEvents />
            </div>
            <RightSidebar />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Community;
