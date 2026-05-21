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
    <div className="p-4 sm:p-6 bg-slate-50/50 min-h-screen">
      {/* Header Panel */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800">My Projects</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Overview of streams and operations assigned to your node
        </p>
      </div>

      {/* Synchronizing Spinner Loader */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-sm font-medium">
          <Loader2 className="animate-spin text-blue-600 w-8 h-8 mb-2" />
          <span>Synchronizing allocated pipelines...</span>
        </div>
      )}

      {!loading && currentUser && (
        <>
          {myProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myProjects.map((p) => (
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
                        className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase border tracking-wider rounded-full shrink-0 ${
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
                        "No description provided for this operational branch."}
                    </p>
                  </div>

                  {/* Metadata Blocks */}
                  <div className="border-t border-slate-100 pt-3 mt-2">
                    <div className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                      <div className="flex items-center gap-2">
                        <UserIcon
                          size={14}
                          className="text-slate-400 shrink-0"
                        />
                        <span className="truncate">
                          Manager:{" "}
                          <strong className="text-slate-800 font-bold">
                            {typeof p.manager === "string"
                              ? p.manager
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
            <div className="text-center bg-white border border-dashed rounded-2xl p-12 text-slate-400 italic text-sm shadow-sm">
              No project streams mapped to your identity core.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmployeeProjects;
