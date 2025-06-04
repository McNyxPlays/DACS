import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", error);
    return Promise.reject(error);
  }
);

export const getConversations = () => api.get("/messages.php");
export const getConversationMessages = (conversationId) =>
  api.get(`/messages.php?conversation_id=${conversationId}`);
export const sendMessage = (messageData) => api.post("/messages.php", messageData);

export const getUsers = (params) => api.get("/Usersmana.php", { params });
export const getUserById = (id) => api.get(`/Usersmana.php?id=${id}`);
export const addUser = (userData) => api.post("/Usersmana.php", userData, {
  headers: { "Content-Type": "multipart/form-data" }
});
export const updateUserById = (id, userData) => {
  const formDataObj = {};
  userData.forEach((value, key) => { formDataObj[key] = value; });
  return api.put(`/Usersmana.php?id=${id}`, formDataObj, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });
};
export const deleteUser = (id) => api.delete(`/Usersmana.php?id=${id}`);

/*
// Endpoints cho notifications
export const getNotifications = (params) =>
  api.get("/notifications.php", { params });
export const markNotificationsAsRead = () =>
  api.post("/notifications.php?action=markAsRead");
export const deleteNotifications = () =>
  api.post("/notifications.php?action=delete");

// Lấy thông tin người dùng hiện tại
export const getUser = () => api.get("/user.php");

// Cập nhật thông tin người dùng hiện tại
export const updateUser = (userData) => api.put("/user.php", userData);

// Đăng xuất
export const logout = () => api.post("/user.php");

// Đăng nhập
export const login = (email, password) =>
  api.post("/login.php", { email, password });

// Đăng ký
export const register = (email, password, full_name) =>
  api.post("/register.php", { email, password, full_name });
*/
export default api;