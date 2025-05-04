import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../../api/index";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState(0);
  const [status, setStatus] = useState("");
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formData, setFormData] = useState({
    name: "",
    category_id: 0,
    price: "",
    description: "",
    status: "new",
  });
  const [images, setImages] = useState([]);
  const [editProductId, setEditProductId] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [search, categoryId, status]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories.php");
      if (
        response.data.status === "success" &&
        Array.isArray(response.data.data)
      ) {
        setCategories(response.data.data);
      } else {
        setCategories([]);
        setError("Invalid categories response format");
      }
    } catch (err) {
      setCategories([]);
      setError(
        "Failed to fetch categories: " + (err.message || "Unknown error")
      );
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const params = { search };
      if (categoryId > 0) params.category_id = categoryId;
      if (status) params.status = status;
      const response = await api.get("/products.php", { params });
      if (response.data.success && Array.isArray(response.data.data)) {
        setProducts(response.data.data);
        setError("");
      } else {
        setProducts([]);
        setError("Invalid response format from server");
      }
    } catch (err) {
      setProducts([]);
      if (err.response) {
        if (err.response.status === 403) {
          setError("You do not have permission to access this page.");
        } else if (err.response.data && err.response.data.error) {
          setError(err.response.data.error);
        } else {
          setError("Failed to fetch products");
        }
      } else {
        setError(
          "Failed to fetch products: " + (err.message || "Unknown error")
        );
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormData({
      name: "",
      category_id: 0,
      price: "",
      description: "",
      status: "new",
    });
    setImages([]);
    setShowModal(true);
    setError("");
  };

  const openEditModal = (product) => {
    setModalMode("edit");
    setEditProductId(product.product_id);
    setFormData({
      name: product.name || "",
      category_id: product.category_id || 0,
      price: product.price || "",
      description: product.description || "",
      status: product.status || "new",
    });
    setImages([]);
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditProductId(null);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const files = e.target.files;
    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB
    let errorMsg = "";

    for (let i = 0; i < files.length; i++) {
      if (!validImageTypes.includes(files[i].type)) {
        errorMsg = "Only JPEG, PNG, and GIF images are allowed";
        break;
      }
      if (files[i].size > maxSize) {
        errorMsg = "Each image must be less than 5MB";
        break;
      }
    }

    if (errorMsg) {
      setError(errorMsg);
      setImages([]);
    } else {
      setError("");
      setImages(files);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length > 0 && error) return; // Prevent submission if image validation failed

    const data = new FormData();
    data.append("name", formData.name);
    data.append("category_id", formData.category_id);
    data.append("price", formData.price);
    data.append("description", formData.description);
    data.append("status", formData.status);
    for (let i = 0; i < images.length; i++) {
      data.append("images[]", images[i]);
    }

    try {
      if (modalMode === "add") {
        const response = await api.post("/products.php", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data.success) {
          fetchProducts();
          closeModal();
        } else {
          setError(response.data.error || "Failed to add product");
        }
      } else {
        const response = await api.put(
          `/products.php?id=${editProductId}`,
          data,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        if (response.data.success) {
          fetchProducts();
          closeModal();
        } else {
          setError(response.data.error || "Failed to update product");
        }
      }
    } catch (err) {
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError(
          modalMode === "add"
            ? "Failed to add product"
            : "Failed to update product"
        );
      }
      console.error(err);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      const response = await api.delete(`/products.php?id=${productId}`);
      if (response.data.success) {
        setProducts(
          products.filter((product) => product.product_id !== productId)
        );
        setError("");
      } else {
        setError(response.data.error || "Failed to delete product");
      }
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError("You do not have permission to perform this action.");
      } else {
        setError(
          "Failed to delete product: " + (err.message || "Unknown error")
        );
      }
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Product Management</h1>
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/3 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(parseInt(e.target.value))}
          className="w-full sm:w-1/4 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value={0}>All Categories</option>
          {categories.map((category) => (
            <option key={category.category_id} value={category.category_id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full sm:w-1/4 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="used">Used</option>
          <option value="custom">Custom</option>
        </select>
        <button
          onClick={openAddModal}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          Add Product
        </button>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p className="text-gray-500 mb-4">Loading products...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Category</th>
                <th className="px-4 py-2 border">Price</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(products) && products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.product_id}>
                    <td className="px-4 py-2 border">{product.product_id}</td>
                    <td className="px-4 py-2 border">{product.name}</td>
                    <td className="px-4 py-2 border">
                      {product.category_name || "-"}
                    </td>
                    <td className="px-4 py-2 border">
                      ${parseFloat(product.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 border">{product.status}</td>
                    <td className="px-4 py-2 border flex gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="text-blue-500 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.product_id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-2 border text-center">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">
              {modalMode === "add" ? "Add New Product" : "Edit Product"}
            </h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Category</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={0}>Select Category</option>
                  {categories.map((category) => (
                    <option
                      key={category.category_id}
                      value={category.category_id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
                >
                  {modalMode === "add" ? "Add Product" : "Update Product"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
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
