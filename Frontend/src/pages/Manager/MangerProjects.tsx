import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  getAllProjects,
  deleteProject,
  updateProject,
  clearProjectError,
  clearProjectSuccess,
} from "../../Reducers/ProjectReducers";
import type { Project } from "../../Reducers/ProjectReducers";
import { getAllUsers } from "../../Reducers/UserReducers";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, AlertTriangle } from "lucide-react";
import { EditAnimatedSquare } from "../../Icons/EditAnimated";
import { Delete } from "../../Icons/Delete";
import toast, { Toaster } from "react-hot-toast";
import { CustomDropdown } from "../../components/atoms/CustomDropdown";
import { Calendar1 } from "../../Icons/Calender1";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Users } from "../../Icons/DashboardIcons";
import { User as UserIcon } from "lucide-react";

interface ProjectForm {
  name: string;
  description: string;
  manager: string;
  members: string[];
  status: string;
  deadline: string;
}

const MasterProjects: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { projects, loading, error, success } = useSelector(
    (state: RootState) => state.projects,
  );
  const { users, currentUser } = useSelector((state: RootState) => state.users);

  const availableEmployees = users.filter((u) => u.roles === "employee");

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isDeletingLocal, setIsDeletingLocal] = useState(false);

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
      setIsDeletingLocal(false);
    }

    if (success) {
      if (projectToDelete) {
        toast.success("Project workspace deleted successfully 🗑️");
        setProjectToDelete(null);
        setIsDeletingLocal(false);
      } else {
        toast.success("Project parameters updated successfully ✨");
        setShowForm(false);
        setEditMode(false);
        setCurrentId(null);
        setForm({
          name: "",
          description: "",
          manager: "",
          members: [],
          status: "in-progress",
          deadline: "",
        });
      }
      dispatch(clearProjectSuccess());
    }
  }, [error, success, dispatch, projectToDelete]);

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

  const confirmDelete = async () => {
    if (projectToDelete) {
      setIsDeletingLocal(true);
      await dispatch(deleteProject(projectToDelete));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Project name is required!");

    if (editMode && currentId) {
      dispatch(updateProject({ id: currentId, updates: form }));
    }
  };

  const filteredProjects = projects.filter((p) => {
    const isManager =
      typeof p.manager === "string"
        ? p.manager === currentUser?._id
        : p.manager?._id === currentUser?._id;
    const isMember = p.members?.some((m) =>
      typeof m === "string"
        ? m === currentUser?._id
        : m._id === currentUser?._id,
    );
    return isManager || isMember;
  });

  return (
    <div className="p-4 sm:p-6 bg-slate-50/50 min-h-screen">
      <Toaster position="bottom-right" />

      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800">
          Master Operations Control
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Audit and update parameters for your active project networks
        </p>
      </div>

      {loading && !showForm && !projectToDelete && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-sm font-medium">
          <Loader2 className="animate-spin text-blue-600 w-8 h-8 mb-2" />
          <span>Synchronizing operational directories...</span>
        </div>
      )}

      {!loading && currentUser && (
        <>
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((p) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-200"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h2 className="text-base font-bold text-slate-800 truncate max-w-[75%]">
                        {p.name}
                      </h2>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          p.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/40"
                            : p.status === "in-progress"
                              ? "bg-amber-50 text-amber-700 border-amber-200/40"
                              : "bg-slate-50 text-slate-600 border-slate-200/40"
                        }`}
                      >
                        {p.status || "N/A"}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {p.description ||
                        "No project logs provided for this cluster branch."}
                    </p>

                    <div className="flex flex-col gap-2 text-xs font-semibold text-slate-600 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-2">
                        <UserIcon
                          size={14}
                          className="text-slate-400 shrink-0"
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
                          Timeline Deadline:{" "}
                          <strong className="text-slate-800 font-bold">
                            {p.deadline
                              ? new Date(p.deadline).toLocaleDateString()
                              : "No Bounds"}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-slate-50 pt-2.5 mt-4">
                    <button
                      onClick={() => handleEdit(p)}
                      className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition"
                      aria-label="Edit project"
                    >
                      <EditAnimatedSquare />
                    </button>
                    <button
                      onClick={() => setProjectToDelete(p._id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                      aria-label="Delete project"
                    >
                      <Delete height={18} stroke="currentColor" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center bg-white border border-dashed rounded-2xl p-12 text-slate-400 italic text-sm shadow-sm">
              No managed streams linked to your controller account index.
            </div>
          )}
        </>
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
                  Modify Operational Scope
                </h2>
              </div>

              <form
                onSubmit={handleSubmit}
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
                    Executive Lead Assignment (Manager)
                  </label>
                  <input
                    type="text"
                    value={
                      users.find((u) => u._id === form.manager)?.name || "N/A"
                    }
                    readOnly
                    className="w-full px-3 py-2.5 border border-slate-200 bg-slate-50 text-slate-500 rounded-xl text-sm font-semibold select-none cursor-not-allowed"
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
                    Deployment Route Layer
                  </label>
                  <CustomDropdown
                    options={[
                      { label: "Planned Route", value: "planned" },
                      { label: "Active Execution", value: "in-progress" },
                      { label: "Fulfillment Achieved", value: "completed" },
                    ]}
                    selected={form.status}
                    onSelect={(value) => setForm({ ...form, status: value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                    Fulfillment Target Bound
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
                  onClick={handleSubmit}
                  className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white min-w-[85px] shadow-sm transition active:scale-95"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    "Update Node"
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
              onClick={() => !isDeletingLocal && setProjectToDelete(null)}
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
                pipeline? This operational purge cannot be restored.
              </p>
              <div className="flex gap-2.5 mt-5 border-t border-slate-50 pt-4">
                <button
                  onClick={() => setProjectToDelete(null)}
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

export default MasterProjects;
