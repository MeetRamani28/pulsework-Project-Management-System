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
    (state: RootState) => state.auth,
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
    const isEmail = emailRegex.test(credentials.identifier.trim());

    const payload: { email?: string; username?: string; password: string } = {
      password: credentials.password,
      ...(isEmail
        ? { email: credentials.identifier.trim() }
        : { username: credentials.identifier.trim() }),
    };
    dispatch(loginUser(payload));
  };

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
              className="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg border border-red-400 text-xs sm:text-sm max-w-[280px] sm:max-w-xs mx-auto text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      ));

      setCredentials((prev) => ({ ...prev, password: "" }));

      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (user) {
      toast.custom(
        (t) => (
          <AnimatePresence>
            {t.visible && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg border border-green-400 text-xs sm:text-sm max-w-[280px] sm:max-w-xs mx-auto text-center"
              >
                Welcome back, {user.name}! 🎉
              </motion.div>
            )}
          </AnimatePresence>
        ),
        { duration: 3000 },
      );

      setCredentials({ identifier: "", password: "" });

      if (user.roles?.includes("admin")) navigate("/admin");
      else if (user.roles?.includes("manager")) navigate("/manager");
      else navigate("/employee");
    }
  }, [user, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-blue-700 via-indigo-700 to-blue-900 overflow-y-auto px-4 py-8 sm:py-12">
      <Toaster position="bottom-right" reverseOrder={false} />

      <div className="absolute inset-0 select-none pointer-events-none z-0">
        <img
          src="/images/background Image.png"
          alt="PulseWork Background"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm" />
      </div>

      <div className="w-full flex flex-col items-center gap-6 sm:gap-8 z-10 my-auto">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center px-2 w-full max-w-md"
        >
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white flex items-center justify-center gap-2 drop-shadow-lg">
            <span className="bg-indigo-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg shadow-md text-xl sm:text-3xl">
              PW
            </span>
            PulseWork
          </h1>
          <p className="text-white/90 mt-1.5 sm:mt-3 text-xs sm:text-lg font-medium tracking-wide">
            Smart Workforce & Project Management
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="w-full max-w-[320px] xs:max-w-[350px] sm:max-w-[390px] rounded-2xl shadow-2xl border border-gray-200/20 backdrop-blur-lg bg-white/95 p-5 sm:p-7"
        >
          <h2 className="text-center text-xl sm:text-2xl font-bold text-blue-600 mb-5 sm:mb-6">
            Sign in to PulseWork
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
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
                className="w-full rounded-md border border-gray-300 p-2.5 sm:p-3 pr-10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 disabled:opacity-60"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 select-none pointer-events-none">
                <User width={18} height={18} stroke="blue" />
              </div>
            </div>

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
                className="w-full rounded-md border border-gray-300 p-2.5 sm:p-3 pr-10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1"
                disabled={loading}
              >
                {showPassword ? (
                  <LockOpen width={18} height={18} stroke="blue" />
                ) : (
                  <Lock width={18} height={18} stroke="blue" />
                )}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 sm:gap-2 pt-1">
              <label
                className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 cursor-pointer select-none self-start sm:self-auto"
                onClick={() => !loading && setRememberMe(!rememberMe)}
              >
                <motion.div
                  className={`flex h-4.5 w-4.5 sm:h-5 sm:w-5 items-center justify-center rounded border transition ${
                    rememberMe
                      ? "bg-indigo-600 border-indigo-600"
                      : "border-gray-300 bg-white"
                  }`}
                  whileTap={{ scale: 0.9 }}
                >
                  {rememberMe && <Check width={12} height={12} stroke="#fff" />}
                </motion.div>
                Remember Me
              </label>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-md bg-indigo-600 w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-medium text-white shadow hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition"
                disabled={loading}
              >
                {loading && (
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin shrink-0" />
                )}
                Sign In
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
