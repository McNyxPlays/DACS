import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  /*
  headers: {
    "Content-Type": "application/json",
  },
  */
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", error);
    return Promise.reject(error);
  }
);
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

// Lấy danh sách tất cả người dùng (admin)
export const getUsers = () => api.get("/Usersmana.php");

// Lấy thông tin một người dùng theo ID (admin)
export const getUserById = (id) => api.get(`/Usersmana.php?id=${id}`);

// Thêm người dùng mới (admin)
export const addUser = (userData) => api.post("/Usersmana.php", userData);

// Cập nhật thông tin người dùng (admin)
export const updateUserById = (id, userData) =>
  api.put(`/Users.php?id=${id}`, userData);

// Xóa người dùng (admin)
export const deleteUser = (id) => api.delete(`/Usersmana.php?id=${id}`);
*/
export default api;
