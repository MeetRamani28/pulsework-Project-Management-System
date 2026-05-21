import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  getAllTasks,
  deleteTask,
  createTask,
  updateTask,
  clearTaskError,
  clearTaskSuccess,
} from "../../Reducers/TaskReducers";
import type { Task } from "../../Reducers/TaskReducers";
import { Loader2, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle } from "../../Icons/DashboardIcons";
import { getAllProjects } from "../../Reducers/ProjectReducers";
import { getAllUsers } from "../../Reducers/UserReducers";
import { Delete } from "../../Icons/Delete";
import { EditAnimatedSquare } from "../../Icons/EditAnimated";
import toast from "react-hot-toast";
import { CustomDropdown } from "../../components/atoms/CustomDropdown";
import { User } from "../../Icons/User";
import { Calendar1 } from "../../Icons/Calender1";
import { ProjectIcon } from "../../Icons/SidebarIcon";

interface TaskForm {
  title: string;
  description: string;
  status: "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  deadline: string;
  project: string;
  assignedTo: string;
}

const defaultForm: TaskForm = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  deadline: "",
  project: "",
  assignedTo: "",
};

const AdminTasks: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    tasks,
    loading: tasksLoading,
    error,
    success,
  } = useSelector((state: RootState) => state.tasks);
  const { projects } = useSelector((state: RootState) => state.projects);
  const { users } = useSelector((state: RootState) => state.users);

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [form, setForm] = useState<TaskForm>(defaultForm);

  // ✅ પ્રોડક્શન સિક્યોરિટી માટે કસ્ટમ પોપઅપ કંટ્રોલ સ્ટેટ્સ
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isDeletingLocal, setIsDeletingLocal] = useState(false);

  // Fetch tasks, users, projects initially
  useEffect(() => {
    dispatch(getAllTasks());
    dispatch(getAllProjects());
    dispatch(getAllUsers());
  }, [dispatch]);

  // Handle toast notifications
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearTaskError());
      setIsDeletingLocal(false);
    }

    if (success) {
      if (taskToDelete) {
        toast.success("Task purged successfully 🗑️");
        setTaskToDelete(null);
        setIsDeletingLocal(false);
      } else {
        toast.success(
          editMode
            ? "Task records updated ✨"
            : "New task deployed successfully 🚀",
        );
        setShowForm(false);
        setEditMode(false);
        setForm(defaultForm);
      }
      dispatch(clearTaskSuccess());
    }
  }, [error, success, dispatch, editMode, taskToDelete]);

  // Create or update task
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Task title is required!");
    if (!form.project) return toast.error("A task must belong to a project!");
    if (!form.assignedTo)
      return toast.error("Please assign the task to a user!");

    if (editMode && currentId) {
      dispatch(updateTask({ id: currentId, updates: form }));
    } else {
      dispatch(createTask(form));
    }
  };

  // Safe delete handler
  const confirmDelete = async () => {
    if (taskToDelete) {
      setIsDeletingLocal(true);
      await dispatch(deleteTask(taskToDelete));
    }
  };

  // Edit task setup
  const handleEdit = (task: Task) => {
    setCurrentId(task._id);

    const projectId =
      typeof task.project === "string" ? task.project : task.project?._id || "";
    const assignedId =
      typeof task.assignedTo === "string"
        ? task.assignedTo
        : task.assignedTo?._id || "";

    setForm({
      title: task.title,
      description: task.description || "",
      status: task.status || "todo",
      priority: task.priority || "medium",
      deadline: task.deadline ? task.deadline.split("T")[0] : "",
      project: projectId,
      assignedTo: assignedId,
    });

    setEditMode(true);
    setShowForm(true);
  };

  return (
    <div className="p-4 sm:p-6 bg-slate-50/50 min-h-screen">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Task Backlogs</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Allocate and audit workforce task structures
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditMode(false);
            setForm(defaultForm);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition active:scale-95 self-start sm:self-auto w-full sm:w-auto"
        >
          <PlusCircle stroke="white" height={18} /> <span>Add Task</span>
        </button>
      </div>

      {/* Sync Spinner loader */}
      {tasksLoading && !showForm && !taskToDelete && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-sm font-medium">
          <Loader2 className="animate-spin text-blue-600 w-8 h-8 mb-2" />
          <span>Restructuring distributed pipelines...</span>
        </div>
      )}

      {/* Task Cards Inventory Matrix */}
      {!tasksLoading && tasks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tasks.map((t: Task) => (
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
                  {t.description || "No specific workload logs submitted."}
                </p>

                {/* Metadata Layers */}
                <div className="flex flex-col gap-2.5 text-xs font-semibold text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <ProjectIcon
                      height={16}
                      width={14}
                      stroke="#64748b"
                      className="shrink-0"
                    />
                    <span className="truncate">
                      Project:{" "}
                      <strong className="text-slate-800 font-bold">
                        {typeof t.project === "string"
                          ? projects.find((p) => p._id === t.project)?.name ||
                            "Unknown Link"
                          : t.project?.name || "Unknown Link"}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User
                      height={16}
                      width={14}
                      stroke="#64748b"
                      className="shrink-0"
                    />
                    <span className="truncate">
                      Operator:{" "}
                      <strong className="text-slate-800 font-bold">
                        {t.assignedTo?.name || "Unassigned"}
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
                      Timeline:{" "}
                      <strong className="text-slate-800 font-bold">
                        {t.deadline
                          ? new Date(t.deadline).toLocaleDateString()
                          : "N/A"}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Tags + Execution Controls */}
              <div className="flex items-center justify-between border-t border-slate-50 mt-4 pt-3">
                <div className="flex gap-1.5">
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                      t.status === "completed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200/40"
                        : t.status === "in-progress"
                          ? "bg-amber-50 text-amber-700 border-amber-200/40"
                          : "bg-slate-50 text-slate-600 border-slate-200/40"
                    }`}
                  >
                    {t.status}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                      t.priority === "high"
                        ? "bg-rose-50 text-rose-700 border-rose-200/40"
                        : t.priority === "medium"
                          ? "bg-blue-50 text-blue-700 border-blue-200/40"
                          : "bg-slate-50 text-slate-600 border-slate-200/40"
                    }`}
                  >
                    {t.priority}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(t)}
                    className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-600 transition"
                    aria-label="Edit task"
                  >
                    <EditAnimatedSquare />
                  </button>
                  <button
                    onClick={() => setTaskToDelete(t._id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                    aria-label="Delete task"
                  >
                    <Delete height={18} stroke="currentColor" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty Fallback Block */}
      {!tasksLoading && tasks.length === 0 && (
        <div className="text-center bg-white border border-dashed rounded-2xl p-12 text-slate-400 italic text-sm">
          No task arrays indexed inside this database view.
        </div>
      )}

      {/* ================= CONTROLS MODALS (AnimatePresence) ================= */}
      <AnimatePresence>
        {/* Create/Edit Interactive Modal Container */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !tasksLoading && setShowForm(false)}
            />
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg z-10 flex flex-col max-h-[85vh]"
            >
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                disabled={tasksLoading}
              >
                <X size={18} />
              </button>

              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">
                  {editMode
                    ? "Modify Workspace Context"
                    : "Initialize Workspace Task"}
                </h2>
              </div>

              {/* Form Content Panel - Scroll Configuration fixed safely for drop-downs */}
              <form
                onSubmit={handleFormSubmit}
                className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium"
                    required
                    disabled={tasksLoading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                    Workload Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium resize-none"
                    rows={3}
                    disabled={tasksLoading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                    Parent Project Stream
                  </label>
                  <CustomDropdown
                    options={projects.map((p) => ({
                      label: p.name,
                      value: p._id,
                    }))}
                    selected={form.project}
                    onSelect={(value) => setForm({ ...form, project: value })}
                    placeholder="Select Base Pipeline"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                    Assigned Technician
                  </label>
                  <CustomDropdown
                    options={users
                      .filter((u) => u.roles === "employee")
                      .map((u) => ({ label: u.name, value: u._id }))}
                    selected={form.assignedTo}
                    onSelect={(value) =>
                      setForm({ ...form, assignedTo: value })
                    }
                    placeholder="Select Responsible Operator"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                    Lifecycle Phase
                  </label>
                  <CustomDropdown
                    options={[
                      { label: "Todo Backlog", value: "todo" },
                      { label: "In Active Progress", value: "in-progress" },
                      { label: "Task Concluded", value: "completed" },
                    ]}
                    selected={form.status}
                    onSelect={(value) =>
                      setForm({ ...form, status: value as TaskForm["status"] })
                    }
                    placeholder="Select Status Stage"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                    Urgency Index (Priority)
                  </label>
                  <CustomDropdown
                    options={[
                      { label: "Low Priority", value: "low" },
                      { label: "Medium Routine", value: "medium" },
                      { label: "High Escalation", value: "high" },
                    ]}
                    selected={form.priority}
                    onSelect={(value) =>
                      setForm({
                        ...form,
                        priority: value as TaskForm["priority"],
                      })
                    }
                    placeholder="Select Critical Tier"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                    Target Deadline
                  </label>
                  <input
                    type="date"
                    value={form.deadline || ""}
                    onChange={(e) =>
                      setForm({ ...form, deadline: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium"
                    disabled={tasksLoading}
                  />
                </div>
              </form>

              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
                  disabled={tasksLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleFormSubmit}
                  className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white min-w-[80px] shadow-sm transition active:scale-95"
                  disabled={tasksLoading}
                >
                  {tasksLoading ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : editMode ? (
                    "Update Node"
                  ) : (
                    "Deploy Task"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ✅ કસ્ટમ એનિમેટેડ પોપ-અપ મોડલ (Vercel અને પ્રોડક્શન-ફ્રેન્ડલી ફિક્સ) */}
        {taskToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !isDeletingLocal && setTaskToDelete(null)}
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
                Terminate Task Array
              </h3>
              <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
                Are you absolutely sure you want to delete this task record?
                This structural clean cannot be restored.
              </p>
              <div className="flex gap-2.5 mt-5 border-t border-slate-50 pt-4">
                <button
                  onClick={() => setTaskToDelete(null)}
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

export default AdminTasks;
