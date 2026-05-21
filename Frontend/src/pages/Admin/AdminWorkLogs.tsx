import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import type { TimeLog } from "../../Reducers/TimeLogsReducers";
import {
  pauseLog,
  resumeLog,
  stopLog,
  deleteLog,
  getAllLogs,
  clearTimeLogError,
  clearTimeLogSuccess,
} from "../../Reducers/TimeLogsReducers";
import {
  Loader2,
  Play,
  Pause,
  Square as Stop,
  Trash2,
  AlertTriangle,
  Search,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const AdminWorkLogs: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { logs, loading, error, success } = useSelector(
    (state: RootState) => state.workLogs,
  );

  const [filter, setFilter] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [logToDelete, setLogToDelete] = useState<string | null>(null);
  const [isDeletingLocal, setIsDeletingLocal] = useState(false);

  const handlePause = async (logId: string) => {
    setActionLoading(logId);
    const result = await dispatch(pauseLog(logId));
    setActionLoading(null);
    if (pauseLog.fulfilled.match(result)) {
      toast.success("Task execution paused ✨");
    } else {
      toast.error((result.payload as string) || "Failed to pause task");
    }
  };

  const handleResume = async (logId: string) => {
    setActionLoading(logId);
    const result = await dispatch(resumeLog(logId));
    setActionLoading(null);
    if (resumeLog.fulfilled.match(result)) {
      toast.success("Task execution resumed 🚀");
    } else {
      toast.error((result.payload as string) || "Failed to resume task");
    }
  };

  const handleStop = async (logId: string) => {
    setActionLoading(logId);
    const result = await dispatch(stopLog(logId));
    setActionLoading(null);
    if (stopLog.fulfilled.match(result)) {
      toast.success("Task clock stopped successfully ⏱️");
    } else {
      toast.error((result.payload as string) || "Failed to stop task");
    }
  };

  const handleRestart = async (logId: string) => {
    setActionLoading(logId);
    const result = await dispatch(resumeLog(logId));
    setActionLoading(null);
    if (resumeLog.fulfilled.match(result)) {
      toast.success("Task clock re-initialized 🔄");
    } else {
      toast.error((result.payload as string) || "Failed to restart task");
    }
  };

  const confirmDelete = async () => {
    if (logToDelete) {
      setIsDeletingLocal(true);
      const result = await dispatch(deleteLog(logToDelete));
      setIsDeletingLocal(false);
      setLogToDelete(null);

      if (deleteLog.fulfilled.match(result)) {
        toast.success("Work log erased successfully 🗑️");
      } else {
        toast.error((result.payload as string) || "Failed to delete task");
      }
    }
  };

  useEffect(() => {
    dispatch(getAllLogs());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearTimeLogError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (success) {
      dispatch(clearTimeLogSuccess());
    }
  }, [success, dispatch]);

  const filteredLogs = logs.filter(
    (log) =>
      (log.task?.title ?? "").toLowerCase().includes(filter.toLowerCase()) ||
      (log.project?.name ?? "").toLowerCase().includes(filter.toLowerCase()) ||
      (log.user?.name ?? "").toLowerCase().includes(filter.toLowerCase()),
  );

  if (loading && !logToDelete)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-sm font-medium min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600 w-8 h-8 mb-2" />
        <span>Synchronizing temporal engine arrays...</span>
      </div>
    );

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50/50 min-h-screen">
      <Toaster position="bottom-right" />

      <div>
        <h1 className="text-2xl font-black text-slate-800">
          Time Analytics Registry
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Real-time surveillance and overrides on active session workloads
        </p>
      </div>

      <div className="relative w-full md:w-1/2 flex items-center bg-white border border-slate-200 rounded-xl px-3 focus-within:border-blue-500/50 transition shadow-sm">
        <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        <input
          type="text"
          placeholder="Filter logs by task, project or operator identifier..."
          className="w-full bg-transparent text-sm py-2.5 px-2 outline-none text-slate-800 placeholder-slate-400 font-medium"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {filteredLogs.length === 0 ? (
        <div className="bg-white border border-dashed rounded-2xl p-12 text-slate-400 text-center italic text-sm shadow-sm">
          No records matching index parameters found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 text-left">Task Node</th>
                <th className="py-3 px-4 text-left">Project Scope</th>
                <th className="py-3 px-4 text-left">Operator Allocation</th>
                <th className="py-3 px-4 text-left">Start Time</th>
                <th className="py-3 px-4 text-left">End Bound</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-center">Runtime Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-slate-700 font-medium">
              <AnimatePresence>
                {filteredLogs.map((log: TimeLog) => (
                  <motion.tr
                    key={log._id}
                    className="hover:bg-slate-50/50 transition duration-150"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-800 max-w-[180px] truncate">
                      {log.task?.title ?? "—"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[150px] truncate">
                      {log.project?.name ?? "—"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-semibold truncate">
                      {log.user?.name ?? "—"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs font-mono">
                      {log.startTime
                        ? new Date(log.startTime).toLocaleString()
                        : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs font-mono">
                      {log.endTime
                        ? new Date(log.endTime).toLocaleString()
                        : "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      {log.status === "running" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/30 animate-pulse">
                          Running
                        </span>
                      )}
                      {log.status === "paused" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/30">
                          Paused
                        </span>
                      )}
                      {log.status === "stopped" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/30">
                          Stopped
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 flex justify-center gap-1.5 flex-wrap min-w-[140px]">
                      {log.status === "running" && (
                        <>
                          <ActionButton
                            loading={actionLoading === log._id}
                            onClick={() => handlePause(log._id)}
                            color="yellow"
                            icon={<Pause size={14} />}
                            text="Pause"
                          />
                          <ActionButton
                            loading={actionLoading === log._id}
                            onClick={() => handleStop(log._id)}
                            color="red"
                            icon={<Stop size={14} />}
                            text="Stop"
                          />
                        </>
                      )}

                      {log.status === "paused" && (
                        <>
                          <ActionButton
                            loading={actionLoading === log._id}
                            onClick={() => handleResume(log._id)}
                            color="green"
                            icon={<Play size={14} />}
                            text="Resume"
                          />
                          <ActionButton
                            loading={actionLoading === log._id}
                            onClick={() => handleStop(log._id)}
                            color="red"
                            icon={<Stop size={14} />}
                            text="Stop"
                          />
                        </>
                      )}

                      {log.status === "stopped" && (
                        <ActionButton
                          loading={actionLoading === log._id}
                          onClick={() => handleRestart(log._id)}
                          color="green"
                          icon={<Play size={14} />}
                          text="Resume"
                        />
                      )}

                      <ActionButton
                        loading={actionLoading === log._id}
                        onClick={() => setLogToDelete(log._id)}
                        color="red-light"
                        icon={<Trash2 size={14} />}
                        text="Delete"
                      />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
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
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm relative z-10 text-center"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-3 border border-red-100">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Purge Operational Log
              </h3>
              <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
                Are you absolutely certain you want to destroy this time
                tracking record? This structural wipe out cannot be reversed.
              </p>
              <div className="flex gap-2.5 mt-5 border-t border-slate-50 pt-4">
                <button
                  onClick={() => setLogToDelete(null)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                  disabled={isDeletingLocal}
                >
                  Dismiss
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95"
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

export default AdminWorkLogs;

interface ActionButtonProps {
  loading: boolean;
  onClick: () => void;
  color: "green" | "yellow" | "red" | "red-light";
  icon: React.ReactNode;
  text: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  loading,
  onClick,
  color,
  icon,
  text,
}) => {
  const colors = {
    green:
      "bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 border border-emerald-200/30",
    yellow:
      "bg-amber-50 text-amber-700 hover:bg-amber-100/80 border border-amber-200/30",
    red: "bg-rose-50 text-rose-700 hover:bg-rose-100/80 border border-rose-200/30",
    "red-light":
      "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/30",
  };
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1 font-bold text-xs shadow-sm transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${colors[color]}`}
    >
      {loading ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : icon}
      <span className="hidden sm:block">{text}</span>
    </button>
  );
};
