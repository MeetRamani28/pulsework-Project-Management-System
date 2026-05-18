import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import { loginUser, clearAuthError } from "../Reducers/AuthReducers";
import { User } from "../Icons/User";
import { Lock } from "../Icons/Lock";
import { LockOpen } from "../Icons/LockOpen";
import { Check } from "../Icons/Check";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const AuthPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector(
    (state: RootState) => state.auth
  );

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [credentials, setCredentials] = useState({
    identifier: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(credentials.identifier);

    const payload: { email?: string; username?: string; password: string } = {
      password: credentials.password,
      ...(isEmail
        ? { email: credentials.identifier }
        : { username: credentials.identifier }),
    };
    dispatch(loginUser(payload));
  };

  // 🔴 Error Toast
  useEffect(() => {
    if (error) {
      toast.custom((t) => (
        <AnimatePresence>
          {t.visible && (
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg border border-red-400"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      ));

      // ❌ Reset inputs on error
      setCredentials({ identifier: "", password: "" });
    }
  }, [error]);

  // ✅ Success Toast
  useEffect(() => {
    if (user) {
      toast(
        <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg border border-green-400">
          Welcome back, {user.name}!
        </div>,
        { duration: 3000 }
      );

      setCredentials({ identifier: "", password: "" });

      if (user.roles?.includes("admin")) navigate("/admin");
      else if (user.roles?.includes("manager")) navigate("/manager");
      else navigate("/employee");
    }
  }, [user, navigate]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-700 via-indigo-700 to-blue-900">
      {/* Toaster for custom messages */}
      <Toaster position="bottom-right" />

      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/images/background Image.png"
          alt="PulseWork Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm" />
      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="absolute top-[8%] text-center"
      >
        <h1 className="text-4xl font-extrabold text-white flex items-center justify-center gap-2 drop-shadow-lg">
          <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg shadow-md">
            PW
          </span>
          PulseWork
        </h1>
        <p className="text-white/90 mt-3 text-lg font-medium">
          Smart Workforce & Project Management
        </p>
      </motion.div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="w-[380px] rounded-2xl shadow-2xl border border-gray-200/20 backdrop-blur-lg bg-white/95 p-6"
      >
        <h2 className="text-center text-2xl font-bold text-blue-600 mb-6">
          Sign in to PulseWork
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="relative">
            <input
              type="text"
              placeholder="Email or Username"
              required
              disabled={loading}
              value={credentials.identifier}
              onChange={(e) =>
                setCredentials({ ...credentials, identifier: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 p-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <User width={20} height={20} stroke="blue" />
            </div>
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              disabled={loading}
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 p-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <LockOpen width={20} height={20} stroke="blue" />
              ) : (
                <Lock width={20} height={20} stroke="blue" />
              )}
            </button>
          </div>

          {/* Remember me + Sign in */}
          <div className="flex items-center justify-between">
            <label
              className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none"
              onClick={() => setRememberMe(!rememberMe)}
            >
              <motion.div
                className={`flex h-5 w-5 items-center justify-center rounded border transition ${
                  rememberMe
                    ? "bg-indigo-600 border-indigo-600"
                    : "border-gray-300 bg-white"
                }`}
                whileTap={{ scale: 0.9 }}
              >
                {rememberMe && <Check width={16} height={16} stroke="#fff" />}
              </motion.div>
              Remember Me
            </label>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign In
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AuthPage;
