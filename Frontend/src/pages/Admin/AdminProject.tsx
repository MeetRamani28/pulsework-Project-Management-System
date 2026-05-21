import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  getAllProjects,
  deleteProject,
  createProject,
  updateProject,
  clearProjectError,
  clearProjectSuccess,
} from "../../Reducers/ProjectReducers";
import type { Project } from "../../Reducers/ProjectReducers";
import { Loader2, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle } from "../../Icons/DashboardIcons";
import { getAllUsers } from "../../Reducers/UserReducers";
import { Delete } from "../../Icons/Delete";
import { EditAnimatedSquare } from "../../Icons/EditAnimated";
import toast from "react-hot-toast";
import { CustomDropdown } from "../../components/atoms/CustomDropdown";
import { Calendar1 } from "../../Icons/Calender1";
import { User } from "../../Icons/User";

interface ProjectForm {
  name: string;
  description: string;
  manager: string;
  members: string[];
  status: string;
  deadline: string;
}

const AdminProject: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { projects, loading, error, success } = useSelector(
    (state: RootState) => state.projects,
  );
  const { users } = useSelector((state: RootState) => state.users);

  const availableManagers = users.filter((u) => u.roles === "manager");
  const availableEmployees = users.filter((u) => u.roles === "employee");

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [form, setForm] = useState<ProjectForm>({
    name: "",
    description: "",
    manager: "",
    members: [],
    status: "in-progress",
    deadline: "",
  });

  useEffect(() => {
    dispatch(getAllProjects());
    dispatch(getAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearProjectError());
    }

    if (success) {
      if (!projectToDelete) {
        toast.success(
          editMode
            ? "Project updated successfully ✨"
            : "Project created successfully 🚀",
        );
        setShowForm(false);
        setEditMode(false);
        setForm({
          name: "",
          description: "",
          manager: "",
          members: [],
          status: "in-progress",
          deadline: "",
        });
      } else {
        toast.success("Project deleted successfully 🗑️");
        setProjectToDelete(null);
      }
      dispatch(clearProjectSuccess());
    }
  }, [error, success, dispatch, editMode, projectToDelete]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Project name is required!");
    if (!form.manager) return toast.error("A project must have one manager!");

    if (editMode && currentId) {
      dispatch(updateProject({ id: currentId, updates: form }));
    } else {
      dispatch(createProject(form));
    }
  };

  const confirmDelete = async () => {
    if (projectToDelete) {
      setIsDeleting(true);
      await dispatch(deleteProject(projectToDelete));
      setIsDeleting(false);
    }
  };

  const handleEdit = (project: Project) => {
    setCurrentId(project._id);
    setForm({
      name: project.name,
      description: project.description || "",
      manager:
        typeof project.manager === "string"
          ? project.manager
          : project.manager?._id || "",
      members:
        project.members?.map((m) => (typeof m === "string" ? m : m._id)) || [],
      status: project.status || "in-progress",
      deadline: project.deadline ? project.deadline.split("T")[0] : "",
    });
    setEditMode(true);
    setShowForm(true);
  };

  return (
    <div className="p-4 sm:p-6 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            Projects Workspace
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage enterprise pipelines and operations
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditMode(false);
            setForm({
              name: "",
              description: "",
              manager: "",
              members: [],
              status: "in-progress",
              deadline: "",
            });
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition active:scale-95 self-start sm:self-auto w-full sm:w-auto"
        >
          <PlusCircle stroke="white" height={18} /> <span>Add Project</span>
        </button>
      </div>

      {loading && !showForm && !projectToDelete && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-sm font-medium">
          <Loader2 className="animate-spin text-blue-600 w-8 h-8 mb-2" />
          <span>Synchronizing architecture logs...</span>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p: Project) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-200"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="text-base font-bold text-slate-800 truncate max-w-[80%]">
                    {p.name}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 text-[11px] font-bold uppercase border tracking-wider rounded-full shrink-0 ${
                      p.status === "completed"
                        ? "bg-blue-50 text-blue-700 border-blue-200/40"
                        : p.status === "in-progress"
                          ? "bg-amber-50 text-amber-700 border-amber-200/40"
                          : "bg-slate-50 text-slate-600 border-slate-200/40"
                    }`}
                  >
                    {p.status || "N/A"}
                  </span>
                </div>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {p.description || "No project description provided."}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-3 mt-2">
                <div className="flex flex-col gap-2 text-xs font-semibold text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <User
                      height={16}
                      width={14}
                      stroke="#64748b"
                      className="shrink-0"
                    />
                    <span className="truncate">
                      Manager:{" "}
                      <strong className="text-slate-800 font-bold">
                        {typeof p.manager === "string"
                          ? users.find((u) => u._id === p.manager)?.name ||
                            "Unassigned"
                          : p.manager?.name || "Unassigned"}
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
                      Deadline:{" "}
                      <strong className="text-slate-800 font-bold">
                        {p.deadline
                          ? new Date(p.deadline).toLocaleDateString()
                          : "N/A"}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-50 pt-2.5">
                  <button
                    onClick={() => handleEdit(p)}
                    className="p-2 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition"
                    aria-label="Edit project"
                  >
                    <EditAnimatedSquare />
                  </button>
                  <button
                    onClick={() => setProjectToDelete(p._id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                    aria-label="Delete project"
                  >
                    <Delete height={18} stroke="currentColor" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="text-center bg-white border border-dashed rounded-2xl p-12 text-slate-400 italic text-sm">
          No projects matching current index criteria found.
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !loading && setShowForm(false)}
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
                disabled={loading}
              >
                <X size={18} />
              </button>

              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">
                  {editMode
                    ? "Modify Operational Scope"
                    : "Initialize New Pipeline"}
                </h2>
              </div>

              <form
                onSubmit={handleFormSubmit}
                className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                    Description Abstract
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium resize-none"
                    rows={3}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                    Executive Lead Manager
                  </label>
                  <CustomDropdown
                    options={availableManagers.map((m) => ({
                      label: m.name,
                      value: m._id,
                    }))}
                    selected={form.manager}
                    onSelect={(value) => setForm({ ...form, manager: value })}
                    placeholder="Select Lead Assignment"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                    Resource Allocations (Members)
                  </label>
                  <CustomDropdown
                    options={availableEmployees.map((e) => ({
                      label: e.name,
                      value: e._id,
                    }))}
                    selected={form.members}
                    onSelectMulti={(values: string[]) =>
                      setForm({ ...form, members: values })
                    }
                    multi
                    placeholder={
                      form.members.length > 0
                        ? `${form.members.length} operators active`
                        : "Select Node Groups"
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                    Deployment Status
                  </label>
                  <CustomDropdown
                    options={[
                      { label: "Planned Route", value: "planned" },
                      { label: "Active Execution", value: "in-progress" },
                      { label: "Fulfillment Achieved", value: "completed" },
                    ]}
                    selected={form.status}
                    onSelect={(value) => setForm({ ...form, status: value })}
                    placeholder="Select Lifespan Layer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                    Fulfillment Deadline
                  </label>
                  <input
                    type="date"
                    value={form.deadline || ""}
                    onChange={(e) =>
                      setForm({ ...form, deadline: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium"
                    disabled={loading}
                  />
                </div>
              </form>

              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleFormSubmit}
                  className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white min-w-[80px] shadow-sm transition active:scale-95"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : editMode ? (
                    "Update Node"
                  ) : (
                    "Deploy Stream"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {projectToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !isDeleting && setProjectToDelete(null)}
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
                Confirm Deletion
              </h3>
              <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
                Are you absolutely sure you want to terminate this project
                pipeline? This action cannot be reverted.
              </p>
              <div className="flex gap-2.5 mt-5 border-t border-slate-50 pt-4">
                <button
                  onClick={() => setProjectToDelete(null)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                  disabled={isDeleting}
                >
                  Dismiss
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
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

export default AdminProject;
