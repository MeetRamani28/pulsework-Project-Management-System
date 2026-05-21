import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronsLeft } from "../Icons/ChevronsLeft";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#090d16] text-white relative overflow-hidden px-4 py-8 sm:py-12 select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none z-0" />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] sm:bg-[size:40px_40px] pointer-events-none z-0" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center max-w-[340px] xs:max-w-[380px] sm:max-w-lg w-full my-auto flex flex-col items-center"
      >
        <div className="relative mb-6 sm:mb-8 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.08, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute text-[120px] xs:text-[150px] sm:text-[200px] font-black tracking-tighter text-indigo-500 font-sans pointer-events-none select-none blur-sm"
          >
            404
          </motion.div>

          <motion.h1
            initial={{ scale: 0.9, filter: "blur(4px)" }}
            animate={{ scale: 1, filter: "blur(0px)" }}
            transition={{ type: "spring", stiffness: 90, delay: 0.15 }}
            className="text-7xl xs:text-8xl sm:text-9xl font-black tracking-tight bg-gradient-to-b from-white via-slate-200 to-slate-500 bg-clip-text text-transparent drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] font-sans"
          >
            404
          </motion.h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-col items-center w-full"
        >
          <span className="px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-[10px] sm:text-xs font-semibold uppercase tracking-widest mb-4 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
            Error Code
          </span>

          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-100 tracking-tight px-2">
            Lost in the Grid?
          </h2>

          <p className="mt-3 text-xs sm:text-base text-slate-400 max-w-[280px] xs:max-w-xs sm:max-w-md mx-auto leading-relaxed">
            The destination you are trying to reach does not exist, has been
            permanently removed, or slipped into another dimension.
          </p>

          <Link
            to="/"
            className="mt-8 sm:mt-10 flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 text-white text-xs sm:text-sm font-bold shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.4)] hover:brightness-110 active:scale-[0.98] transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            <div className="transform group-hover:-translate-x-1 transition-transform duration-300 flex items-center shrink-0">
              <ChevronsLeft
                width={16}
                height={16}
                stroke="#fff"
                strokeWidth={2.5}
              />
            </div>
            <span className="tracking-wide">Return to Safe Zone</span>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute -top-40 -left-40 w-80 h-80 sm:w-[500px] sm:h-[500px] bg-blue-600 rounded-full opacity-[0.07] sm:opacity-[0.1] blur-[100px] pointer-events-none z-0"
        animate={{ scale: [1, 1.15, 1], y: [0, 30, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 w-80 h-80 sm:w-[500px] sm:h-[500px] bg-indigo-600 rounded-full opacity-[0.07] sm:opacity-[0.1] blur-[100px] pointer-events-none z-0"
        animate={{ scale: [1, 1.15, 1], x: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
      />
    </div>
  );
};

export default NotFound;
