import React from 'react';

const LeftSidebar = ({ onAddProduct, onEditProduct, onDeleteSelected, onDeleteAll }) => {
  return (
    <div className="w-64 bg-gray-200 p-4 h-screen">
      <h2 className="text-xl font-bold mb-4">Manage Products</h2>
      <button
        onClick={onAddProduct}
        className="w-full bg-blue-500 text-white p-2 mb-2 rounded hover:bg-blue-600"
      >
        Add Product
      </button>
      <button
        onClick={onEditProduct}
        className="w-full bg-yellow-500 text-white p-2 mb-2 rounded hover:bg-yellow-600"
      >
        Edit Products
      </button>
      <button
        onClick={() => alert('Filter functionality not implemented')}
        className="w-full bg-green-500 text-white p-2 mb-2 rounded hover:bg-green-600"
      >
        Filter Products
      </button>
      <button
        onClick={onDeleteSelected}
        className="w-full bg-red-500 text-white p-2 mb-2 rounded hover:bg-red-600"
      >
        Delete Selected
      </button>
      <button
        onClick={onDeleteAll}
        className="w-full bg-red-700 text-white p-2 rounded hover:bg-red-800"
      >
        Delete All
      </button>
    </div>
  );
};

export default LeftSidebar;