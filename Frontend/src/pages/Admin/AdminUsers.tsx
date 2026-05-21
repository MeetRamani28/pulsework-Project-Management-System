import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  getAllUsers,
  deleteUser,
  updateUser,
} from "../../Reducers/UserReducers";
import { registerUser } from "../../Reducers/AuthReducers";
import type { User } from "../../Reducers/UserReducers";
import { Loader2, User as UserIcon, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { PlusCircle } from "../../Icons/DashboardIcons";
import { CustomDropdown } from "../../components/atoms/CustomDropdown";
import { EditAnimatedSquare } from "../../Icons/EditAnimated";
import { Delete } from "../../Icons/Delete";

interface UserForm {
  name: string;
  email: string;
  password: string;
  roles: string;
  bio: string;
  phone: string;
  jobTitle: string;
  department: string;
  location: string;
  profilePicture: File | null;
}

const AdminUsers: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading } = useSelector((state: RootState) => state.users);

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeletingLocal, setIsDeletingLocal] = useState(false);

  const [form, setForm] = useState<UserForm>({
    name: "",
    email: "",
    password: "",
    roles: "employee",
    bio: "",
    phone: "",
    jobTitle: "",
    department: "",
    location: "",
    profilePicture: null,
  });

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const resetForm = useCallback(() => {
    setShowForm(false);
    setEditMode(false);
    setCurrentId(null);
    setForm({
      name: "",
      email: "",
      password: "",
      roles: "employee",
      bio: "",
      phone: "",
      jobTitle: "",
      department: "",
      location: "",
      profilePicture: null,
    });
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.roles.trim()) {
      return toast.error("Name, Email & Role are required!");
    }

    try {
      setFormSubmitting(true);

      if (editMode && currentId) {
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            if (key === "password") return;
            if (key === "profilePicture" && value instanceof File) {
              formData.append("profilePicture", value);
            } else if (key !== "profilePicture") {
              formData.append(key, String(value).trim());
            }
          }
        });

        await dispatch(updateUser({ id: currentId, formData })).unwrap();
        toast.success("User configuration updated ✨");
      } else {
        await dispatch(
          registerUser({
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            roles: form.roles,
            // @ts-expect-error: AuthReducers registerUser type definition lacks extended profile fields
            jobTitle: form.jobTitle.trim() || undefined,
            department: form.department.trim() || undefined,
            location: form.location.trim() || undefined,
            bio: form.bio.trim() || undefined,
          }),
        ).unwrap();
        toast.success("New user node registered successfully 🚀");
      }

      resetForm();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else if (typeof err === "string") {
        toast.error(err);
      } else {
        toast.error("An infrastructure deployment error occurred.");
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        setIsDeletingLocal(true);
        await dispatch(deleteUser(userToDelete)).unwrap();
        toast.success("User node purged successfully 🗑️");
        setUserToDelete(null);
        dispatch(getAllUsers());
      } catch (err: unknown) {
        if (err instanceof Error) toast.error(err.message);
        else toast.error("Failed to delete user!");
      } finally {
        setIsDeletingLocal(false);
      }
    }
  };

  const handleEdit = (user: User) => {
    setCurrentId(user._id);
    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      roles: user.roles || "employee",
      bio: user.bio || "",
      phone: user.phone || "",
      jobTitle: user.jobTitle || "",
      department: user.department || "",
      location: user.location || "",
      profilePicture: null,
    });
    setEditMode(true);
    setShowForm(true);
  };

  return (
    <div className="p-3 sm:p-5 md:p-6 bg-slate-50/50 min-h-screen overflow-x-hidden">
      <Toaster position="bottom-right" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 w-full">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
            User Directory
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 truncate">
            Audit identity permissions and node resource access
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditMode(false);
            setShowForm(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition shrink-0 active:scale-95 w-full sm:w-auto"
        >
          <PlusCircle
            stroke="white"
            height={16}
            width={16}
            className="shrink-0"
          />{" "}
          <span>Add User</span>
        </button>
      </div>

      {loading && !showForm && !userToDelete && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-xs sm:text-sm font-medium w-full">
          <Loader2 className="animate-spin text-blue-600 w-7 h-7 sm:w-8 sm:h-8 mb-2" />
          <span className="text-center">Synchronizing team directories...</span>
        </div>
      )}

      {!loading && users.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 w-full">
          {users.map((u) => {
            const profileImageUrl = u.profilePicture
              ? u.profilePicture.startsWith("http")
                ? u.profilePicture
                : `${import.meta.env.VITE_API_URL}/${u.profilePicture}`
              : null;

            return (
              <motion.div
                key={u._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200/70 p-4 sm:p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-200 w-full min-w-0"
              >
                <div className="min-w-0 w-full">
                  <div className="flex items-center gap-3 mb-4 border-b border-slate-50 pb-3 w-full">
                    <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                      {profileImageUrl ? (
                        <img
                          src={profileImageUrl}
                          alt={u.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon size={20} className="text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm sm:text-base font-bold text-slate-800 truncate">
                        {u.name}
                      </h2>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200/30 mt-0.5">
                        {u.roles}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-500 text-[11px] sm:text-xs font-semibold mb-4 bg-slate-50/50 p-2 rounded-lg border border-slate-100 truncate w-full">
                    {u.email}
                  </p>

                  <div className="flex flex-col gap-1.5 text-xs font-semibold text-slate-500 mb-4 pl-0.5 w-full">
                    {u.jobTitle && (
                      <div className="truncate w-full">
                        <span className="text-slate-400">Designation:</span>{" "}
                        <span className="text-slate-700">{u.jobTitle}</span>
                      </div>
                    )}
                    {u.department && (
                      <div className="truncate w-full">
                        <span className="text-slate-400">Department:</span>{" "}
                        <span className="text-slate-700">{u.department}</span>
                      </div>
                    )}
                    {u.location && (
                      <div className="truncate w-full">
                        <span className="text-slate-400">Location:</span>{" "}
                        <span className="text-slate-700">{u.location}</span>
                      </div>
                    )}
                    {u.phone && (
                      <div className="truncate w-full">
                        <span className="text-slate-400">Contact:</span>{" "}
                        <span className="text-slate-700">{u.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-1.5 border-t border-slate-50 pt-2 w-full">
                  <button
                    type="button"
                    onClick={() => handleEdit(u)}
                    className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-600 transition shrink-0"
                    aria-label="Edit User"
                  >
                    <EditAnimatedSquare />
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserToDelete(u._id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition shrink-0"
                    aria-label="Delete User"
                  >
                    <Delete height={16} stroke="currentColor" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className="text-center bg-white border border-dashed rounded-2xl p-8 sm:p-12 text-slate-400 italic text-xs sm:text-sm w-full">
          No user profiles available inside current node pool index.
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !formSubmitting && setShowForm(false)}
            />
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg z-10 flex flex-col max-h-[90vh] sm:max-h-[85vh]"
            >
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition z-10"
                disabled={formSubmitting}
              >
                <X size={16} />
              </button>

              <div className="px-5 py-3.5 border-b border-slate-100 shrink-0 w-full">
                <h2 className="text-base sm:text-lg font-bold text-slate-800 pr-6 truncate">
                  {editMode
                    ? "Modify Node Permissions"
                    : "Initialize Identity Record"}
                </h2>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 sm:space-y-4 custom-scrollbar w-full"
              >
                <div className="w-full">
                  <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium"
                    required
                    disabled={formSubmitting}
                  />
                </div>

                <div className="w-full">
                  <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                    Email Destination
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full px-3 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium bg-white"
                    required
                    disabled={formSubmitting || editMode}
                  />
                </div>

                <div className="w-full">
                  <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                    Secure Password
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="w-full px-3 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium"
                    required={!editMode}
                    disabled={formSubmitting}
                    placeholder={
                      editMode ? "Leave empty to preserve secure string" : ""
                    }
                  />
                </div>

                <div className="w-full">
                  <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                    Access Authorization Role
                  </label>
                  <CustomDropdown
                    options={[
                      { label: "Admin Controller", value: "admin" },
                      { label: "Project Manager", value: "manager" },
                      { label: "Standard Operator", value: "employee" },
                    ]}
                    selected={form.roles}
                    onSelect={(value) => setForm({ ...form, roles: value })}
                    placeholder="Select Role Assignment"
                    disabled={formSubmitting}
                  />
                </div>

                <div className="w-full">
                  <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                    Biography Abstract
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className="w-full px-3 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium resize-none"
                    rows={2}
                    disabled={formSubmitting}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 w-full">
                  <div className="w-full">
                    <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                      Phone Line
                    </label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium"
                      disabled={formSubmitting}
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                      Designation Title
                    </label>
                    <input
                      type="text"
                      value={form.jobTitle}
                      onChange={(e) =>
                        setForm({ ...form, jobTitle: e.target.value })
                      }
                      className="w-full px-3 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium"
                      disabled={formSubmitting}
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                      Department Unit
                    </label>
                    <input
                      type="text"
                      value={form.department}
                      onChange={(e) =>
                        setForm({ ...form, department: e.target.value })
                      }
                      className="w-full px-3 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium"
                      disabled={formSubmitting}
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                      Geographic Location
                    </label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) =>
                        setForm({ ...form, location: e.target.value })
                      }
                      className="w-full px-3 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium"
                      disabled={formSubmitting}
                    />
                  </div>
                </div>

                <div className="w-full">
                  <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                    Avatar Image Box
                  </label>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(e) =>
                      setForm({
                        ...form,
                        profilePicture: e.target.files?.[0] || null,
                      })
                    }
                    className="w-full text-xs text-slate-500 file:mr-3 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-xl file:border-0 file:text-[10px] sm:file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition cursor-pointer mt-1"
                    disabled={formSubmitting}
                  />
                </div>
              </form>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 shrink-0 rounded-b-2xl w-full">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white min-w-[90px] shadow-sm transition active:scale-95"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : editMode ? (
                    "Update Node"
                  ) : (
                    "Deploy User"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !isDeletingLocal && setUserToDelete(null)}
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
                Revoke Account Access
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
                Are you absolutely sure you want to completely erase this user
                profile? This directory purge cannot be undone.
              </p>
              <div className="flex gap-2 pt-4 mt-4 border-t border-slate-50 w-full">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
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

export default AdminUsers;
