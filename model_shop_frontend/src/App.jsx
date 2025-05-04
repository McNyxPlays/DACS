import React, { useState, useEffect } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
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
        localStorage.setItem("user", JSON.stringify(userData));
      }}
    />
    <Outlet context={{ user }} />
    <Footer />
    <BackToTop />
  </div>
);

const App = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      api
        .get("/user.php")
        .then((response) => {
          if (response.data.status === "success" && response.data.user) {
            setUser(response.data.user);
            localStorage.setItem("user", JSON.stringify(response.data.user));
          } else {
            localStorage.removeItem("user");
            setUser(null);
          }
        })
        .catch((err) => {
          console.error("User fetch error:", err);
          localStorage.removeItem("user");
          setUser(null);
        });
    }
  }, []);

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
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
        <Route path="/admin/*" element={<Admin />} />
      </Route>
    </Routes>
  );
};

export default App;
