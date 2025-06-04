import React from 'react';

const ProductItems = ({ product, isSelected, onSelect }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow relative">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onSelect}
        className="absolute top-2 right-2 h-5 w-5"
      />
      <div className="h-48 bg-gray-300 rounded mb-4"></div>
      <h2 className="text-lg font-semibold">{product.name}</h2>
      <p className="text-gray-600">Price: ${product.price.toFixed(2)}</p>
      <p className="text-gray-600">Quantity: {product.quantity}</p>
    </div>
  );
};

export default ProductItems;