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
import { ProjectIcon, TasksIcon } from "../../Icons/SidebarIcon";
import { ClockIcon } from "../../Icons/DashboardIcons";
import { Loader2 } from "lucide-react";
import { getAllProjects } from "../../Reducers/ProjectReducers";
import { getAllTasks } from "../../Reducers/TaskReducers";
import { getAllLogs } from "../../Reducers/TimeLogsReducers";
import { getCurrentUser } from "../../Reducers/UserReducers";
import { format, subDays } from "date-fns";
import type { Project } from "../../Reducers/ProjectReducers";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};
const cardHover = { hover: { scale: 1.02, transition: { duration: 0.2 } } };

const EmployeeDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
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

  const myProjects = useMemo(() => {
    if (!user) return [];
    return projects.filter((p: Project) =>
      p.members?.some((m: string | { _id: string }) =>
        typeof m === "string" ? m === user._id : m._id === user._id,
      ),
    );
  }, [projects, user]);

  const myTasks = useMemo(() => {
    if (!user) return [];
    return tasks.filter((t) => {
      if (!t.assignedTo) return false;
      return typeof t.assignedTo === "string"
        ? t.assignedTo === user._id
        : t.assignedTo?._id === user._id;
    });
  }, [tasks, user]);

  const myLogs = useMemo(() => {
    if (!user) return [];
    return timelogs.filter((l) =>
      l.user
        ? typeof l.user === "string"
          ? l.user === user._id
          : l.user._id === user._id
        : false,
    );
  }, [timelogs, user]);

  const projectCount = myProjects.length;
  const taskCount = myTasks.length;
  const timelogCount = myLogs.length;

  const weeklyTasksData = useMemo(() => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(today, 6 - i);
      return { name: format(date, "EEE"), date, tasks: 0 };
    });

    myTasks.forEach((task) => {
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
  }, [myTasks]);

  const weeklyTimeLogsData = useMemo(() => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(today, 6 - i);
      return { name: format(date, "EEE"), date, logs: 0 };
    });

    myLogs.forEach((log) => {
      const logDate = log.startTime ? new Date(log.startTime) : null;
      if (logDate) {
        const dayObj = last7Days.find(
          (d) => format(d.date, "yyyy-MM-dd") === format(logDate, "yyyy-MM-dd"),
        );
        if (dayObj) dayObj.logs += 1;
      }
    });

    return last7Days;
  }, [myLogs]);

  if (projectLoading || taskLoading || timelogLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600 font-medium px-4">
        <Loader2 className="w-7 h-7 sm:w-8 h-8 animate-spin text-blue-600 mb-2" />
        <span className="text-xs sm:text-sm text-center">
          Loading employee telemetry...
        </span>
      </div>
    );
  }

  const summaryCards = [
    {
      title: "My Active Projects",
      value: projectCount,
      icon: <ProjectIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      title: "Assigned Workloads",
      value: taskCount,
      icon: <TasksIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      title: "Logged Sessions",
      value: timelogCount,
      icon: <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
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
          <span className="text-blue-700">{user?.name || "User"}</span>!
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          PulseWork Employee Production Hub
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={4}
          className="p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200/50 bg-white flex flex-col"
        >
          <h2 className="text-sm sm:text-base font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2.5 sm:pb-3 truncate">
            My Weekly Tasks Flow
          </h2>
          <div className="w-full h-[180px] sm:h-[220px]">
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
                  stroke="#16a34a"
                  strokeWidth={2.5}
                  dot={{
                    r: 3.5,
                    stroke: "#16a34a",
                    strokeWidth: 1.5,
                    fill: "#fff",
                  }}
                  activeDot={{ r: 5 }}
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
          className="p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200/50 bg-white flex flex-col"
        >
          <h2 className="text-sm sm:text-base font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2.5 sm:pb-3 truncate">
            My Weekly TimeLogs Metric
          </h2>
          <div className="w-full h-[180px] sm:h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={weeklyTimeLogsData}
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
                  dataKey="logs"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{
                    r: 3.5,
                    stroke: "#3b82f6",
                    strokeWidth: 1.5,
                    fill: "#fff",
                  }}
                  activeDot={{ r: 5 }}
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
        custom={6}
        className="p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/50 bg-white"
      >
        <h2 className="text-base sm:text-lg font-bold text-slate-700 flex items-center gap-2 mb-4">
          <TasksIcon
            className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0"
            strokeWidth={2}
          />
          My Operational Pipelines (Active)
        </h2>
        <div className="overflow-x-auto rounded-xl border border-slate-100 -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-slate-100 text-xs sm:text-sm">
              <thead className="bg-slate-50/70 text-slate-500 font-medium">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left tracking-wide whitespace-nowrap">
                    Task Node
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left tracking-wide whitespace-nowrap">
                    Project Context
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left tracking-wide whitespace-nowrap">
                    Lifecycle Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {myTasks.filter((t) => t.status !== "completed").length > 0 ? (
                  myTasks
                    .filter((t) => t.status !== "completed")
                    .map((task) => (
                      <tr
                        key={task._id}
                        className="hover:bg-slate-50/50 transition duration-150"
                      >
                        <td className="px-3 sm:px-4 py-3 font-semibold text-slate-800 whitespace-nowrap max-w-[150px] truncate">
                          {task.title}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-slate-600 whitespace-nowrap max-w-[150px] truncate">
                          {typeof task.project === "string"
                            ? task.project
                            : task.project?.name}
                        </td>
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border ${
                              task.status === "in-progress"
                                ? "bg-amber-50 text-amber-700 border-amber-200/40"
                                : task.status === "todo"
                                  ? "bg-slate-50 text-slate-600 border-slate-200/40"
                                  : "bg-blue-50 text-blue-700 border-blue-200/40"
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
                      colSpan={3}
                      className="px-4 py-8 text-center text-slate-400 italic"
                    >
                      No operational branches in current queue.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmployeeDashboard;
