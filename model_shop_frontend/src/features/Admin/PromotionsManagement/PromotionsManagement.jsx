import React, { useState, useEffect } from "react";
import api from "../../../api/index";
import { Toastify } from "../../../components/Toastify";
import { format, parse } from "date-fns";

const PromotionsManagement = () => {
  const [promotions, setPromotions] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    discount_percentage: 0,
    start_date: "",
    end_date: "",
    status: "active",
    min_order_value: 0,
    max_discount_value: 0,
    usage_count: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchPromotions();
  }, [search, status]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError("");
      const params = { search };
      if (status) params.status = status;
      const response = await api.get("/promotionsmana.php", { params });
      if (response.data.status === "success" && Array.isArray(response.data.data)) {
        setPromotions(response.data.data);
        setError("");
      } else {
        setPromotions([]);
        setError(response.data.message || "Invalid response format from server");
      }
    } catch (err) {
      setPromotions([]);
      setError("Failed to fetch promotions: " + (err.message || "Unknown error"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormData({
      name: "",
      code: "",
      discount_percentage: 0,
      start_date: "",
      end_date: "",
      status: "active",
      min_order_value: 0,
      max_discount_value: 0,
      usage_count: 0,
      is_active: true,
    });
    setShowModal(true);
    setError("");
  };

  const openEditModal = (promotion) => {
    setModalMode("edit");
    setFormData({
      name: promotion.name || "",
      code: promotion.code || "",
      discount_percentage: promotion.discount_percentage || 0,
      start_date: promotion.start_date ? format(new Date(promotion.start_date), "dd/MM/yyyy") : "",
      end_date: promotion.end_date ? format(new Date(promotion.end_date), "dd/MM/yyyy") : "",
      status: promotion.status || "active",
      min_order_value: promotion.min_order_value || 0,
      max_discount_value: promotion.max_discount_value || 0,
      usage_count: promotion.usage_count || 0,
      is_active: promotion.is_active !== undefined ? promotion.is_active : true,
    });
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const parseDateInput = (value) => {
    if (!value) return "";
    try {
      const parsed = parse(value, "dd/MM/yyyy", new Date());
      return format(parsed, "yyyy-MM-dd");
    } catch {
      return value;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code) {
      setError("Promo code is required");
      return;
    }
    if (formData.discount_percentage < 0 || formData.discount_percentage > 100) {
      setError("Discount percentage must be between 0 and 100");
      return;
    }
    if (formData.min_order_value < 0) {
      setError("Minimum order value cannot be negative");
      return;
    }
    if (formData.max_discount_value < 0) {
      setError("Maximum discount value cannot be negative");
      return;
    }
    if (formData.usage_count < 0) {
      setError("Usage count cannot be negative");
      return;
    }
    if (new Date(parseDateInput(formData.end_date)) <= new Date(parseDateInput(formData.start_date))) {
      setError("End date must be after start date");
      return;
    }

    try {
      const requestData = {
        ...formData,
        start_date: parseDateInput(formData.start_date),
        end_date: parseDateInput(formData.end_date),
        usage_count: parseInt(formData.usage_count),
        is_active: formData.is_active,
      };
      if (modalMode === "add") {
        const response = await api.post("/promotionsmana.php", requestData);
        if (response.data.status === "success") {
          Toastify.success("Promotion added successfully");
          fetchPromotions();
          closeModal();
        } else {
          setError(response.data.message || "Failed to add promotion");
        }
      } else {
        const promotion = promotions.find(p => p.promotion_id === parseInt(formData.promotion_id));
        const response = await api.put(`/promotionsmana.php?id=${promotion?.promotion_id || 0}`, requestData);
        if (response.data.status === "success") {
          Toastify.success("Promotion updated successfully");
          fetchPromotions();
          closeModal();
        } else {
          setError(response.data.message || "Failed to update promotion");
        }
      }
    } catch (err) {
      setError(modalMode === "add" ? "Failed to add promotion" : "Failed to update promotion");
      console.error(err);
    }
  };

  const handleDelete = async (promotionId) => {
    if (!window.confirm("Are you sure you want to delete this promotion?")) return;
    try {
      const response = await api.delete(`/promotionsmana.php?id=${promotionId}`);
      if (response.data.status === "success") {
        setPromotions(promotions.filter((p) => p.promotion_id !== promotionId));
        setError("");
        Toastify.success("Promotion deleted successfully");
      } else {
        setError(response.data.message || "Failed to delete promotion");
      }
    } catch (err) {
      setError("Failed to delete promotion: " + (err.message || "Unknown error"));
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Promotions Management</h1>
      <div className="mb-4 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search promotions or codes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/2 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full sm:w-1/4 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>
        <button
          onClick={openAddModal}
          className="w-full sm:w-auto bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          Add Promotion
        </button>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p className="text-gray-500 mb-4">Loading promotions...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="flex flex-wrap">
                <th className="flex-1 px-3 py-2 border text-center">ID</th>
                <th className="flex-[2] px-3 py-2 border text-center">Name</th>
                <th className="flex-1 px-3 py-2 border text-center">Code</th>
                <th className="flex-1 px-3 py-2 border text-center">Discount (%)</th>
                <th className="flex-1 px-3 py-2 border text-center">Min Order</th>
                <th className="flex-1 px-3 py-2 border text-center">Max Discount</th>
                <th className="flex-1 px-3 py-2 border text-center">Usage Count</th>
                <th className="flex-1 px-3 py-2 border text-center">Start Date</th>
                <th className="flex-1 px-3 py-2 border text-center">End Date</th>
                <th className="flex-1 px-3 py-2 border text-center">Status</th>
                <th className="flex-1 px-3 py-2 border text-center">Active</th>
                <th className="flex-1 px-3 py-2 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(promotions) && promotions.length > 0 ? (
                promotions.map((promotion) => (
                  <tr key={promotion.promotion_id} className="flex flex-wrap">
                    <td className="flex-1 px-3 py-2 border text-center">{promotion.promotion_id}</td>
                    <td className="flex-[2] px-3 py-2 border text-center">{promotion.name}</td>
                    <td className="flex-1 px-3 py-2 border text-center">{promotion.code}</td>
                    <td className="flex-1 px-3 py-2 border text-center">{promotion.discount_percentage || 0}%</td>
                    <td className="flex-1 px-3 py-2 border text-center">{promotion.min_order_value || 0}</td>
                    <td className="flex-1 px-3 py-2 border text-center">{promotion.max_discount_value || 0}</td>
                    <td className="flex-1 px-3 py-2 border text-center">{promotion.usage_count || 0}</td>
                    <td className="flex-1 px-3 py-2 border text-center">
                      {promotion.start_date ? format(new Date(promotion.start_date), "dd/MM/yyyy") : ""}
                    </td>
                    <td className="flex-1 px-3 py-2 border text-center">
                      {promotion.end_date ? format(new Date(promotion.end_date), "dd/MM/yyyy") : ""}
                    </td>
                    <td className="flex-1 px-3 py-2 border text-center">{promotion.status}</td>
                    <td className="flex-1 px-3 py-2 border text-center">{promotion.is_active ? "Yes" : "No"}</td>
                    <td className="flex-1 px-3 py-2 border flex justify-center gap-2">
                      <button
                        onClick={() => openEditModal(promotion)}
                        className="text-blue-500 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(promotion.promotion_id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="flex flex-wrap">
                  <td colSpan="12" className="flex-1 px-3 py-2 border text-center">
                    No promotions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full" style={{ maxHeight: "70vh", overflowY: "auto" }}>
            <h2 className="text-xl font-bold mb-4">
              {modalMode === "add" ? "Add New Promotion" : "Edit Promotion"}
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
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Promo Code</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Discount (%)</label>
                <input
                  type="number"
                  name="discount_percentage"
                  value={formData.discount_percentage}
                  onChange={handleChange}
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Minimum Order Value</label>
                <input
                  type="number"
                  name="min_order_value"
                  value={formData.min_order_value}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Maximum Discount Value</label>
                <input
                  type="number"
                  name="max_discount_value"
                  value={formData.max_discount_value}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Usage Count</label>
                <input
                  type="number"
                  name="usage_count"
                  value={formData.usage_count}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Start Date</label>
                <input
                  type="text"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                  placeholder="DD/MM/YYYY"
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">End Date</label>
                <input
                  type="text"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                  placeholder="DD/MM/YYYY"
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="flex items-center text-gray-700 mb-2">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Active
                </label>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
                >
                  {modalMode === "add" ? "Add Promotion" : "Update Promotion"}
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

export default PromotionsManagement;