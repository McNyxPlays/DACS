import React, { useState, useEffect } from "react";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { ToastifyContainer } from "./components/Toastify";
import Header from "./components/Header";
import LoginModal from "./components/LoginModal/LoginModal";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import Home from "./features/Home/Home";
import Shop from "./features/Shop/Shop";
import Community from "./features/Community/Community";
import OrderHistory from "./features/UserProfile/Order/orderhistory";
import MyStore from "./features/UserProfile/MyStore/mystore";
import UserProfileOverview from "./features/UserProfile/UserProfileOverview/UserProfileOverview";
import OtherUserProfile from "./features/UserProfile/OtherUserProfile/OtherUserProfile";
import AccountSettings from "./features/UserProfile/AccountSettings/AccountSettings";
import Admin from "./features/Admin/Admin";
import Favorites from "./features/Favorites/Favorites";
import Cart from "./features/Cart/Cart";
import Messages from "./features/UserProfile/Messages/Messages";
import Checkout from "./features/Checkout/Checkout";
import OrderSuccess from "./features/Checkout/OrderSuccess";
import Notifications from "./features/UserProfile/Notifications/Notifications";
import api from "./api/index";

const Layout = ({
  isLoginModalOpen,
  setIsLoginModalOpen,
  user,
  setUser,
  isCartOpen,
  setIsCartOpen,
}) => (
  <div>
    <Header
      user={user}
      setIsLoginModalOpen={setIsLoginModalOpen}
      setUser={setUser}
      isCartOpen={isCartOpen}
      setIsCartOpen={setIsCartOpen}
    />
    <LoginModal
      isOpen={isLoginModalOpen}
      setIsOpen={setIsLoginModalOpen}
      onLoginSuccess={(userData) => {
        setUser(userData);
        sessionStorage.setItem("user", JSON.stringify(userData));
      }}
    />
    <Outlet context={{ user }} />
    <Footer />
    <BackToTop />
    <ToastifyContainer />
    {isCartOpen && <Cart isOpen={isCartOpen} setIsOpen={setIsCartOpen} />}
  </div>
);

const ProtectedRoute = ({ user, children }) => {
  if (!user?.user_id) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const validateUser = async () => {
      const storedUser = JSON.parse(sessionStorage.getItem("user"));
      console.log("Stored user from sessionStorage:", storedUser);
      if (storedUser && storedUser.user_id) {
        try {
          const response = await api.get("/user.php");
          console.log("User.php response:", response.data);
          if (response.data.status === "success" && response.data.user) {
            const validatedUser = {
              user_id: response.data.user.user_id || storedUser.user_id,
              email: response.data.user.email || storedUser.email,
              full_name: response.data.user.full_name || storedUser.full_name,
              profile_image:
                response.data.user.profile_image ||
                storedUser.profile_image ||
                null,
              role: response.data.user.role || storedUser.role,
            };
            setUser(validatedUser);
            sessionStorage.setItem("user", JSON.stringify(validatedUser));
          } else {
            sessionStorage.removeItem("user");
            setUser(null);
          }
        } catch (err) {
          console.error("User validation error:", err);
          sessionStorage.removeItem("user");
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    validateUser();
  }, []);

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    sessionStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <Routes>
      <Route
        element={
          <Layout
            isLoginModalOpen={isLoginModalOpen}
            setIsLoginModalOpen={setIsLoginModalOpen}
            user={user}
            setUser={setUser}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
          />
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/community" element={<Community />} />
        <Route
          path="/orderhistory"
          element={
            <ProtectedRoute user={user}>
              <OrderHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mystore"
          element={
            <ProtectedRoute user={user}>
              <MyStore />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user}>
              <UserProfileOverview user={user} />
            </ProtectedRoute>
          }
        />
        <Route path="/profile/:userId" element={<OtherUserProfile />} />
        <Route
          path="/settings"
          element={
            <ProtectedRoute user={user}>
              <AccountSettings user={user} onUserUpdate={handleUserUpdate} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute user={user}>
              <Favorites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={<Cart isOpen={true} setIsOpen={setIsCartOpen} />}
        />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/ordersuccess" element={<OrderSuccess />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute user={user}>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute user={user}>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages/:userId"
          element={
            <ProtectedRoute user={user}>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute user={user}>
              <Notifications user={user} />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default App;