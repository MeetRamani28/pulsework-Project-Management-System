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
import { Users, BarChart, PlusCircle } from "../../Icons/DashboardIcons";
import { ProjectIcon, TasksIcon } from "../../Icons/SidebarIcon";
import { useNavigate } from "react-router-dom";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  startOfWeek,
  endOfWeek,
  eachWeekOfInterval,
  subDays,
} from "date-fns";

import { getAllProjects } from "../../Reducers/ProjectReducers";
import { getAllTasks } from "../../Reducers/TaskReducers";
import { getAllUsers } from "../../Reducers/UserReducers";
import { getCurrentUser } from "../../Reducers/UserReducers";
import { User } from "../../Icons/User";
import { Loader2 } from "lucide-react";

interface TaskChartData {
  name: string;
  tasks: number;
}
interface UserGrowthData {
  name: string;
  users: number;
}
interface ProjectCompletionData {
  name: string;
  completed: number;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const cardHover = {
  hover: { scale: 1.02, transition: { duration: 0.2 } },
};

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user } = useSelector((state: RootState) => state.auth);
  const { projects, loading: projectLoading } = useSelector(
    (state: RootState) => state.projects,
  );
  const { tasks, loading: taskLoading } = useSelector(
    (state: RootState) => state.tasks,
  );
  const { users, loading: userLoading } = useSelector(
    (state: RootState) => state.users,
  );

  useEffect(() => {
    dispatch(getAllProjects());
    dispatch(getAllTasks());
    dispatch(getAllUsers());
    dispatch(getCurrentUser());
  }, [dispatch]);

  const projectCount = projects?.length || 0;
  const taskCount = tasks?.length || 0;
  const userCount = users?.length || 0;

  const weeklyTasksData: TaskChartData[] = useMemo(() => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(today, 6 - i);
      return { name: format(date, "EEE"), date, tasks: 0 };
    });

    if (tasks && Array.isArray(tasks)) {
      tasks.forEach((task) => {
        const taskDate = task.createdAt ? new Date(task.createdAt) : null;
        if (taskDate) {
          const dayObj = last7Days.find(
            (d) =>
              format(d.date, "yyyy-MM-dd") === format(taskDate, "yyyy-MM-dd"),
          );
          if (dayObj) dayObj.tasks += 1;
        }
      });
    }

    return last7Days;
  }, [tasks]);

  const userGrowthData: UserGrowthData[] = useMemo(() => {
    if (!users || users.length === 0) return [];

    const validUsers = users.filter(
      (u): u is typeof u & { createdAt: string } => !!u.createdAt,
    );

    if (validUsers.length === 0) return [];

    const dates = validUsers.map((u) => new Date(u.createdAt!));
    const start = startOfWeek(
      new Date(Math.min(...dates.map((d) => d.getTime()))),
    );
    const end = endOfWeek(new Date(Math.max(...dates.map((d) => d.getTime()))));
    const weeks = eachWeekOfInterval({ start, end });

    return weeks.map((weekDate) => {
      const weekLabel = `W${format(weekDate, "w yy")}`;
      const usersCount = validUsers.filter(
        (u) =>
          format(new Date(u.createdAt!), "w yyyy") ===
          format(weekDate, "w yyyy"),
      ).length;
      return { name: weekLabel, users: usersCount };
    });
  }, [users]);

  const completedProjectsData: ProjectCompletionData[] = useMemo(() => {
    if (!projects || projects.length === 0) return [];

    const validProjects = projects.filter(
      (p): p is typeof p & { createdAt: string } => !!p.createdAt,
    );

    if (validProjects.length === 0) return [];

    const dates = validProjects.map((p) => new Date(p.createdAt!));
    const start = startOfMonth(
      new Date(Math.min(...dates.map((d) => d.getTime()))),
    );
    const end = endOfMonth(
      new Date(Math.max(...dates.map((d) => d.getTime()))),
    );
    const months = eachMonthOfInterval({ start, end });

    return months.map((monthDate) => {
      const monthLabel = format(monthDate, "MMM yy");
      const completedCount = validProjects.filter(
        (p) =>
          p.status === "completed" &&
          format(new Date(p.createdAt!), "MMM yyyy") ===
            format(monthDate, "MMM yyyy"),
      ).length;
      return { name: monthLabel, completed: completedCount };
    });
  }, [projects]);

  if (projectLoading || taskLoading || userLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600 font-medium px-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <span className="text-sm sm:text-base text-center">
          Loading dashboard data...
        </span>
      </div>
    );
  }

  const summaryCards = [
    {
      title: "Projects",
      value: projectCount,
      icon: <ProjectIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      title: "Tasks",
      value: taskCount,
      icon: <BarChart className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      title: "Users",
      value: userCount,
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
  ];

  return (
    <div className="w-full min-h-screen p-3 sm:p-5 md:p-6 bg-gradient-to-br from-blue-50 to-blue-100 space-y-5 sm:space-y-6 overflow-x-hidden">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        custom={0}
        className="text-left md:text-center pt-1"
      >
        <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent drop-shadow-sm leading-tight">
          Welcome back,{" "}
          <span className="text-blue-700">{user?.name || "Admin"}</span>!
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          PulseWork Management Dashboard Console
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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
              className="p-4 sm:p-5 shadow-sm rounded-2xl bg-white border border-slate-200/50 flex items-center justify-between hover:shadow-md transition-all duration-200"
              variants={cardHover}
            >
              <div className="min-w-0">
                <p className="text-[10px] sm:text-sm font-semibold uppercase tracking-wider text-slate-400 truncate">
                  {card.title}
                </p>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mt-0.5 sm:mt-1">
                  {card.value}
                </h2>
              </div>
              <div className="text-blue-600 bg-blue-50 p-2.5 sm:p-3 rounded-xl shrink-0 ml-2">
                {card.icon}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={4}
          className="w-full p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200/50 bg-white flex flex-col"
        >
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2.5 sm:pb-3">
            <BarChart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
            <h2 className="text-sm sm:text-base font-bold text-slate-700 truncate">
              Weekly Performance Overview
            </h2>
          </div>
          <div className="w-full h-[200px] sm:h-[240px]">
            {weeklyTasksData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={weeklyTasksData}
                  margin={{ left: -25, right: 10, top: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    allowDecimals={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="tasks"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{
                      r: 3.5,
                      stroke: "#2563eb",
                      strokeWidth: 1.5,
                      fill: "#fff",
                    }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 italic text-xs sm:text-sm">
                No Performance Data
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            custom={5}
            className="p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200/50 bg-white flex flex-col"
          >
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2.5 sm:pb-3">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-slate-700 truncate">
                User Acquisition Metrics
              </h2>
            </div>
            <div className="w-full h-[160px] sm:h-[180px]">
              {userGrowthData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={userGrowthData}
                    margin={{ left: -30, right: 10, top: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={10}
                      allowDecimals={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{
                        r: 3.5,
                        stroke: "#10b981",
                        strokeWidth: 1.5,
                        fill: "#fff",
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 italic text-xs sm:text-sm">
                  No Growth Data
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            custom={6}
            className="p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200/50 bg-white flex flex-col"
          >
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2.5 sm:pb-3">
              <ProjectIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-slate-700 truncate">
                Project Fulfillment Track
              </h2>
            </div>
            <div className="w-full h-[160px] sm:h-[180px]">
              {completedProjectsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={completedProjectsData}
                    margin={{ left: -30, right: 10, top: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={10}
                      allowDecimals={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={{
                        r: 3.5,
                        stroke: "#f59e0b",
                        strokeWidth: 1.5,
                        fill: "#fff",
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 italic text-xs sm:text-sm">
                  No Analytics Recorded
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        custom={7}
        className="p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/50 bg-white"
      >
        <h2 className="text-base sm:text-lg font-bold text-slate-700 flex items-center gap-2 mb-4">
          <TasksIcon
            className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0"
            strokeWidth={2}
          />
          Active Context Workloads
        </h2>
        <div className="overflow-x-auto rounded-xl border border-slate-100 -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-slate-100 text-xs sm:text-sm">
              <thead className="bg-slate-50/70 text-slate-500 font-medium">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left tracking-wide whitespace-nowrap">
                    Task Label
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left tracking-wide whitespace-nowrap">
                    Owner Assignment
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left tracking-wide whitespace-nowrap">
                    Lifecycle Stage
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left tracking-wide whitespace-nowrap">
                    Target Deadline
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {tasks.filter((t) => t.status === "in-progress").length > 0 ? (
                  tasks
                    .filter((t) => t.status === "in-progress")
                    .slice(0, 5)
                    .map((task) => (
                      <tr
                        key={task._id}
                        className="hover:bg-slate-50/50 transition duration-150"
                      >
                        <td className="px-3 sm:px-4 py-3 font-semibold text-slate-800 whitespace-nowrap max-w-[150px] truncate">
                          {task.title}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-slate-600 whitespace-nowrap">
                          {task.assignedTo?.name || "Unassigned"}
                        </td>
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/40">
                            In Progress
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-slate-500 whitespace-nowrap">
                          {task.deadline
                            ? new Date(task.deadline).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-slate-400 italic"
                    >
                      No active pipelines matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        custom={8}
        className="p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/50 bg-white"
      >
        <h2 className="text-base sm:text-lg font-bold text-slate-700 flex items-center gap-2 mb-4">
          <ProjectIcon
            className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0"
            strokeWidth={2}
          />
          Active Operations Streams
        </h2>
        <div className="overflow-x-auto rounded-xl border border-slate-100 -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-slate-100 text-xs sm:text-sm">
              <thead className="bg-slate-50/70 text-slate-500 font-medium">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left tracking-wide whitespace-nowrap">
                    Project Scope
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left tracking-wide whitespace-nowrap">
                    Managing Executive
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left tracking-wide whitespace-nowrap">
                    Operational Status
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left tracking-wide whitespace-nowrap">
                    Target Timeline
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {projects.filter((p) => p.status === "in-progress").length >
                0 ? (
                  projects
                    .filter((p) => p.status === "in-progress")
                    .slice(0, 5)
                    .map((project) => (
                      <tr
                        key={project._id}
                        className="hover:bg-slate-50/50 transition duration-150"
                      >
                        <td className="px-3 sm:px-4 py-3 font-semibold text-slate-800 whitespace-nowrap max-w-[150px] truncate">
                          {project.name}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-slate-600 whitespace-nowrap">
                          {typeof project.manager === "object" &&
                          "name" in project.manager
                            ? project.manager.name
                            : "N/A"}
                        </td>
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/40">
                            In Progress
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-slate-500 whitespace-nowrap">
                          {project.deadline
                            ? new Date(project.deadline).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-slate-400 italic"
                    >
                      No operational branches in current context.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <button
          onClick={() => navigate("/admin/project")}
          className="mt-4 w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition active:scale-[0.98]"
        >
          View All Projects
        </button>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        custom={9}
        className="p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/50 bg-white"
      >
        <h2 className="text-base sm:text-lg font-bold text-slate-700 flex items-center gap-2 mb-4">
          <PlusCircle
            className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0"
            strokeWidth={2}
          />
          Quick Actions Console
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          <button
            onClick={() => navigate("/admin/project")}
            className="flex items-center justify-center sm:justify-start gap-3 px-4 py-3 bg-blue-50/50 text-blue-700 rounded-xl hover:bg-blue-100/70 border border-blue-100 transition active:scale-[0.98]"
          >
            <ProjectIcon width={18} height={18} stroke="#2563eb" />
            <span className="font-semibold text-xs sm:text-sm">
              Add Project
            </span>
          </button>

          <button
            onClick={() => navigate("/admin/tasks")}
            className="flex items-center justify-center sm:justify-start gap-3 px-4 py-3 bg-emerald-50/50 text-emerald-700 rounded-xl hover:bg-emerald-100/70 border border-emerald-100 transition active:scale-[0.98]"
          >
            <TasksIcon width={18} height={18} stroke="#16a34a" />
            <span className="font-semibold text-xs sm:text-sm">Add Task</span>
          </button>

          <button
            onClick={() => navigate("/admin/user")}
            className="flex items-center justify-center sm:justify-start gap-3 px-4 py-3 bg-indigo-50/50 text-indigo-700 rounded-xl hover:bg-indigo-100/70 border border-indigo-100 transition active:scale-[0.98]"
          >
            <User width={18} height={18} stroke="blue" />
            <span className="font-semibold text-xs sm:text-sm">Add User</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
