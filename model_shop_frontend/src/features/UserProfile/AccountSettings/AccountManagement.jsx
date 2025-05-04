import React from "react";

const AccountManagement = ({ activeSection }) => {
  return (
    <>
      {activeSection === "account" && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Account Management
          </h2>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Account Status
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Your account is active and in good standing.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium text-gray-800 mb-3">
              Membership Level
            </h3>
            <div className="flex items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="mr-4">
                <div className="bg-blue-100 rounded-full p-3">
                  <i className="fas fa-crown text-blue-600"></i>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Premium Member</h4>
                <p className="text-sm text-gray-600">
                  Your membership renews on May 22, 2025
                </p>
              </div>
              <div className="ml-auto">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium !rounded-button whitespace-nowrap cursor-pointer">
                  Manage Subscription
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="font-medium text-gray-800 mb-4">
              Account Actions
            </h3>
            <div className="space-y-4">
              <div>
                <button
                  type="button"
                  className="bg-white border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 !rounded-button whitespace-nowrap cursor-pointer flex items-center"
                >
                  <i className="fas fa-user-slash mr-2"></i>
                  Deactivate Account
                </button>
                <p className="text-sm text-gray-500 mt-1">
                  Temporarily disable your account. You can reactivate it anytime.
                </p>
              </div>
              <div>
                <button
                  type="button"
                  className="bg-white border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 !rounded-button whitespace-nowrap cursor-pointer flex items-center"
                >
                  <i className="fas fa-trash-alt mr-2"></i>
                  Delete Account
                </button>
                <p className="text-sm text-gray-500 mt-1">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="font-medium text-gray-800 mb-4">
              Data & Privacy
            </h3>
            <div className="space-y-4">
              <div>
                <button
                  type="button"
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 !rounded-button whitespace-nowrap cursor-pointer flex items-center"
                >
                  <i className="fas fa-download mr-2"></i>
                  Download Your Data
                </button>
                <p className="text-sm text-gray-500 mt-1">
                  Get a copy of all your personal data that we store.
                </p>
              </div>
              <div>
                <button
                  type="button"
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 !rounded-button whitespace-nowrap cursor-pointer flex items-center"
                >
                  <i className="fas fa-file-alt mr-2"></i>
                  Privacy Policy
                </button>
                <p className="text-sm text-gray-500 mt-1">
                  Read our privacy policy to understand how we handle your data.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccountManagement;