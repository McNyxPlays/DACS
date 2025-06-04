import React, { useState } from 'react';
import LeftSidebar from './leftsidebar.jsx';
import ProductItems from './productitems.jsx';

const MyStore = () => {
  const [products, setProducts] = useState([
    { id: 1, name: 'Product 1', price: 19.99, quantity: 10 },
    { id: 2, name: 'Product 2', price: 29.99, quantity: 5 },
    { id: 3, name: 'Product 3', price: 39.99, quantity: 8 },
    { id: 4, name: 'Product 4', price: 49.99, quantity: 3 },
    { id: 5, name: 'Product 5', price: 59.99, quantity: 12 },
    { id: 6, name: 'Product 6', price: 69.99, quantity: 7 },
  ]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const handleAddProduct = () => {
    const newProduct = {
      id: products.length + 1,
      name: `Product ${products.length + 1}`,
      price: 19.99,
      quantity: 1,
    };
    setProducts([...products, newProduct]);
  };

  const handleEditProduct = (id) => {
    const updatedProducts = products.map((product) =>
      product.id === id
        ? { ...product, name: `${product.name} (Edited)`, price: product.price + 5 }
        : product
    );
    setProducts(updatedProducts);
  };

  const handleDeleteSelected = () => {
    setProducts(products.filter((product) => !selectedProducts.includes(product.id)));
    setSelectedProducts([]);
  };

  const handleDeleteAll = () => {
    setProducts([]);
    setSelectedProducts([]);
  };

  const handleSelectProduct = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <LeftSidebar
        onAddProduct={handleAddProduct}
        onEditProduct={() => products.forEach((p) => handleEditProduct(p.id))}
        onDeleteSelected={handleDeleteSelected}
        onDeleteAll={handleDeleteAll}
      />
      <div className="flex-1">
        <header className="bg-blue-600 text-white p-4 flex items-center">
          <img
            src="https://via.placeholder.com/100"
            alt="Profile"
            className="w-16 h-16 rounded-full mr-4"
          />
          <div>
            <h1 className="text-2xl font-bold">User Profile</h1>
            <p className="text-lg">Total Products: {products.length}</p>
          </div>
        </header>
        <main className="container mx-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductItems
                key={product.id}
                product={product}
                isSelected={selectedProducts.includes(product.id)}
                onSelect={() => handleSelectProduct(product.id)}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyStore;