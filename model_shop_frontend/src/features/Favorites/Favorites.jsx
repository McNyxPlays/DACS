import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../api/index";

const Favorites = () => {
  const { user } = useOutletContext();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const sessionId =
    localStorage.getItem("guest_session_id") || `guest_${Date.now()}`;

  useEffect(() => {
    if (!localStorage.getItem("guest_session_id")) {
      localStorage.setItem("guest_session_id", sessionId);
    }

    const fetchFavorites = async () => {
      try {
        setLoading(true);
        if (user) {
          const response = await api.get("/favorites.php", {
            params: { user_id: user.user_id },
          });
          setFavorites(response.data.favorites || []);
        } else {
          const response = await api.get("/guest_favorites.php", {
            params: { session_id: sessionId },
          });
          setFavorites(response.data.favorites || []);
        }
      } catch (err) {
        console.error("Fetch favorites error:", err);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, sessionId]);

  const removeFavorite = async (favoriteId, productId) => {
    try {
      if (user) {
        await api.delete("/favorites.php", {
          data: { favorite_id: favoriteId, user_id: user.user_id },
        });
      } else {
        await api.delete("/guest_favorites.php", {
          data: { session_id: sessionId, product_id: productId },
        });
      }
      setFavorites(
        favorites.filter(
          (fav) =>
            fav.favorite_id !== favoriteId && fav.product_id !== productId
        )
      );
    } catch (err) {
      console.error("Remove favorite error:", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Favorites</h1>
      {loading ? (
        <p>Loading...</p>
      ) : favorites.length === 0 ? (
        <p>No favorites added yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((fav) => (
            <div
              key={fav.favorite_id || fav.product_id}
              className="border rounded-lg p-4 shadow-sm"
            >
              <img
                src={fav.image_url || "/placeholder.jpg"}
                alt={fav.name}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <h3 className="text-lg font-medium">{fav.name}</h3>
              <p className="text-gray-600">${fav.price}</p>
              <button
                onClick={() => removeFavorite(fav.favorite_id, fav.product_id)}
                className="mt-4 text-red-600 hover:text-red-800"
              >
                <i className="ri-heart-fill ri-xl"></i> Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
