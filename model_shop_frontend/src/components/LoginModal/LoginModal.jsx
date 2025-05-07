import { useState, useEffect } from "react";
import api from "../../api/index";
import "./LoginModal.css";

function LoginModal({ isOpen, setIsOpen, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleClose = () => {
    setIsOpen(false);
    setIsLogin(true); // Reset to Sign In view when closing
    setError("");
    setSuccess("");
    document.body.style.overflow = "auto";
  };

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    const email = e.target.loginEmail.value;
    const password = e.target.loginPassword.value;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format. Please enter a valid email.");
      setSuccess("");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setSuccess("");
      return;
    }

    try {
      const response = await api.post("/login.php", { email, password });
      setSuccess(response.data.message);
      setError("");
      sessionStorage.setItem("user", JSON.stringify(response.data.user));
      if (onLoginSuccess) {
        onLoginSuccess(response.data.user);
      }
      handleClose();
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Network error. Please check your connection or server status.";
      setError(errorMessage);
      setSuccess("");
      console.log("Error details:", {
        status: err.response?.status,
        data: err.response?.data,
      });
    }
  };

  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    const full_name = e.target.registerName.value;
    const email = e.target.registerEmail.value;
    const password = e.target.registerPassword.value;
    const confirmPassword = e.target.confirmPassword.value;
    const termsAccepted = e.target.termsCheckbox.checked;

    if (!termsAccepted) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      setSuccess("");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setSuccess("");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format. Please enter a valid email.");
      setSuccess("");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setSuccess("");
      return;
    }

    try {
      const response = await api.post("/register.php", {
        email,
        password,
        full_name,
      });
      setSuccess("Registration successful! Logging you in...");
      setError("");

      try {
        const loginResponse = await api.post("/login.php", { email, password });
        sessionStorage.setItem("user", JSON.stringify(loginResponse.data.user));
        if (onLoginSuccess) {
          onLoginSuccess(loginResponse.data.user);
        }
        handleClose();
      } catch (loginErr) {
        console.error("Auto-login error:", loginErr);
        const loginErrorMessage =
          loginErr.response?.data?.message ||
          loginErr.message ||
          "Auto-login failed. Please sign in manually.";
        setError(loginErrorMessage);
        setIsLogin(true);
      }
    } catch (err) {
      console.error("Register error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Network error. Please check your connection or server status.";
      setError(errorMessage);
      setSuccess("");
    }
  };

  // Reset to Sign In view whenever the modal is opened
  useEffect(() => {
    if (isOpen) {
      setIsLogin(true);
      setError("");
      setSuccess("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {success && (
            <p className="text-green-500 text-center mb-4">{success}</p>
          )}
          {isLogin ? (
            <div id="loginForm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
                <button
                  onClick={handleClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="ri-close-line ri-lg"></i>
                </button>
              </div>
              <div className="space-y-4 mb-6">
                <button className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 px-4 text-gray-700 font-medium hover:bg-gray-50 transition rounded-button whitespace-nowrap">
                  <i className="ri-google-fill text-red-500"></i>
                  Continue with Google
                </button>
                <button className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 px-4 text-gray-700 font-medium hover:bg-gray-50 transition rounded-button whitespace-nowrap">
                  <i className="ri-facebook-fill text-blue-600"></i>
                  Continue with Facebook
                </button>
              </div>
              <div className="relative flex items-center gap-2 mb-6">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="text-gray-500 text-sm">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              <form className="space-y-4" onSubmit={handleSubmitLogin}>
                <div>
                  <label
                    htmlFor="loginEmail"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="loginEmail"
                    name="loginEmail"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="loginPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="loginPassword"
                    name="loginPassword"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="password"
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <label className="custom-checkbox">
                      <input type="checkbox" />
                      <span className="checkmark"></span>
                    </label>
                    <span className="ml-2 text-sm text-gray-700">
                      Remember me
                    </span>
                  </div>
                  <a href="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-3 font-medium rounded-button whitespace-nowrap hover:bg-primary/90 transition"
                >
                  Sign In
                </button>
              </form>
              <p className="text-center text-gray-600 mt-6">
                Don't have an account?{" "}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-primary hover:underline"
                >
                  Register
                </button>
              </p>
            </div>
          ) : (
            <div id="registerForm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Create Account
                </h2>
                <button
                  onClick={handleClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="ri-close-line ri-lg"></i>
                </button>
              </div>
              <div className="space-y-4 mb-6">
                <button className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 px-4 text-gray-700 font-medium hover:bg-gray-50 transition rounded-button whitespace-nowrap">
                  <i className="ri-google-fill text-red-500"></i>
                  Continue with Google
                </button>
                <button className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 px-4 text-gray-700 font-medium hover:bg-gray-50 transition rounded-button whitespace-nowrap">
                  <i className="ri-facebook-fill text-blue-600"></i>
                  Continue with Facebook
                </button>
              </div>
              <div className="relative flex items-center gap-2 mb-6">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="text-gray-500 text-sm">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              <form className="space-y-4" onSubmit={handleSubmitRegister}>
                <div>
                  <label
                    htmlFor="registerName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="registerName"
                    name="registerName"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Jane Doe"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="registerEmail"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="registerEmail"
                    name="registerEmail"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="registerPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="registerPassword"
                    name="registerPassword"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Password"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Password"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <label className="custom-checkbox">
                    <input
                      type="checkbox"
                      id="termsCheckbox"
                      name="termsCheckbox"
                    />
                    <span className="checkmark"></span>
                  </label>
                  <span className="ml-2 text-sm text-gray-700">
                    I agree to the{" "}
                    <a href="#" className="text-primary hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-3 font-medium rounded-button whitespace-nowrap hover:bg-primary/90 transition"
                >
                  Create Account
                </button>
              </form>
              <p className="text-center text-gray-600 mt-6">
                Already have an account?{" "}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-primary hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
