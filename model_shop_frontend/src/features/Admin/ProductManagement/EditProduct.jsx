import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../../../api/index";
import { Toastify } from "../../../components/Toastify";

const EditProduct = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
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
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/productsmana.php?id=${id}`);
        if (response.data.success && response.data.data && response.data.data.length > 0) {
          const product = response.data.data[0];
          setFormData({
            name: product.name || "",
            category_id: product.category_id || 0,
            brand_id: product.brand_id || 0,
            price: product.price || "",
            discount: product.discount || 0,
            stock_quantity: product.stock_quantity || 0,
            description: product.description || "",
            status: product.status || "new",
            primary_image_index: -1,
          });
          setExistingImages(product.images || []);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        setError("Failed to fetch product: " + (err.message || "Unknown error"));
        console.error(err);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await api.get("/categoriesmana.php");
        if (response.data.status === "success" && Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        } else {
          setCategories([]);
          setError("Invalid categories response format");
        }
      } catch (err) {
        setError("Failed to fetch categories: " + (err.message || "Unknown error"));
        console.error(err);
      }
    };

    const fetchBrands = async () => {
      try {
        const response = await api.get("/brandsmana.php");
        if (response.data.status === "success" && Array.isArray(response.data.data)) {
          setBrands(response.data.data);
        } else {
          setBrands([]);
          setError("Invalid brands response format");
        }
      } catch (err) {
        setError("Failed to fetch brands: " + (err.message || "Unknown error") + err);
        console.error(err);
      }
    };

    fetchProduct();
    fetchCategories();
    fetchBrands();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === "stock_quantity" || name === "discount" || name === "primary_image_index" ? parseFloat(value) : value 
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
      setImages(Array.from(files)); // Convert FileList to array
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
        setError("");
      } else {
        setError(response.data.error || "Failed to delete image");
      }
    } catch (err) {
      setError("Failed to delete image: " + (err.message || "Unknown error"));
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length > 0 && error) return;
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
      const response = await api.post(`/productsmana.php?id=${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        Toastify.success("Product updated successfully");
        navigate("/admin/products");
      } else {
        setError(response.data.error || "Failed to update product");
      }
    } catch (err) {
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to update product: " + (err.message || "Unknown error"));
      }
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="max-w-4xl overflow-y-auto" style={{ maxHeight: "70vh" }}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
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
              onChange={handleChange}
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
                      src={`/Uploads/${img.image_url}`}
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
            <Link
              to="/admin/products"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Back
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;