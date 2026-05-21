import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  getAllTasks,
  updateTask,
  clearTaskError,
  clearTaskSuccess,
} from "../../Reducers/TaskReducers";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { ProjectIcon } from "../../Icons/SidebarIcon";
import { Calendar1 } from "../../Icons/Calender1";
import toast, { Toaster } from "react-hot-toast";
import { CustomDropdown } from "../../components/atoms/CustomDropdown";

type TaskStatus = "todo" | "in-progress" | "completed";

const EmployeeTasks: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading, error, success } = useSelector(
    (state: RootState) => state.tasks,
  );
  const { projects } = useSelector((state: RootState) => state.projects);
  const { currentUser } = useSelector((state: RootState) => state.users);

  useEffect(() => {
    dispatch(getAllTasks());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearTaskError());
    }
    if (success) {
      toast.success("Task pipeline stage updated ✨");
      dispatch(clearTaskSuccess());
    }
  }, [error, success, dispatch]);

  const myTasks = tasks.filter((t) => t.assignedTo?._id === currentUser?._id);

  const handleStatusChange = (id: string, newStatus: TaskStatus) => {
    dispatch(updateTask({ id, updates: { status: newStatus } }));
  };

  return (
    <div className="p-4 sm:p-6 bg-slate-50/50 min-h-screen">
      <Toaster position="bottom-right" />

      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800">My Task Vectors</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Audit and transition execution states of your assigned workloads
        </p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-sm font-medium">
          <Loader2 className="animate-spin text-blue-600 w-8 h-8 mb-2" />
          <span>Synchronizing workload schemas...</span>
        </div>
      )}

      {!loading && myTasks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {myTasks.map((t) => (
            <motion.div
              key={t._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-200"
            >
              <div>
                <h2 className="text-base font-bold text-slate-800 mb-1 truncate">
                  {t.title}
                </h2>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {t.description ||
                    "No workload descriptions appended to this target node."}
                </p>

                <div className="flex flex-col gap-2.5 text-xs font-semibold text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <ProjectIcon
                      height={16}
                      width={14}
                      stroke="#64748b"
                      className="shrink-0"
                    />
                    <span className="truncate">
                      Pipeline Link:{" "}
                      <strong className="text-slate-800 font-bold">
                        {typeof t.project === "string"
                          ? projects.find((p) => p._id === t.project)?.name ||
                            "Unknown Context"
                          : t.project?.name || "Unknown Context"}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar1
                      height={16}
                      width={14}
                      stroke="#64748b"
                      className="shrink-0"
                    />
                    <span>
                      Target Deadline:{" "}
                      <strong className="text-slate-800 font-bold">
                        {t.deadline
                          ? new Date(t.deadline).toLocaleDateString()
                          : "No Deadline Bound"}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-50">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 pl-0.5">
                  Transition State Layer
                </label>
                <CustomDropdown
                  options={[
                    { label: "Todo Backlog", value: "todo" },
                    { label: "In Active Progress", value: "in-progress" },
                    { label: "Task Concluded", value: "completed" },
                  ]}
                  selected={t.status || ""}
                  onSelect={(value) =>
                    handleStatusChange(t._id, value as TaskStatus)
                  }
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && myTasks.length === 0 && (
        <div className="text-center bg-white border border-dashed rounded-2xl p-12 text-slate-400 italic text-sm shadow-sm">
          Excellent! No active assignment structures mapped to your profile core
          🎉
        </div>
      )}
    </div>
  );
};

export default EmployeeTasks;
