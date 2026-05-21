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
import { getAllProjects } from "../../Reducers/ProjectReducers";
import { getAllUsers } from "../../Reducers/UserReducers";
import { Loader2, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Users } from "../../Icons/DashboardIcons";
import { Delete } from "../../Icons/Delete";
import { EditAnimatedSquare } from "../../Icons/EditAnimated";
import { CustomDropdown } from "../../components/atoms/CustomDropdown";
import toast from "react-hot-toast";
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

const ManagerTasks: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading, error, success } = useSelector(
    (state: RootState) => state.tasks,
  );
  const { projects } = useSelector((state: RootState) => state.projects);
  const { users, currentUser } = useSelector((state: RootState) => state.users);

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isDeletingLocal, setIsDeletingLocal] = useState(false);

  const [form, setForm] = useState<TaskForm>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    deadline: "",
    project: "",
    assignedTo: "",
  });

  useEffect(() => {
    dispatch(getAllTasks());
    dispatch(getAllProjects());
    dispatch(getAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearTaskError());
      setIsDeletingLocal(false);
    }

    if (success) {
      if (taskToDelete) {
        toast.success("Task deleted successfully 🗑️");
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
        setForm({
          title: "",
          description: "",
          status: "todo",
          priority: "medium",
          deadline: "",
          project: "",
          assignedTo: "",
        });
      }
      dispatch(clearTaskSuccess());
    }
  }, [error, success, dispatch, editMode, taskToDelete]);

  const handleSubmit = (e: React.FormEvent) => {
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

  const confirmDelete = async () => {
    if (taskToDelete) {
      setIsDeletingLocal(true);
      await dispatch(deleteTask(taskToDelete));
    }
  };

  const handleEdit = (task: Task) => {
    setCurrentId(task._id);
    const projectId =
      typeof task.project === "string" ? task.project : task.project?._id || "";
    const assignedId = task.assignedTo?._id || "";

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

  const resetForm = () => {
    setShowForm(false);
    setEditMode(false);
    setCurrentId(null);
    setForm({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      deadline: "",
      project: "",
      assignedTo: "",
    });
  };

  const managerTasks = tasks.filter((t) => {
    const project = projects.find(
      (p) =>
        p._id === (typeof t.project === "string" ? t.project : t.project?._id),
    );

    if (!project) return false;

    const managerId =
      typeof project.manager === "string"
        ? project.manager
        : project.manager?._id;

    return managerId === currentUser?._id;
  });

  return (
    <div className="p-3 sm:p-5 md:p-6 bg-slate-50/50 min-h-screen overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 w-full">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
            Manager Tasks
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 truncate">
            Allocate and audit workforce task structures for your projects
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition shrink-0 active:scale-95 self-start sm:self-auto w-full sm:w-auto"
        >
          <PlusCircle
            stroke="white"
            height={16}
            width={16}
            className="shrink-0"
          />{" "}
          <span>Add Task</span>
        </button>
      </div>

      {loading && !showForm && !taskToDelete && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-xs sm:text-sm font-medium w-full px-4">
          <Loader2 className="animate-spin text-blue-600 w-7 h-7 sm:w-8 sm:h-8 mb-2" />
          <span className="text-center">
            Restructuring distributed pipelines...
          </span>
        </div>
      )}

      {!loading && managerTasks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 w-full">
          {managerTasks.map((t) => (
            <motion.div
              key={t._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200/70 p-4 sm:p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-200 w-full min-w-0"
            >
              <div className="min-w-0 w-full">
                <h2 className="text-sm sm:text-base font-bold text-slate-800 mb-1 truncate">
                  {t.title}
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mb-4 line-clamp-2 leading-relaxed break-words">
                  {t.description || "No specific workload logs submitted."}
                </p>

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
                        {typeof t.project === "string"
                          ? projects.find((p) => p._id === t.project)?.name ||
                            "Unknown Link"
                          : t.project?.name || "Unknown Link"}
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
                        {t.assignedTo?.name || "Unassigned"}
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
                    <span className="truncate text-[11px] sm:text-xs">
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

              <div className="flex items-center justify-between border-t border-slate-50 mt-4 pt-2 w-full">
                <div className="flex gap-1.5 flex-wrap max-w-[70%]">
                  <span
                    className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full border shrink-0 ${
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
                    className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full border shrink-0 ${
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

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(t)}
                    className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-600 transition shrink-0"
                    aria-label="Edit task"
                  >
                    <EditAnimatedSquare />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskToDelete(t._id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition shrink-0"
                    aria-label="Delete task"
                  >
                    <Delete height={16} stroke="currentColor" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && managerTasks.length === 0 && (
        <div className="text-center bg-white border border-dashed rounded-2xl p-8 sm:p-12 text-slate-400 italic text-xs sm:text-sm w-full">
          No task arrays indexed inside this database view.
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !loading && resetForm()}
            />
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg z-10 flex flex-col max-h-[90vh] sm:max-h-[85vh]"
            >
              <button
                type="button"
                onClick={resetForm}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition z-10"
                disabled={loading}
              >
                <X size={16} />
              </button>

              <div className="px-5 py-3.5 border-b border-slate-100 shrink-0 w-full">
                <h2 className="text-base sm:text-lg font-bold text-slate-800 pr-6 truncate">
                  {editMode
                    ? "Modify Workspace Context"
                    : "Initialize Workspace Task"}
                </h2>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 sm:space-y-4 custom-scrollbar w-full"
              >
                <div className="w-full">
                  <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="w-full px-3 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="w-full">
                  <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                    Workload Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full px-3 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium resize-none"
                    rows={3}
                    disabled={loading}
                  />
                </div>

                <div className="w-full">
                  <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
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
                    disabled={loading}
                  />
                </div>

                <div className="w-full">
                  <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                    Assigned Operator
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
                    disabled={loading}
                  />
                </div>

                <div className="w-full">
                  <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
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
                      setForm({
                        ...form,
                        status: value as TaskForm["status"],
                      })
                    }
                    placeholder="Select Status Stage"
                    disabled={loading}
                  />
                </div>

                <div className="w-full">
                  <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
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
                    disabled={loading}
                  />
                </div>

                <div className="w-full">
                  <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                    Target Deadline
                  </label>
                  <input
                    type="date"
                    value={form.deadline || ""}
                    onChange={(e) =>
                      setForm({ ...form, deadline: e.target.value })
                    }
                    className="w-full px-3 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium bg-white"
                    disabled={loading}
                  />
                </div>
              </form>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 shrink-0 rounded-b-2xl w-full">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white min-w-[90px] shadow-sm transition active:scale-95"
                  disabled={loading}
                >
                  {loading ? (
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
              className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 w-full max-w-[320px] xs:max-w-sm relative z-10 text-center"
            >
              <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-3 border border-red-100 shrink-0">
                <AlertTriangle size={22} />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                Terminate Task Array
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
                Are you absolutely sure you want to delete this task record?
                This structural clean cannot be restored.
              </p>
              <div className="flex gap-2 pt-4 mt-4 border-t border-slate-50 w-full">
                <button
                  type="button"
                  onClick={() => setTaskToDelete(null)}
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

export default ManagerTasks;
