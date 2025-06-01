import React from 'react';

const MyStore = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">MyStore</h1>
      </header>
      <main className="container mx-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill().map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow">
              <div className="h-48 bg-gray-300 rounded mb-4"></div>
              <h2 className="text-lg font-semibold">Product {i + 1}</h2>
              <p className="text-gray-600">$19.99</p>
              <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>&copy; 2025 MyStore. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MyStore;