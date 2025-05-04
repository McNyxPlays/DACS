import React, { useEffect } from "react";
import * as echarts from "echarts";

const SidebarRight = ({ userData }) => {
  useEffect(() => {
    const chartDom = document.getElementById("skills-chart");
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      const option = {
        animation: false,
        tooltip: {
          trigger: "item",
        },
        legend: {
          show: false,
        },
        series: [
          {
            name: "Skills",
            type: "pie",
            radius: ["40%", "70%"],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: "#fff",
              borderWidth: 2,
            },
            label: {
              show: false,
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 12,
                fontWeight: "bold",
              },
            },
            labelLine: {
              show: false,
            },
            data: [
              {
                value: 35,
                name: "Gunpla Building",
                itemStyle: { color: "#3B82F6" },
              },
              {
                value: 25,
                name: "Weathering",
                itemStyle: { color: "#10B981" },
              },
              { value: 20, name: "Airbrush", itemStyle: { color: "#F59E0B" } },
              {
                value: 15,
                name: "Panel Lining",
                itemStyle: { color: "#8B5CF6" },
              },
              {
                value: 5,
                name: "Diorama Creation",
                itemStyle: { color: "#EC4899" },
              },
            ],
          },
        ],
      };
      myChart.setOption(option);

      window.addEventListener("resize", () => {
        myChart.resize();
      });

      return () => {
        window.removeEventListener("resize", () => {
          myChart.resize();
        });
        myChart.dispose();
      };
    }
  }, []);

  return (
    <div className="w-full md:w-1/5 mt-6 md:mt-0 md:ml-6">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h2 className="font-medium mb-3">Profile Completion</h2>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${userData.profileCompletion}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          {userData.profileCompletion}% complete
        </p>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <i className="fas fa-check-circle text-green-500 mr-2"></i>
            <span className="text-gray-700">Profile picture uploaded</span>
          </div>
          <div className="flex items-center text-sm">
            <i className="fas fa-check-circle text-green-500 mr-2"></i>
            <span className="text-gray-700">Bio information added</span>
          </div>
          <div className="flex items-center text-sm">
            <i className="fas fa-check-circle text-green-500 mr-2"></i>
            <span className="text-gray-700">Skills added</span>
          </div>
          <div className="flex items-center text-sm">
            <i className="far fa-circle text-gray-400 mr-2"></i>
            <span className="text-gray-500">Connect more social accounts</span>
          </div>
          <div className="flex items-center text-sm">
            <i className="far fa-circle text-gray-400 mr-2"></i>
            <span className="text-gray-500">Verify email address</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h2 className="font-medium mb-4">Skills Breakdown</h2>
        <div id="skills-chart" className="w-full h-48"></div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h2 className="font-medium mb-3">Recent Achievements</h2>
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mr-3">
              <i className="fas fa-trophy text-blue-600"></i>
            </div>
            <div>
              <p className="text-sm font-medium">Featured Builder</p>
              <p className="text-xs text-gray-500">April 2025</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-full p-2 mr-3">
              <i className="fas fa-award text-green-600"></i>
            </div>
            <div>
              <p className="text-sm font-medium">100+ Followers</p>
              <p className="text-xs text-gray-500">March 2025</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-full p-2 mr-3">
              <i className="fas fa-medal text-purple-600"></i>
            </div>
            <div>
              <p className="text-sm font-medium">Contest Winner</p>
              <p className="text-xs text-gray-500">February 2025</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="font-medium mb-3">Connected Accounts</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <i className="fab fa-instagram text-pink-600 w-8 text-lg"></i>
              <span className="text-sm">Instagram</span>
            </div>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Connected
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <i className="fab fa-youtube text-red-600 w-8 text-lg"></i>
              <span className="text-sm">YouTube</span>
            </div>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Connected
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <i className="fab fa-twitter text-blue-400 w-8 text-lg"></i>
              <span className="text-sm">Twitter</span>
            </div>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Connected
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <i className="fab fa-facebook text-blue-600 w-8 text-lg"></i>
              <span className="text-sm">Facebook</span>
            </div>
            <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full !rounded-button whitespace-nowrap cursor-pointer">
              Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarRight;