import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronsLeft } from "../Icons/ChevronsLeft";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-radial-gradient from-blue-900/40 via-transparent to-transparent opacity-70 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 text-center max-w-md w-full"
      >
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-10 shadow-2xl border border-white/10 flex flex-col items-center">
          <motion.h1
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
            className="text-6xl sm:text-7xl font-black drop-shadow-lg tracking-wider bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"
          >
            404
          </motion.h1>

          <h2 className="text-xl font-bold text-slate-200 mt-4">
            Page Not Found
          </h2>

          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xs sm:max-w-none">
            Oops! The page you’re looking for doesn’t exist or has been shifted.
          </p>

          <Link
            to="/"
            className="mt-8 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:opacity-95 active:scale-[0.98] transition-all duration-200 group"
          >
            <div className="transform group-hover:-translate-x-1 transition-transform duration-200 flex items-center">
              <ChevronsLeft width={18} height={18} stroke="#fff" />
            </div>
            <span>Back to Home</span>
          </Link>
        </div>
      </motion.div>

      <motion.div
        className="absolute -top-20 -left-20 sm:-top-40 sm:-left-40 w-72 h-72 sm:w-96 sm:h-96 bg-blue-500 rounded-full opacity-20 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.12, 1], y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 -right-20 sm:-bottom-40 sm:-right-40 w-72 h-72 sm:w-96 sm:h-96 bg-indigo-500 rounded-full opacity-20 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.15, 1], x: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      />
    </div>
  );
};

export default NotFound;
