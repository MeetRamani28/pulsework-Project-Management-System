import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { getAllProjects } from "../../Reducers/ProjectReducers";
import { getAllUsers } from "../../Reducers/UserReducers";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Calendar1 } from "../../Icons/Calender1";
import { User as UserIcon } from "lucide-react";

const EmployeeProjects: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { projects, loading } = useSelector(
    (state: RootState) => state.projects,
  );
  const { currentUser } = useSelector((state: RootState) => state.users);

  useEffect(() => {
    dispatch(getAllProjects());
    dispatch(getAllUsers());
  }, [dispatch]);

  const myProjects = projects.filter((p) => {
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
    <div className="p-3 sm:p-5 md:p-6 bg-slate-50/50 min-h-screen overflow-x-hidden">
      {/* Header Panel */}
      <div className="mb-6 w-full">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
          My Projects
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5 truncate">
          Overview of streams and operations assigned to your node
        </p>
      </div>

      {/* Synchronizing Spinner Loader */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-xs sm:text-sm font-medium w-full px-4">
          <Loader2 className="animate-spin text-blue-600 w-7 h-7 sm:w-8 sm:h-8 mb-2" />
          <span className="text-center">
            Synchronizing allocated pipelines...
          </span>
        </div>
      )}

      {!loading && currentUser && (
        <>
          {myProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 w-full">
              {myProjects.map((p) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-slate-200/70 p-4 sm:p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-200 w-full min-w-0"
                >
                  <div className="min-w-0 w-full">
                    <div className="flex items-start justify-between gap-3 mb-2 w-full">
                      <h2 className="text-sm sm:text-base font-bold text-slate-800 truncate flex-1">
                        {p.name}
                      </h2>
                      <span
                        className={`px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase border tracking-wider rounded-full shrink-0 ${
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

                    <p className="text-slate-500 text-xs sm:text-sm mb-4 line-clamp-2 leading-relaxed break-words">
                      {p.description ||
                        "No description provided for this operational branch."}
                    </p>
                  </div>

                  {/* Metadata Blocks */}
                  <div className="border-t border-slate-100 pt-3 mt-auto w-full">
                    <div className="flex flex-col gap-2 text-xs font-semibold text-slate-600 w-full">
                      <div className="flex items-center gap-2 w-full min-w-0">
                        <UserIcon
                          size={14}
                          className="text-slate-400 shrink-0"
                        />
                        <span className="truncate text-[11px] sm:text-xs">
                          Manager:{" "}
                          <strong className="text-slate-800 font-bold">
                            {typeof p.manager === "string"
                              ? p.manager
                              : p.manager?.name || "Unassigned"}
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
                          Target Deadline:{" "}
                          <strong className="text-slate-800 font-bold">
                            {p.deadline
                              ? new Date(p.deadline).toLocaleDateString()
                              : "No Target"}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center bg-white border border-dashed rounded-2xl p-8 sm:p-12 text-slate-400 italic text-xs sm:text-sm shadow-sm w-full">
              No project streams mapped to your identity core.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmployeeProjects;
