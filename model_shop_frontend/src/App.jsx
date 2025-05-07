import React, { useState, useEffect } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { ToastifyContainer } from "./components/Toastify";
import Header from "./components/Header";
import LoginModal from "./components/LoginModal/LoginModal";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import Home from "./features/Home/Home";
import Shop from "./features/Shop/Shop";
import Community from "./features/Community/Community";
import UserProfileOverview from "./features/UserProfile/UserProfileOverview/UserProfileOverview";
import AccountSettings from "./features/UserProfile/AccountSettings/AccountSettings";
import Admin from "./features/Admin/Admin";
import Favorites from "./features/Favorites/Favorites";
import Cart from "./features/Cart/Cart";
import api from "./api/index";

const Layout = ({ isLoginModalOpen, setIsLoginModalOpen, user, setUser }) => (
  <div>
    <Header
      user={user}
      setIsLoginModalOpen={setIsLoginModalOpen}
      setUser={setUser}
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
  </div>
);

const App = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    if (storedUser) {
      api
        .get("/user.php")
        .then((response) => {
          if (response.data.status === "success" && response.data.user) {
            setUser(response.data.user);
            sessionStorage.setItem("user", JSON.stringify(response.data.user));
          } else {
            sessionStorage.removeItem("user");
            setUser(null);
          }
        })
        .catch((err) => {
          console.error("User fetch error:", err);
          sessionStorage.removeItem("user");
          setUser(null);
        });
    }
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
          />
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/community" element={<Community />} />
        <Route path="/profile" element={<UserProfileOverview user={user} />} />
        <Route
          path="/settings"
          element={
            <AccountSettings user={user} onUserUpdate={handleUserUpdate} />
          }
        />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/admin/*" element={<Admin />} />
      </Route>
    </Routes>
  );
};

export default App;
