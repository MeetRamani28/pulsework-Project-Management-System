import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  getAllLogs,
  deleteLog,
  clearTimeLogError,
  clearTimeLogSuccess,
  type TimeLog,
} from "../../Reducers/TimeLogsReducers";
import { getAllProjects } from "../../Reducers/ProjectReducers";
import { getAllTasks } from "../../Reducers/TaskReducers";
import { Loader2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Delete } from "../../Icons/Delete";
import toast, { Toaster } from "react-hot-toast";
import { Users } from "../../Icons/DashboardIcons";
import { Calendar1 } from "../../Icons/Calender1";
import { ProjectIcon } from "../../Icons/SidebarIcon";

const ManagerTimeLogs: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { logs, loading, error, success } = useSelector(
    (state: RootState) => state.workLogs,
  );
  const { projects } = useSelector((state: RootState) => state.projects);
  const { tasks } = useSelector((state: RootState) => state.tasks);
  const { currentUser } = useSelector((state: RootState) => state.users);

  const [logToDelete, setLogToDelete] = useState<string | null>(null);
  const [isDeletingLocal, setIsDeletingLocal] = useState(false);

  useEffect(() => {
    dispatch(getAllLogs());
    dispatch(getAllProjects());
    dispatch(getAllTasks());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearTimeLogError());
      setIsDeletingLocal(false);
    }
    if (success) {
      if (logToDelete) {
        toast.success("Work log erased successfully 🗑️");
        setLogToDelete(null);
        setIsDeletingLocal(false);
      }
      dispatch(clearTimeLogSuccess());
    }
  }, [error, success, dispatch, logToDelete]);

  const confirmDelete = async () => {
    if (logToDelete) {
      setIsDeletingLocal(true);
      dispatch(deleteLog(logToDelete));
    }
  };

  const managerLogs = logs.filter((log: TimeLog) => {
    const project = projects.find(
      (p) =>
        p._id ===
        (typeof log.project === "string" ? log.project : log.project?._id),
    );
    if (!project) return false;

    const managerId =
      typeof project.manager === "string"
        ? project.manager
        : project.manager?._id;

    const task = tasks.find(
      (t) =>
        t._id === (typeof log.task === "string" ? log.task : log.task?._id),
    );

    const taskProjectId =
      task &&
      (typeof task.project === "string" ? task.project : task.project?._id);

    return (
      log.user?._id === currentUser?._id ||
      managerId === currentUser?._id ||
      taskProjectId === project?._id
    );
  });

  return (
    <div className="p-3 sm:p-5 md:p-6 bg-slate-50/50 min-h-screen overflow-x-hidden">
      <Toaster position="bottom-right" />

      <div className="mb-6 w-full">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
          Manager Time Logs
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5 truncate">
          Audit and manage timeline entries submission for your projects
        </p>
      </div>

      {loading && !logToDelete && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-xs sm:text-sm font-medium w-full px-4">
          <Loader2 className="animate-spin text-blue-600 w-7 h-7 sm:w-8 sm:h-8 mb-2" />
          <span className="text-center">Synchronizing team work logs...</span>
        </div>
      )}

      {!loading && managerLogs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 w-full">
          {managerLogs.map((log: TimeLog) => (
            <motion.div
              key={log._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200/70 p-4 sm:p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-200 w-full min-w-0"
            >
              <div className="min-w-0 w-full">
                <h2 className="text-sm sm:text-base font-bold text-slate-800 mb-3 truncate">
                  {(() => {
                    const taskId =
                      typeof log.task === "string" ? log.task : log.task?._id;
                    const task = tasks.find((t) => t._id === taskId);
                    return task?.title || "No Task Assigned";
                  })()}
                </h2>

                <div className="flex flex-col gap-2.5 text-xs font-semibold text-slate-600 border-t border-slate-100 pt-3 w-full">
                  <div className="flex items-center gap-2 w-full min-w-0">
                    <ProjectIcon
                      height={14}
                      width={14}
                      stroke="#64748b"
                      className="shrink-0"
                    />
                    <span className="truncate text-[11px] sm:text-xs">
                      Project:{" "}
                      <strong className="text-slate-800 font-bold">
                        {(() => {
                          const projectId =
                            typeof log.project === "string"
                              ? log.project
                              : log.project?._id;
                          const project = projects.find(
                            (p) => p._id === projectId,
                          );
                          return project?.name || "Unknown Project";
                        })()}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 w-full min-w-0">
                    <Users
                      height={14}
                      width={14}
                      stroke="#64748b"
                      className="shrink-0"
                    />
                    <span className="truncate text-[11px] sm:text-xs">
                      Operator:{" "}
                      <strong className="text-slate-800 font-bold">
                        {log.user?.name || "—"}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 w-full min-w-0">
                    <Calendar1
                      height={14}
                      width={14}
                      stroke="#64748b"
                      className="shrink-0"
                    />
                    <span className="truncate text-[11px] sm:text-xs text-slate-500 font-medium">
                      Start:{" "}
                      <strong className="text-slate-700 font-mono text-[10px] sm:text-[11px]">
                        {log.startTime
                          ? new Date(log.startTime).toLocaleString()
                          : "N/A"}
                      </strong>
                    </span>
                  </div>
                  {log.endTime && (
                    <div className="flex items-center gap-2 w-full min-w-0">
                      <Calendar1
                        height={14}
                        width={14}
                        stroke="#64748b"
                        className="shrink-0"
                      />
                      <span className="truncate text-[11px] sm:text-xs text-slate-500 font-medium">
                        Stop:{" "}
                        <strong className="text-slate-700 font-mono text-[10px] sm:text-[11px]">
                          {new Date(log.endTime).toLocaleString()}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 mt-4 pt-2 w-full">
                <span
                  className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full border shrink-0 ${
                    log.status === "running"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200/40"
                      : log.status === "paused"
                        ? "bg-amber-50 text-amber-700 border-amber-200/40"
                        : "bg-slate-50 text-slate-600 border-slate-200/40"
                  }`}
                >
                  {log.status}
                </span>
                <button
                  type="button"
                  onClick={() => setLogToDelete(log._id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition shrink-0"
                  aria-label="Delete work log"
                >
                  <Delete height={16} stroke="currentColor" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && managerLogs.length === 0 && (
        <div className="text-center bg-white border border-dashed rounded-2xl p-8 sm:p-12 text-slate-400 italic text-xs sm:text-sm shadow-sm w-full">
          No time logs structured for your active project nodes.
        </div>
      )}

      <AnimatePresence>
        {logToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !isDeletingLocal && setLogToDelete(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 w-full max-w-[320px] xs:max-w-sm relative z-10 text-center"
            >
              <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-3 border border-red-100 shrink-0">
                <AlertTriangle size={22} />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                Confirm Deletion
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
                Are you absolutely sure you want to terminate this operational
                time log? This database sweep cannot be reversed.
              </p>
              <div className="flex gap-2 pt-4 mt-4 border-t border-slate-50 w-full">
                <button
                  type="button"
                  onClick={() => setLogToDelete(null)}
                  className="flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                  disabled={isDeletingLocal}
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95"
                  disabled={isDeletingLocal}
                >
                  {isDeletingLocal ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Confirm Purge"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManagerTimeLogs;
