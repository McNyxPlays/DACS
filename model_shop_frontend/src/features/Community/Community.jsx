import { useOutletContext } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";
import FeaturedContent from "./FeaturedContent";
import ForumsSection from "./ForumsSection";
import ShowcaseSection from "./ShowcaseSection";
import TutorialsEvents from "./TutorialsEvents";
import RightSidebar from "./RightSidebar";
import api from "../../api/index";

function Community() {
  const { user } = useOutletContext(); // Access user from Outlet context

  return (
    <div className="bg-gray-50 font-inter">
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            <LeftSidebar />
            <div className="flex-1">
              <FeaturedContent user={user} />
              <ForumsSection />
              <ShowcaseSection />
              <TutorialsEvents />
            </div>
            {user && <RightSidebar user={user} />}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Community;