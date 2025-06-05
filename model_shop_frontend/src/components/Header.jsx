import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../api/index";

const Header = ({
  setIsLoginModalOpen,
  user,
  setUser,
  isCartOpen,
  setIsCartOpen,
}) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [cartCount, setCartCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const sessionKey =
    sessionStorage.getItem("guest_session_key") ||
    (() => {
      const newSessionKey = `guest_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      sessionStorage.setItem("guest_session_key", newSessionKey);
      return newSessionKey;
    })();

  const toggleNav = () => {
    setIsNavOpen((prev) => {
      document.body.style.overflow = !prev ? "hidden" : "auto";
      return !prev;
    });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      await api.post("/user.php");
      setUser(null);
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("guest_session_key");
      setCartCount(0);
      const event = new CustomEvent("cartUpdated");
      window.dispatchEvent(event);
      setIsNavOpen(false);
      setIsDropdownOpen(false);
      document.body.style.overflow = "auto";
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
      setUser(null);
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("guest_session_key");
      setCartCount(0);
      const event = new CustomEvent("cartUpdated");
      window.dispatchEvent(event);
      setIsNavOpen(false);
      setIsDropdownOpen(false);
      document.body.style.overflow = "auto";
      navigate("/");
    }
  };

  const fetchCounts = async () => {
    try {
      if (user) {
        const cartResponse = await api.get("/carts.php", {
          params: { user_id: user.user_id },
        });
        setCartCount(cartResponse.data.data?.length || 0);

        const notificationResponse = await api.get("/notifications.php", {
          params: { action: "count" },
        });
        setNotificationCount(notificationResponse.data.unread_count || 0);
      } else {
        const cartResponse = await api.get("/guest_carts.php", {
          params: { session_key: sessionKey },
        });
        setCartCount(cartResponse.data.data?.length || 0);
        setNotificationCount(0);
      }
    } catch (err) {
      console.error("Fetch counts error:", err);
      setCartCount(0);
      setNotificationCount(0);
    }
  };

  useEffect(() => {
    fetchCounts();

    const handleCartUpdate = () => {
      setTimeout(() => {
        fetchCounts();
      }, 500);
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    if (user) {
      const eventSource = new EventSource("/api/notifications_sse.php", {
        withCredentials: true,
      });

      eventSource.addEventListener("notification_count", (event) => {
        setNotificationCount(parseInt(event.data));
      });

      eventSource.addEventListener("error", (event) => {
        console.error("SSE error:", event);
        eventSource.close();
      });

      return () => {
        eventSource.close();
      };
    }

    return () => {
      window.removeEventListener("cartUpdate", handleCartUpdate);
    };
  }, [user, sessionKey]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <NavLink to="/" className="text-3xl font-['Pacifico'] text-primary">
            Scraptify
          </NavLink>
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `font-medium transition ${
                  isActive
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-600 hover:text-primary"
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/shop"
              className={({ isActive }) =>
                `font-medium transition ${
                  isActive
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-600 hover:text-primary"
                }`
              }
            >
              Shop
            </NavLink>
            <NavLink
              to="/community"
              className={({ isActive }) =>
                `font-medium transition ${
                  isActive
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-600 hover:text-primary"
                }`
              }
            >
              Community
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block w-64">
            <input
              type="text"
              placeholder="Search models..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-sm"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-500">
              <i className="ri-search-line"></i>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <NavLink
                to="/favorites"
                className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full"
              >
                <i className="ri-heart-line ri-xl"></i>
              </NavLink>
            )}
            <NavLink
              to="#"
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full relative"
            >
              <i className="ri-shopping-cart-line ri-xl"></i>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </NavLink>
            <NavLink
              to="/orderstatus"
              className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full"
            >
              <i className="ri-truck-line ri-xl"></i>
            </NavLink>
            {user && user.role === "admin" && (
              <NavLink
                to="/admin"
                className="hidden md:flex items-center gap-2 text-gray-700 hover:text-primary transition"
              >
                <i className="ri-shield-user-line ri-lg"></i>
              </NavLink>
            )}

            {user ? (
              <div className="hidden md:block relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 text-gray-700 hover:text-primary transition"
                >
                  {user.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <i className="ri-user-line ri-lg text-gray-700"></i>
                  )}
                  <span className="text-gray-700 font-medium">
                    {user.full_name || user.email || "User"}
                  </span>
                  <i
                    className={`ri-arrow-${isDropdownOpen ? "up" : "down"}-s-line`}
                  ></i>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
                    <div className="flex flex-col">
                      <NavLink
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <i className="ri-user-line"></i>
                        <span>My Profile</span>
                      </NavLink>
                      <NavLink
                        to="/mystore"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <i className="ri-store-line"></i>
                        <span>My Store</span>
                      </NavLink>
                      <NavLink
                        to="/orderhistory"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <i className="ri-store-line"></i>
                        <span>Order History</span>
                      </NavLink>
                      <NavLink
                        to="/settings"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <i className="ri-settings-3-line"></i>
                        <span>Account Settings</span>
                      </NavLink>
                      <NavLink
                        to="/notifications"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <i className="ri-notification-3-line"></i>
                        <span>Notifications</span>
                        {notificationCount > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-4 w-auto min-w-[1rem] flex items-center justify-center px-1">
                            {notificationCount > 99 ? "99+" : notificationCount}
                          </span>
                        )}
                      </NavLink>
                      <NavLink
                        to="/messages"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <i className="ri-message-3-line"></i>
                        <span>Messages</span>
                      </NavLink>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 text-left"
                      >
                        <i className="ri-logout-box-line"></i>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="openLoginModal"
                onClick={() => setIsLoginModalOpen(true)}
                className="hidden md:flex items-center gap-2 text-gray-700 hover:text-primary transition"
              >
                <i className="ri-user-line ri-lg"></i>
                <span>Sign In</span>
              </button>
            )}

            <button
              className="md:hidden w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full"
              onClick={toggleNav}
            >
              <i
                className={
                  isNavOpen ? "ri-close-line ri-xl" : "ri-menu-line ri-xl"
                }
              ></i>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`md:hidden bg-white shadow-lg absolute top-full left-0 w-full transition-all duration-300 ${
          isNavOpen
            ? "max-h-screen opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <nav className="flex flex-col p-4 gap-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `font-medium py-2 ${
                isActive ? "text-primary" : "text-gray-600 hover:text-primary"
              }`
            }
            onClick={toggleNav}
          >
            Home
          </NavLink>
          <NavLink
            to="/shop"
            className={({ isActive }) =>
              `font-medium py-2 ${
                isActive ? "text-primary" : "text-gray-600 hover:text-primary"
              }`
            }
            onClick={toggleNav}
          >
            Shop
          </NavLink>
          <NavLink
            to="/community"
            className={({ isActive }) =>
              `font-medium py-2 ${
                isActive ? "text-primary" : "text-gray-600 hover:text-primary"
              }`
            }
            onClick={toggleNav}
          >
            Community
          </NavLink>
          {user && (
            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                `font-medium py-2 ${
                  isActive ? "text-primary" : "text-gray-600 hover:text-primary"
                }`
              }
              onClick={toggleNav}
            >
              Favorites
            </NavLink>
          )}
          <NavLink
            to="#"
            onClick={() => {
              setIsCartOpen(!isCartOpen);
              toggleNav();
            }}
            className={({ isActive }) =>
              `font-medium py-2 ${
                isActive ? "text-primary" : "text-gray-600 hover:text-primary"
              }`
            }
          >
            Cart
          </NavLink>

          <div className="relative mt-4">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-sm"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-500">
              <i className="ri-search-line"></i>
            </div>
          </div>

          {user && user.role === "admin" && (
            <NavLink
              to="/admin"
              className="flex items-center gap-2 py-2 text-gray-600 hover:text-primary"
              onClick={toggleNav}
            >
              <i className="ri-shield-user-line"></i>
            </NavLink>
          )}

          {user ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 py-2">
                {user.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <i className="ri-user-line ri-lg text-gray-600"></i>
                )}
                <span className="text-gray-600 font-medium">
                  {user.full_name || user.email || "User"}
                </span>
              </div>
              <NavLink
                to="/profile"
                className="flex items-center gap-2 py-2 text-gray-600 hover:text-primary"
                onClick={toggleNav}
              >
                <i className="ri-user-line"></i>
                <span>My Profile</span>
              </NavLink>
              <NavLink
                to="/mystore"
                className="flex items-center gap-2 py-2 text-gray-600 hover:text-primary"
                onClick={toggleNav}
              >
                <i className="ri-store-line"></i>
                <span>My Store</span>
              </NavLink>
              <NavLink
                to="/orderhistory"
                className="flex items-center gap-2 py-2 text-gray-600 hover:text-primary"
                onClick={toggleNav}
              >
                <i className="ri-store-line"></i>
                <span>Order History</span>
              </NavLink>
              <NavLink
                to="/settings"
                className="flex items-center gap-2 py-2 text-gray-600 hover:text-primary"
                onClick={toggleNav}
              >
                <i className="ri-settings-3-line"></i>
                <span>Account Settings</span>
              </NavLink>
              <NavLink
                to="/notifications"
                className="flex items-center gap-2 py-2 text-gray-600 hover:text-primary"
                onClick={toggleNav}
              >
                <i className="ri-notification-3-line"></i>
                <span>Notifications</span>
                {notificationCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-4 w-auto min-w-[1rem] flex items-center justify-center px-1">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </NavLink>
              <NavLink
                to="/messages"
                className="flex items-center gap-2 py-2 text-gray-600 hover:text-primary"
                onClick={toggleNav}
              >
                <i className="ri-message-3-line"></i>
                <span>Messages</span>
              </NavLink>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 py-2 text-red-600 hover:text-primary text-left"
              >
                <i className="ri-logout-box-line"></i>
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsLoginModalOpen(true);
                toggleNav();
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-primary transition py-2"
            >
              <i className="ri-user-line ri-lg"></i>
              <span>Sign In</span>
            </button>
          )}
          <NavLink
            to="/orderstatus"
            className="flex items-center gap-2 py-2 text-gray-600 hover:text-primary"
            onClick={toggleNav}
          >
            <i className="ri-truck-line"></i>
            <span>Check Order Status</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;