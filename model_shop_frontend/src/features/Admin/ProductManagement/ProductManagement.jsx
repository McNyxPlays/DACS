import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../../api/index";
import { Toastify } from "../../../components/Toastify";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState(0);
  const [filterBrand, setFilterBrand] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    product_id: 0,
    name: "",
    category_id: 0,
    brand_id: 0,
    price: "",
    discount: 0,
    stock_quantity: 0,
    description: "",
    status: "new",
    primary_image_index: -1,
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, [search, filterCategory, filterBrand, filterStatus]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams({
        search,
        category_id: filterCategory,
        brand_id: filterBrand,
        status: filterStatus,
      }).toString();
      const response = await api.get(`/productsmana.php?${params}`);
      if (response.data.success) {
        setProducts(response.data.data || []);
      } else {
        setError(response.data.error || "Failed to fetch products");
      }
    } catch (err) {
      setError("Failed to fetch products: " + (err.message || "Unknown error"));
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categoriesmana.php");
      if (response.data.status === "success") {
        setCategories(response.data.data || []);
      } else {
        setError("Failed to fetch categories");
      }
    } catch (err) {
      setError("Failed to fetch categories: " + (err.message || "Unknown error"));
      console.error(err);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await api.get("/brandsmana.php");
      if (response.data.status === "success") {
        setBrands(response.data.data || []);
      } else {
        setError("Failed to fetch brands");
      }
    } catch (err) {
      setError("Failed to fetch brands: " + (err.message || "Unknown error"));
      console.error(err);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "category_id") setFilterCategory(parseInt(value));
    if (name === "brand_id") setFilterBrand(parseInt(value));
    if (name === "status") setFilterStatus(value);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === "stock_quantity" || name === "discount" || name === "primary_image_index" ? parseFloat(value) : value 
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB
    let errorMsg = "";

    for (const file of files) {
      if (!validImageTypes.includes(file.type)) {
        errorMsg = "Only JPEG, PNG, and GIF images are allowed";
        break;
      }
      if (file.size > maxSize) {
        errorMsg = "Each image must be under 5MB";
        break;
      }
    }

    if (errorMsg) {
      setError(errorMsg);
      setImages([]);
    } else {
      setError("");
      setImages(files);
      setFormData((prev) => ({ ...prev, primary_image_index: files.length > 0 ? 0 : -1 }));
    }
  };

  const handlePrimaryImageSelect = (index) => {
    setFormData((prev) => ({ ...prev, primary_image_index: index }));
  };

  const handleRemoveExistingImage = async (imageId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      const response = await api.delete(`/product_images.php?id=${imageId}`);
      if (response.data.success) {
        setExistingImages((prev) => prev.filter((img) => img.image_id !== imageId));
        Toastify.success("Image deleted successfully");
      } else {
        setError(response.data.error || "Failed to delete image");
      }
    } catch (err) {
      setError("Failed to delete image: " + (err.message || "Unknown error"));
      console.error(err);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (formData.discount < 0 || formData.discount > 100) {
      setError("Discount must be between 0 and 100");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("category_id", formData.category_id);
    data.append("brand_id", formData.brand_id);
    data.append("price", formData.price);
    data.append("discount", formData.discount);
    data.append("stock_quantity", formData.stock_quantity);
    data.append("description", formData.description);
    data.append("status", formData.status);
    data.append("primary_image_index", formData.primary_image_index);
    for (let i = 0; i < images.length; i++) {
      data.append("images[]", images[i]);
    }

    try {
      const response = await api.post("/productsmana.php", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        Toastify.success("Product added successfully");
        setIsAddModalOpen(false);
        resetForm();
        fetchProducts();
      } else {
        setError(response.data.error || "Failed to add product");
      }
    } catch (err) {
      setError("Failed to add product: " + (err.message || "Unknown error"));
      console.error(err);
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (formData.discount < 0 || formData.discount > 100) {
      setError("Discount must be between 0 and 100");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("category_id", formData.category_id);
    data.append("brand_id", formData.brand_id);
    data.append("price", formData.price);
    data.append("discount", formData.discount);
    data.append("stock_quantity", formData.stock_quantity);
    data.append("description", formData.description);
    data.append("status", formData.status);
    data.append("primary_image_index", formData.primary_image_index);
    data.append("_method", "PUT");
    for (let i = 0; i < images.length; i++) {
      data.append("images[]", images[i]);
    }

    try {
      const response = await api.post(`/productsmana.php?id=${formData.product_id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        Toastify.success("Product updated successfully");
        setIsEditModalOpen(false);
        resetForm();
        fetchProducts();
      } else {
        setError(response.data.error || "Failed to update product");
      }
    } catch (err) {
      setError("Failed to update product: " + (err.message || "Unknown error"));
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const response = await api.delete(`/productsmana.php?id=${id}`);
      if (response.data.success) {
        Toastify.success("Product deleted successfully");
        fetchProducts();
      } else {
        setError(response.data.error || "Failed to delete product");
      }
    } catch (err) {
      setError("Failed to delete product: " + (err.message || "Unknown error"));
      console.error(err);
    }
  };

  const openEditModal = async (product) => {
    try {
      const response = await api.get(`/productsmana.php?id=${product.product_id}`);
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const prod = response.data.data[0];
        setFormData({
          product_id: prod.product_id,
          name: prod.name || "",
          category_id: prod.category_id || 0,
          brand_id: prod.brand_id || 0,
          price: prod.price || "",
          discount: prod.discount || 0,
          stock_quantity: prod.stock_quantity || 0,
          description: prod.description || "",
          status: prod.status || "new",
          primary_image_index: -1,
        });
        setExistingImages(prod.images || []);
        setImages([]);
        setError("");
        setIsEditModalOpen(true);
      } else {
        setError("Product not found");
      }
    } catch (err) {
      setError("Failed to fetch product: " + (err.message || "Unknown error"));
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: 0,
      name: "",
      category_id: 0,
      brand_id: 0,
      price: "",
      discount: 0,
      stock_quantity: 0,
      description: "",
      status: "new",
      primary_image_index: -1,
    });
    setImages([]);
    setExistingImages([]);
    setError("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Product Management</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={handleSearchChange}
          className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          name="category_id"
          value={filterCategory}
          onChange={handleFilterChange}
          className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value={0}>All Categories</option>
          {categories.map((category) => (
            <option key={category.category_id} value={category.category_id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          name="brand_id"
          value={filterBrand}
          onChange={handleFilterChange}
          className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value={0}>All Brands</option>
          {brands.map((brand) => (
            <option key={brand.brand_id} value={brand.brand_id}>
              {brand.name}
            </option>
          ))}
        </select>
        <select
          name="status"
          value={filterStatus}
          onChange={handleFilterChange}
          className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="used">Used</option>
          <option value="custom">Custom</option>
          <option value="hot">Hot</option>
          <option value="available">Available</option>
          <option value="sale">Sale</option>
        </select>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          Add Product
        </button>
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Category</th>
              <th className="px-4 py-2 border">Brand</th>
              <th className="px-4 py-2 border">Price</th>
              <th className="px-4 py-2 border">Discount</th>
              <th className="px-4 py-2 border">Stock</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.product_id}>
                <td className="px-4 py-2 border">{product.product_id}</td>
                <td className="px-4 py-2 border">{product.name}</td>
                <td className="px-4 py-2 border">{product.category_name}</td>
                <td className="px-4 py-2 border">{product.brand_name}</td>
                <td className="px-4 py-2 border">{product.price}</td>
                <td className="px-4 py-2 border">{product.discount}%</td>
                <td className="px-4 py-2 border">{product.stock_quantity}</td>
                <td className="px-4 py-2 border">{product.status}</td>
                <td className="px-4 py-2 border flex gap-2">
                  <button
                    onClick={() => openEditModal(product)}
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.product_id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Product</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Category</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={0}>Select Category</option>
                    {categories.map((category) => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Brand</label>
                  <select
                    name="brand_id"
                    value={formData.brand_id}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={0}>Select Brand</option>
                    {brands.map((brand) => (
                      <option key={brand.brand_id} value={brand.brand_id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleFormChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleFormChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="new">New</option>
                    <option value="used">Used</option>
                    <option value="custom">Custom</option>
                    <option value="hot">Hot</option>
                    <option value="available">Available</option>
                    <option value="sale">Sale</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary h-24"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {images.length > 0 && (
                  <div className="mt-2 overflow-x-auto flex gap-2">
                    {images.slice(0, 4).map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`Preview ${index}`}
                          className={`w-20 h-20 object-cover rounded-lg border-2 ${
                            formData.primary_image_index === index
                              ? "border-primary"
                              : "border-gray-200"
                          }`}
                          onClick={() => handlePrimaryImageSelect(index)}
                        />
                      </div>
                    ))}
                    {images.length > 4 && (
                      <span className="text-gray-500">+{images.length - 4} more</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
                >
                  Add Product
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Product</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleEditProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Category</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={0}>Select Category</option>
                    {categories.map((category) => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Brand</label>
                  <select
                    name="brand_id"
                    value={formData.brand_id}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={0}>Select Brand</option>
                    {brands.map((brand) => (
                      <option key={brand.brand_id} value={brand.brand_id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleFormChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleFormChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="new">New</option>
                    <option value="used">Used</option>
                    <option value="custom">Custom</option>
                    <option value="hot">Hot</option>
                    <option value="available">Available</option>
                    <option value="sale">Sale</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary h-24"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">New Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {images.length > 0 && (
                  <div className="mt-2 overflow-x-auto flex gap-2">
                    {images.slice(0, 4).map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`Preview ${index}`}
                          className={`w-20 h-20 object-cover rounded-lg border-2 ${
                            formData.primary_image_index === index
                              ? "border-primary"
                              : "border-gray-200"
                          }`}
                          onClick={() => handlePrimaryImageSelect(index)}
                        />
                      </div>
                    ))}
                    {images.length > 4 && (
                      <span className="text-gray-500">+{images.length - 4} more</span>
                    )}
                  </div>
                )}
              </div>
              {existingImages.length > 0 && (
                <div>
                  <label className="block text-gray-700 mb-2">Existing Images</label>
                  <div className="mt-2 overflow-x-auto flex gap-2">
                    {existingImages.slice(0, 4).map((img, index) => (
                      <div key={img.image_id} className="relative">
                        <img
                          src={`/Uploads/products/${img.image_url}`}
                          alt={`Existing ${index}`}
                          className={`w-20 h-20 object-cover rounded-lg border-2 ${
                            img.is_main ? "border-primary" : "border-gray-200"
                          }`}
                        />
                        <button
                          onClick={() => handleRemoveExistingImage(img.image_id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          <i className="ri-close-line"></i>
                        </button>
                      </div>
                    ))}
                    {existingImages.length > 4 && (
                      <span className="text-gray-500">+{existingImages.length - 4} more</span>
                    )}
                  </div>
                </div>
              )}
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
                >
                  Update Product
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    resetForm();
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;