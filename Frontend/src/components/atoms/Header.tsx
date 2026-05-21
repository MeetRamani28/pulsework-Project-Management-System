"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Bell, Search, LogOut } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import type { RootState, AppDispatch } from "../../store/store";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../Reducers/AuthReducers";
import { getCurrentUser } from "../../Reducers/UserReducers";
import { clearLastCompletedProject } from "../../Reducers/ProjectReducers";
import { clearLastCompletedTask } from "../../Reducers/TaskReducers";
import {
  getUserNotifications,
  markNotificationRead,
} from "../../Reducers/NotificationReducers";
import type { Notification } from "../../Reducers/NotificationReducers";

interface SearchItem {
  id: string;
  type: "task" | "project" | "user";
  name: string;
}

const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { currentUser } = useSelector((state: RootState) => state.users);
  const { lastCompletedTask, tasks } = useSelector(
    (state: RootState) => state.tasks,
  );
  const { lastCompletedProject, projects } = useSelector(
    (state: RootState) => state.projects,
  );
  const { notifications } = useSelector(
    (state: RootState) => state.notifications,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!currentUser) dispatch(getCurrentUser());
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    dispatch(getUserNotifications(currentUser._id));

    const interval = setInterval(() => {
      dispatch(getUserNotifications(currentUser._id));
    }, 10000);

    return () => clearInterval(interval);
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (!currentUser || currentUser.roles?.toLowerCase() !== "manager") return;

    if (lastCompletedTask || lastCompletedProject) {
      dispatch(clearLastCompletedTask());
      dispatch(clearLastCompletedProject());
    }
  }, [lastCompletedTask, lastCompletedProject, currentUser, dispatch]);

  const role = currentUser?.roles?.toLowerCase() || "employee";

  const allItems: SearchItem[] = useMemo(() => {
    if (!currentUser) return [];

    let taskItems: SearchItem[] = [];
    let projectItems: SearchItem[] = [];
    let userItems: SearchItem[] = [];

    if (role === "admin") {
      taskItems = tasks.map((t) => ({
        id: t._id,
        type: "task" as const,
        name: t.title,
      }));

      projectItems = projects.map((p) => ({
        id: p._id,
        type: "project" as const,
        name: p.name,
      }));

      userItems = [
        ...projects
          .flatMap((p) =>
            p.members?.map((m: string | { _id: string; name: string }) =>
              typeof m === "string"
                ? null
                : { id: m._id, type: "user" as const, name: m.name },
            ),
          )
          .filter(Boolean),
        { id: currentUser._id, type: "user" as const, name: currentUser.name },
      ] as SearchItem[];
    } else if (role === "manager") {
      const myProjects = projects.filter((p) =>
        typeof p.manager === "string"
          ? p.manager === currentUser._id
          : p.manager?._id === currentUser._id,
      );

      projectItems = myProjects.map((p) => ({
        id: p._id,
        type: "project" as const,
        name: p.name,
      }));

      const myProjectIds = myProjects.map((p) => p._id);

      taskItems = tasks
        .filter((t) =>
          typeof t.project === "string"
            ? myProjectIds.includes(t.project)
            : myProjectIds.includes(t.project?._id),
        )
        .map((t) => ({ id: t._id, type: "task" as const, name: t.title }));

      userItems = [
        { id: currentUser._id, type: "user" as const, name: currentUser.name },
      ];
    } else {
      const myProjects = projects.filter((p) =>
        p.members?.some((m) =>
          typeof m === "string"
            ? m === currentUser._id
            : m._id === currentUser._id,
        ),
      );

      projectItems = myProjects.map((p) => ({
        id: p._id,
        type: "project" as const,
        name: p.name,
      }));

      const myTasks = tasks.filter((t) => {
        if (!t.assignedTo) return false;
        return typeof t.assignedTo === "string"
          ? t.assignedTo === currentUser._id
          : t.assignedTo?._id === currentUser._id;
      });

      taskItems = myTasks.map((t) => ({
        id: t._id,
        type: "task" as const,
        name: t.title,
      }));

      userItems = [
        { id: currentUser._id, type: "user" as const, name: currentUser.name },
      ];
    }

    const unique = (arr: SearchItem[]) =>
      arr.filter(
        (v, i, a) =>
          a.findIndex((t) => t.id === v.id && t.type === v.type) === i,
      );

    return [
      ...unique(taskItems),
      ...unique(projectItems),
      ...unique(userItems),
    ];
  }, [tasks, projects, currentUser, role]);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return [];
    return allItems.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, allItems]);

  const handleSelectItem = (item: SearchItem) => {
    setSearchQuery("");
    switch (item.type) {
      case "task":
        navigate(`/${role}/tasks`);
        break;
      case "project":
        navigate(`/${role}/project`);
        break;
      case "user":
        navigate(`/${role}/profile`);
        break;
    }
  };

  const handleNotificationClick = (item: Notification) => {
    if (role === "manager") {
      if (item.task) navigate(`/manager/tasks`);
      if (item.project) navigate(`/manager/project`);
    } else {
      if (item.task) navigate(`/${role}/tasks`);
      if (item.project) navigate(`/${role}/project`);
    }

    if (!item.isRead) dispatch(markNotificationRead(item._id));
    setShowNotifications(false);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      localStorage.removeItem("readNotifications");
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead);

  return (
    <motion.header
      className="flex flex-col gap-4 md:flex-row items-center justify-between bg-white border-b px-4 sm:px-6 py-3 shadow-sm relative w-full"
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="w-full md:w-1/2 relative max-w-full">
        <motion.div
          className="flex items-center w-full px-3.5 py-2 border border-gray-200 rounded-lg shadow-sm bg-white focus-within:ring-2 focus-within:ring-blue-500"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 shrink-0" />
          <input
            type="text"
            placeholder="Search by task, project, or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ml-2 w-full bg-transparent outline-none text-xs sm:text-sm text-gray-700 placeholder-gray-400"
          />
        </motion.div>

        <AnimatePresence>
          {filteredItems.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {filteredItems.map((item) => (
                <motion.li
                  key={`${item.type}-${item.id}`}
                  className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-xs sm:text-sm text-gray-700 truncate"
                  whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.08)" }}
                  onClick={() => handleSelectItem(item)}
                >
                  <span className="font-semibold">{item.name}</span>{" "}
                  <span className="text-gray-400 text-[10px] sm:text-xs">
                    ({item.type})
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 sm:gap-6 shrink-0 border-t border-gray-50 md:border-none pt-2.5 md:pt-0">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications((prev) => !prev)}
            className="p-1 rounded-full hover:bg-gray-50 text-gray-600 hover:text-indigo-600 transition"
          >
            <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          {unreadNotifications.length > 0 && (
            <span className="absolute top-0 right-0 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-red-500 text-white text-[9px] sm:text-xs flex items-center justify-center pointer-events-none font-bold">
              {unreadNotifications.length}
            </span>
          )}

          <AnimatePresence>
            {showNotifications && unreadNotifications.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2.5 w-64 sm:w-72 bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto z-50 divide-y divide-gray-50"
              >
                {unreadNotifications.map((n) => (
                  <li
                    key={n._id}
                    onClick={() => handleNotificationClick(n)}
                    className={`px-4 py-3 cursor-pointer text-xs sm:text-sm text-gray-700 transition-colors ${
                      n.isRead ? "bg-gray-50/50" : "font-semibold bg-blue-50/60"
                    } hover:bg-blue-50`}
                  >
                    {n.message}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <motion.div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate max-w-[120px] sm:max-w-[160px]">
              {currentUser?.name || "Guest User"}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 capitalize font-medium">
              {currentUser?.roles || "No role"}
            </p>
          </div>

          {currentUser?.profilePicture ? (
            <motion.img
              src={`${import.meta.env.VITE_API_URL}/${currentUser.profilePicture}`}
              alt={currentUser.name || "Profile"}
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border border-gray-200 object-cover shrink-0"
            />
          ) : (
            <motion.img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                currentUser?.name || "Guest",
              )}&background=6366f1&color=fff`}
              alt="User Avatar"
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border border-gray-200 shrink-0"
            />
          )}

          <motion.button
            onClick={handleLogout}
            className="ml-1 flex items-center p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="h-4 w-4 sm:h-4 sm:w-4" />
          </motion.button>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;
