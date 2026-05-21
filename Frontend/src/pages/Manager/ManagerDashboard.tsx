import React, { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import { PlusCircle, ClockIcon } from "../../Icons/DashboardIcons";
import { ProjectIcon, TasksIcon } from "../../Icons/SidebarIcon";
import { Loader2 } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  subDays,
} from "date-fns";

import { getAllProjects } from "../../Reducers/ProjectReducers";
import { getAllTasks } from "../../Reducers/TaskReducers";
import { getAllLogs } from "../../Reducers/TimeLogsReducers";
import { getCurrentUser } from "../../Reducers/UserReducers";

interface TaskChartData {
  name: string;
  tasks: number;
}
interface ProjectCompletionData {
  name: string;
  completed: number;
}
interface TimeLogData {
  name: string;
  logs: number;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 }, 
  }),
};
const cardHover = { hover: { scale: 1.02, transition: { duration: 0.2 } } }; // મોબાઇલ માટે સહેજ ઓછું કર્યું

const ManagerDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user } = useSelector((state: RootState) => state.auth);
  const { projects, loading: projectLoading } = useSelector(
    (state: RootState) => state.projects,
  );
  const { tasks, loading: taskLoading } = useSelector(
    (state: RootState) => state.tasks,
  );
  const { logs: timelogs, loading: timelogLoading } = useSelector(
    (state: RootState) => state.workLogs,
  );

  useEffect(() => {
    dispatch(getAllProjects());
    dispatch(getAllTasks());
    dispatch(getAllLogs());
    dispatch(getCurrentUser());
  }, [dispatch]);

  const assignedProjects = useMemo(() => {
    if (!user) return [];
    return projects.filter((p) => {
      if (typeof p.manager === "string") return p.manager === user._id;
      return p.manager?._id === user._id;
    });
  }, [projects, user]);

  const assignedTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!t.project) return false;

      if (typeof t.project === "string") {
        return assignedProjects.some((p) => p._id === t.project);
      }

      return assignedProjects.some(
        (p) => p._id === (t.project as { _id: string })._id,
      );
    });
  }, [tasks, assignedProjects]);

  const assignedLogs = useMemo(() => {
    return timelogs.filter((l) =>
      assignedProjects.some((p) => p._id === l.project?._id),
    );
  }, [timelogs, assignedProjects]);

  const projectCount = assignedProjects.length;
  const taskCount = assignedTasks.length;
  const timelogCount = assignedLogs.length;

  const weeklyTasksData: TaskChartData[] = useMemo(() => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(today, 6 - i);
      return { name: format(date, "EEE"), date, tasks: 0 };
    });

    assignedTasks.forEach((task) => {
      const taskDate = task.createdAt ? new Date(task.createdAt) : null;
      if (taskDate) {
        const dayObj = last7Days.find(
          (d) =>
            format(d.date, "yyyy-MM-dd") === format(taskDate, "yyyy-MM-dd"),
        );
        if (dayObj) dayObj.tasks += 1;
      }
    });

    return last7Days;
  }, [assignedTasks]);

  const completedProjectsData: ProjectCompletionData[] = useMemo(() => {
    if (assignedProjects.length === 0) return [];

    const dates = assignedProjects
      .filter((p) => !!p.createdAt)
      .map((p) => new Date(p.createdAt!));
    if (dates.length === 0) return [];

    const start = startOfMonth(
      new Date(Math.min(...dates.map((d) => d.getTime()))),
    );
    const end = endOfMonth(
      new Date(Math.max(...dates.map((d) => d.getTime()))),
    );
    const months = eachMonthOfInterval({ start, end });

    return months.map((monthDate) => {
      const monthLabel = format(monthDate, "MMM yy"); 
      const completedCount = assignedProjects.filter(
        (p) =>
          p.status === "completed" &&
          format(new Date(p.createdAt!), "MMM yy") === monthLabel,
      ).length;
      return { name: monthLabel, completed: completedCount };
    });
  }, [assignedProjects]);

  const weeklyTimeLogsData: TimeLogData[] = useMemo(() => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(today, 6 - i);
      return { name: format(date, "EEE"), date, logs: 0 };
    });

    assignedLogs.forEach((log) => {
      const logDate = log.startTime ? new Date(log.startTime) : null;
      if (logDate) {
        const dayObj = last7Days.find(
          (d) => format(d.date, "yyyy-MM-dd") === format(logDate, "yyyy-MM-dd"),
        );
        if (dayObj) dayObj.logs += 1;
      }
    });

    return last7Days;
  }, [assignedLogs]);

  if (projectLoading || taskLoading || timelogLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600 font-medium">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <span>Loading manager workspace telemetry...</span>
      </div>
    );
  }

  const summaryCards = [
    {
      title: "Managed Projects",
      value: projectCount,
      icon: <ProjectIcon className="w-6 h-6" />,
    },
    {
      title: "Project Workloads",
      value: taskCount,
      icon: <TasksIcon className="w-6 h-6" />,
    },
    {
      title: "Tracked TimeLogs",
      value: timelogCount,
      icon: <ClockIcon className="w-6 h-6" />,
    },
  ];

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 space-y-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        custom={0}
        className="text-left md:text-center pt-2"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent drop-shadow-sm">
          Welcome back,{" "}
          <span className="text-blue-700">{user?.name || "Manager"}</span>!
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          PulseWork Operations Command Centre
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div
            key={i}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            custom={i + 1}
            whileHover="hover"
            className="w-full"
          >
            <motion.div
              className="p-5 shadow-sm rounded-2xl bg-white border border-slate-200/50 flex items-center justify-between hover:shadow-md transition-all duration-200"
              variants={cardHover}
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  {card.title}
                </p>
                <h2 className="text-3xl font-black text-slate-800 mt-1">
                  {card.value}
                </h2>
              </div>
              <div className="text-emerald-600 bg-emerald-50 p-3 rounded-xl">
                {card.icon}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={4}
          className="p-4 rounded-2xl shadow-sm border border-slate-200/50 bg-white flex flex-col"
        >
          <h2 className="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-3 text-sm uppercase tracking-wide">
            Weekly Task Overview
          </h2>
          <div className="w-full h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={weeklyTasksData}
                margin={{ left: -25, right: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    stroke: "#16a34a",
                    strokeWidth: 2,
                    fill: "#fff",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={5}
          className="p-4 rounded-2xl shadow-sm border border-slate-200/50 bg-white flex flex-col"
        >
          <h2 className="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-3 text-sm uppercase tracking-wide">
            Fulfillment Velocity
          </h2>
          <div className="w-full h-[200px]">
            {completedProjectsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={completedProjectsData}
                  margin={{ left: -25, right: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      stroke: "#f59e0b",
                      strokeWidth: 2,
                      fill: "#fff",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 italic text-xs">
                No project lifecycles indexed.
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={6}
          className="p-4 rounded-2xl shadow-sm border border-slate-200/50 bg-white flex flex-col"
        >
          <h2 className="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-3 text-sm uppercase tracking-wide">
            Weekly Stream Tracking
          </h2>
          <div className="w-full h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={weeklyTimeLogsData}
                margin={{ left: -25, right: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="logs"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    stroke: "#3b82f6",
                    strokeWidth: 2,
                    fill: "#fff",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        custom={7}
        className="p-5 rounded-2xl shadow-sm border border-slate-200/50 bg-white"
      >
        <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 mb-4">
          <PlusCircle className="w-5 h-5 text-emerald-600" strokeWidth={2} />
          Quick Actions Console
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => navigate("/manager/project")}
            className="flex items-center justify-center sm:justify-start gap-3 px-5 py-3.5 bg-emerald-50/50 text-emerald-700 rounded-xl hover:bg-emerald-100/70 border border-emerald-100/50 transition active:scale-[0.98]"
          >
            <ProjectIcon width={20} height={20} stroke="#16a34a" />
            <span className="font-semibold text-sm">Add Project</span>
          </button>
          <button
            onClick={() => navigate("/manager/tasks")}
            className="flex items-center justify-center sm:justify-start gap-3 px-5 py-3.5 bg-blue-50/50 text-blue-700 rounded-xl hover:bg-blue-100/70 border border-blue-100/50 transition active:scale-[0.98]"
          >
            <TasksIcon width={20} height={20} stroke="#2563eb" />
            <span className="font-semibold text-sm">Add Task</span>
          </button>
          <button
            onClick={() => navigate("/manager/work-logs")}
            className="flex items-center justify-center sm:justify-start gap-3 px-5 py-3.5 bg-amber-50/50 text-amber-700 rounded-xl hover:bg-amber-100/70 border border-amber-100/50 transition active:scale-[0.98]"
          >
            <ClockIcon width={20} height={20} stroke="#f59e0b" />
            <span className="font-semibold text-sm">Review TimeLogs</span>
          </button>
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        custom={8}
        className="p-5 rounded-2xl shadow-sm border border-slate-200/50 bg-white"
      >
        <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 mb-4">
          <TasksIcon className="w-5 h-5 text-blue-600" strokeWidth={2} />
          Active Workload Backlogs
        </h2>
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50/70 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-3 text-left tracking-wide">Task Node</th>
                <th className="px-4 py-3 text-left tracking-wide">
                  Project Context
                </th>
                <th className="px-4 py-3 text-left tracking-wide">
                  Assigned Operator
                </th>
                <th className="px-4 py-3 text-left tracking-wide">
                  Lifecycle Stage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
              {assignedTasks.filter((t) => t.status !== "completed").length >
              0 ? (
                assignedTasks
                  .filter((t) => t.status !== "completed")
                  .map((task) => (
                    <tr
                      key={task._id}
                      className="hover:bg-slate-50/50 transition duration-150"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {task.title}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {typeof task.project === "string"
                          ? task.project
                          : task.project?.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {typeof task.assignedTo === "string"
                          ? task.assignedTo
                          : task.assignedTo?.name || "Unassigned"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            task.status === "in-progress"
                              ? "bg-blue-50 text-blue-700 border-blue-200/40"
                              : task.status === "todo"
                                ? "bg-amber-50 text-amber-700 border-amber-200/40"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200/40"
                          }`}
                        >
                          {task.status === "in-progress"
                            ? "In Progress"
                            : task.status === "todo"
                              ? "Todo"
                              : "Completed"}
                        </span>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-slate-400 italic"
                  >
                    No active task branches assigned under your streams.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default ManagerDashboard;
