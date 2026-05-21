import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, easeOut } from "framer-motion";
import type { RootState } from "../../store/store";
import {
  DashboardIcon,
  ProjectIcon,
  TasksIcon,
  ProfileIcon,
} from "../../Icons/SidebarIcon";
import { Calendar1 } from "../../Icons/Calender1";

type MenuItem = {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
};

const menuItems: MenuItem[] = [
  { name: "Dashboard", path: "", icon: DashboardIcon },
  { name: "Project", path: "project", icon: ProjectIcon },
  { name: "Tasks", path: "tasks", icon: TasksIcon },
  { name: "Users", path: "user", icon: ProfileIcon, roles: ["admin"] },
  {
    name: "Work Logs",
    path: "work-logs",
    icon: Calendar1,
    roles: ["admin", "manager"],
  },
  {
    name: "Work Logs",
    path: "work-logs",
    icon: Calendar1,
    roles: ["employee"],
  },
  { name: "Profile", path: "profile", icon: ProfileIcon },
];

const sidebarVariants = {
  hidden: { x: -260, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: easeOut },
  },
};

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentUser } = useSelector((state: RootState) => state.users);
  const role = currentUser?.roles?.toLowerCase() || "employee";

  return (
    <motion.div
      className="w-64 max-w-[260px] h-full bg-white/95 backdrop-blur-md border-r border-blue-200/60 shadow-lg flex flex-col overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
    >
      <div className="flex flex-col h-full min-h-0">
        <motion.div
          className="p-5 sm:p-6 border-b border-blue-200/60 flex items-center shrink-0 w-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 mr-3 shrink-0">
            {currentUser?.profilePicture ? (
              <motion.img
                src={`${import.meta.env.VITE_API_URL}/${
                  currentUser.profilePicture
                }`}
                alt={currentUser.name || "Profile"}
                className="w-full h-full rounded-full object-cover shadow-md border-2 border-white"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              />
            ) : (
              <motion.div
                className="w-full h-full bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-full flex items-center justify-center shadow-md"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              >
                <span className="text-white text-base sm:text-lg font-bold">
                  {currentUser?.name?.[0]?.toUpperCase() || "A"}
                </span>
              </motion.div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent truncate">
              PulseWork&apos;s
            </h2>
            <p className="text-xs sm:text-sm text-blue-500 capitalize font-medium truncate">
              {user?.roles?.toLowerCase()}
            </p>
          </div>
        </motion.div>

        <motion.nav
          className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 custom-scrollbar min-h-0"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          <ul className="space-y-1.5">
            {menuItems
              .filter((item) => !item.roles || item.roles.includes(role))
              .map((item) => {
                const Icon = item.icon;
                const fullPath = item.path
                  ? `/${role}/${item.path}`
                  : `/${role}`;

                const isActive =
                  location.pathname === fullPath ||
                  (item.path === "" && location.pathname === `/${role}/`);

                return (
                  <motion.li key={item.name} variants={itemVariants}>
                    <NavLink
                      to={fullPath}
                      end={item.path === ""}
                      className="relative flex items-center space-x-3 px-3.5 py-2.5 sm:py-3 rounded-xl group overflow-hidden select-none"
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-bg"
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200/60 shadow-sm"
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 28,
                          }}
                        />
                      )}

                      <Icon
                        className={`relative z-10 w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform shrink-0 ${
                          isActive
                            ? "text-blue-700 scale-105"
                            : "text-blue-400 group-hover:text-blue-600"
                        }`}
                      />

                      <span
                        className={`relative z-10 text-xs sm:text-sm font-medium transition-colors truncate ${
                          isActive
                            ? "text-blue-700 font-semibold"
                            : "text-blue-600 group-hover:text-blue-800"
                        }`}
                      >
                        {item.name}
                      </span>
                    </NavLink>
                  </motion.li>
                );
              })}
          </ul>
        </motion.nav>

        <motion.div
          className="p-4 border-t border-blue-200/60 shrink-0 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <div className="text-[10px] sm:text-xs text-blue-400 text-center tracking-wide">
            © 2026 PulseWork&apos;s
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
