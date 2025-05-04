import React, { useState, useEffect } from "react";
import api from "../../../api/index";

const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [editCategoryId, setEditCategoryId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, [search]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const params = { search };
      const response = await api.get("/categories.php", { params });
      if (
        response.data.status === "success" &&
        Array.isArray(response.data.data)
      ) {
        setCategories(response.data.data);
        setError("");
      } else {
        setCategories([]);
        setError("Invalid response format from server");
      }
    } catch (err) {
      setCategories([]);
      if (err.response) {
        if (err.response.status === 403) {
          setError("You do not have permission to access this page.");
        } else if (err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError("Failed to fetch categories");
        }
      } else {
        setError(
          "Failed to fetch categories: " + (err.message || "Unknown error")
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
      description: "",
    });
    setShowModal(true);
    setError("");
  };

  const openEditModal = (category) => {
    setModalMode("edit");
    setEditCategoryId(category.category_id);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditCategoryId(null);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "add") {
        const response = await api.post("/categories.php", formData);
        if (response.data.status === "success") {
          fetchCategories();
          closeModal();
        } else {
          setError(response.data.message || "Failed to add category");
        }
      } else {
        const response = await api.put(
          `/categories.php?id=${editCategoryId}`,
          formData
        );
        if (response.data.status === "success") {
          fetchCategories();
          closeModal();
        } else {
          setError(response.data.message || "Failed to update category");
        }
      }
    } catch (err) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(
          modalMode === "add"
            ? "Failed to add category"
            : "Failed to update category"
        );
      }
      console.error(err);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    try {
      const response = await api.delete(`/categories.php?id=${categoryId}`);
      if (response.data.status === "success") {
        setCategories(
          categories.filter((cat) => cat.category_id !== categoryId)
        );
        setError("");
      } else {
        setError(response.data.message || "Failed to delete category");
      }
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError("You do not have permission to perform this action.");
      } else {
        setError(
          "Failed to delete category: " + (err.message || "Unknown error")
        );
      }
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Categories Management</h1>
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/3 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={openAddModal}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          Add Category
        </button>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p className="text-gray-500 mb-4">Loading categories...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Description</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(categories) && categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category.category_id}>
                    <td className="px-4 py-2 border">{category.category_id}</td>
                    <td className="px-4 py-2 border">{category.name}</td>
                    <td className="px-4 py-2 border">
                      {category.description || "-"}
                    </td>
                    <td className="px-4 py-2 border flex gap-2">
                      <button
                        onClick={() => openEditModal(category)}
                        className="text-blue-500 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category.category_id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-2 border text-center">
                    No categories found
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
              {modalMode === "add" ? "Add New Category" : "Edit Category"}
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
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="4"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
                >
                  {modalMode === "add" ? "Add Category" : "Update Category"}
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

export default CategoriesManagement;
