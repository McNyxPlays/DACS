import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../api/index";

const EditPromotions = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    discount_percentage: 0,
    start_date: "",
    end_date: "",
    status: "active",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const response = await api.get(`/promotionsmana.php?id=${id}`);
        if (response.data.status === "success" && response.data.data && response.data.data.length > 0) {
          const promotion = response.data.data[0];
          setFormData({
            name: promotion.name || "",
            discount_percentage: promotion.discount_percentage || 0,
            start_date: promotion.start_date || "",
            end_date: promotion.end_date || "",
            status: promotion.status || "active",
          });
        } else {
          setError(response.data.message || "Promotion not found");
        }
      } catch (err) {
        setError("Failed to fetch promotion: " + (err.message || "Unknown error"));
        console.error(err);
      }
    };
    fetchPromotion();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.discount_percentage < 0 || formData.discount_percentage > 100) {
      setError("Discount percentage must be between 0 and 100");
      return;
    }

    const requestData = { ...formData };
    try {
      const response = await api.put(`/promotionsmana.php?id=${id}`, requestData);
      if (response.data.status === "success") {
        navigate("/admin/promotions");
      } else {
        setError(response.data.message || "Failed to update promotion");
      }
    } catch (err) {
      setError("Failed to update promotion: " + (err.message || "Unknown error"));
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Promotion</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="max-w-4xl overflow-y-auto" style={{ maxHeight: "70vh" }}>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
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
          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
            >
              Update Promotion
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/promotions")}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPromotions;