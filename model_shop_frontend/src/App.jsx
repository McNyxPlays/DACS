import React, { useState, useEffect } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import Header from "./components/Header";
import LoginModal from "./components/LoginModal/LoginModal";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import Home from "./features/Home/Home";
import Shop from "./features/Shop/Shop";
import Community from "./features/Community/Community";
import UserProfileOverview from "./features/UserProfile/UserProfileOverview";
import AccountSettings from "./features/UserProfile/AccountSettings";
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
    <Outlet />
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
          if (response.data.user) {
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
        <Route path="/profile" element={<UserProfileOverview />} />
        <Route path="/settings" element={<AccountSettings />} />
      </Route>
    </Routes>
  );
};

export default App;
