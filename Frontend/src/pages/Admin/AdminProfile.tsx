import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../store/store";
import {
  getCurrentUser,
  updateMyProfile,
  clearUserError,
  clearUserSuccess,
} from "../../Reducers/UserReducers";
import { toast } from "sonner";
import { Shield, Loader2 } from "lucide-react";
import { User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EditAnimatedSquare } from "../../Icons/EditAnimated";
import { motion } from "framer-motion";
import { SaveIcon } from "../../Icons/SaveIcon";
import { CancelIcon } from "../../Icons/CancelIcon";

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const inputVariant = {
  hover: { scale: 1.005, transition: { duration: 0.2 } }, // મોબાઇલ ઝૂમિંગ કંટ્રોલ કરવા સહેજ ઓછું કર્યું
  focus: { scale: 1.01, transition: { duration: 0.2 } },
};

const panelVariant = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

export interface User {
  _id: string;
  name: string;
  email: string;
  roles: string;
  bio?: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  location?: string;
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: boolean;
}

const AdminProfile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser, loading, error, success } = useSelector(
    (state: RootState) => state.users,
  );
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<Partial<User>>({});
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (currentUser) {
      setUserData(currentUser);

      if (currentUser.profilePicture) {
        if (currentUser.profilePicture.startsWith("http")) {
          setProfilePreview(currentUser.profilePicture);
        } else {
          setProfilePreview(
            `${import.meta.env.VITE_API_URL}/${currentUser.profilePicture}`,
          );
        }
      } else {
        setProfilePreview(null);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearUserError());
    }
    if (success) {
      toast.success("Profile updated successfully ✨");
      dispatch(clearUserSuccess());
      setIsEditing(false);
      setProfileFile(null);
    }
  }, [error, success, dispatch]);

  const handleChange = (field: keyof User, value: string) => {
    setUserData({ ...userData, [field]: value });
  };

  const handleProfileChange = (file: File | null) => {
    if (!file) return;
    setProfileFile(file);
    const reader = new FileReader();
    reader.onload = () => setProfilePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!userData.name?.trim()) {
      toast.error("Name is required");
      return;
    }

    const formData = new FormData();

    Object.entries(userData).forEach(([key, value]) => {
      if (
        value !== undefined &&
        key !== "profilePicture" &&
        key !== "roles" &&
        key !== "email"
      ) {
        formData.append(key, String(value).trim());
      }
    });

    if (profileFile) {
      formData.append("profilePicture", profileFile);
    }

    dispatch(updateMyProfile(formData));
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-red-50 text-red-700 border-red-200/50";
      case "manager":
        return "bg-blue-50 text-blue-700 border-blue-200/50";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200/50";
    }
  };

  if (loading && !currentUser) {
    return (
      <div className="p-6 flex flex-col justify-center items-center min-h-[70vh] text-slate-500 text-sm font-medium">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <span>Loading secure profile...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-full">
      <h1 className="text-2xl sm:text-3xl font-black mb-6 text-slate-800">
        My Profile
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / Main Panel */}
        <motion.div
          className="lg:col-span-2 space-y-6"
          initial="hidden"
          animate="visible"
          variants={cardVariant}
        >
          {/* Profile Details Container */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-700">
                Identity & Access Metadata
              </h2>
              {!isEditing && (
                <button
                  className="text-blue-600 hover:text-blue-700 p-1 rounded-lg hover:bg-slate-50 transition"
                  onClick={() => setIsEditing(true)}
                  aria-label="Edit profile"
                >
                  <EditAnimatedSquare />
                </button>
              )}
            </div>

            {/* Profile Avatar Segment */}
            <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-white shrink-0 shadow-inner">
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt={userData.name || "Profile"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon size={28} className="text-slate-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-slate-800 truncate">
                  {currentUser?.name}
                </h3>
                <p className="text-slate-500 text-sm truncate">
                  {currentUser?.email}
                </p>
                <div className="flex mt-1.5">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase border tracking-wider ${getRoleBadgeColor(currentUser?.roles)}`}
                  >
                    <Shield className="w-3 h-3 mr-1 shrink-0" />
                    {currentUser?.roles}
                  </span>
                </div>
              </div>
            </div>

            {/* Fields Grid Component */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Full Name", field: "name", type: "text" },
                {
                  label: "Email Address",
                  field: "email",
                  type: "email",
                  disabled: true,
                },
                {
                  label: "Account Role Permission",
                  field: "roles",
                  type: "text",
                  disabled: true,
                }, 
                { label: "Contact Phone", field: "phone", type: "text" },
                { label: "Job Designation", field: "jobTitle", type: "text" },
                {
                  label: "Department Branch",
                  field: "department",
                  type: "text",
                },
                {
                  label: "Workplace Location",
                  field: "location",
                  type: "text",
                },
              ].map(({ label, field, type, disabled }) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const isFieldDisabled = disabled || !isEditing;
                return (
                  <motion.div
                    key={field}
                    variants={inputVariant}
                    whileHover={isEditing ? "hover" : undefined}
                  >
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 pl-0.5">
                      {label}
                    </label>
                    {isEditing ? (
                      <input
                        type={type}
                        value={
                          userData[field as keyof User] !== undefined
                            ? String(userData[field as keyof User])
                            : ""
                        }
                        onChange={(e) =>
                          handleChange(field as keyof User, e.target.value)
                        }
                        disabled={disabled}
                        className="w-full border border-slate-200 bg-white disabled:bg-slate-50 disabled:text-slate-400 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-800 font-medium"
                      />
                    ) : (
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 min-h-[46px] flex items-center">
                        {String(userData[field as keyof User] || "—")}
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Profile Attachment Block */}
              {isEditing && (
                <div className="col-span-1 sm:col-span-2 bg-blue-50/30 border border-dashed border-blue-200 p-4 rounded-xl">
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
                    Upload Profile Media Box
                  </label>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(e) =>
                      handleProfileChange(
                        e.target.files ? e.target.files[0] : null,
                      )
                    }
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Operational Form Action Controls */}
            {isEditing && (
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-sm transition active:scale-95"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <SaveIcon height={16} stroke="white" />
                  )}
                  <span>Save Profile</span>
                </button>

                <button
                  onClick={() => {
                    setIsEditing(false);
                    setUserData(currentUser || {});
                  }}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-semibold text-sm rounded-xl transition active:scale-95"
                >
                  <CancelIcon height={16} stroke="#334155" />
                  <span>Cancel changes</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right / Quick Navigation Summary Panel */}
        <motion.div
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={panelVariant}
        >
          {/* Quick Actions Panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">
              Terminal Shortcuts
            </h2>
            <button
              onClick={() => navigate("/admin/project")}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-sm transition active:scale-[0.98]"
            >
              View All Projects
            </button>
            <button
              onClick={() => navigate("/admin")}
              className="w-full border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold px-4 py-3 rounded-xl transition active:scale-[0.98]"
            >
              Return Dashboard
            </button>
          </div>

          {/* System Info Panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">
              System Core Diagnostics
            </h2>
            <div className="text-sm text-slate-600 space-y-2 font-medium">
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400">Environment:</span>{" "}
                <span>Production Node</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400">Engine Build:</span>{" "}
                <span>v1.0.0 Stable</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Node Identifier:</span>{" "}
                <span className="bg-slate-100 font-mono px-2 py-0.5 rounded text-xs text-slate-700">
                  {currentUser?._id?.slice(0, 10)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminProfile;
