"use client";

import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  pauseLog,
  resumeLog,
  startLog,
  stopLog,
} from "../../Reducers/TimeLogsReducers";
import { getAllTasks } from "../../Reducers/TaskReducers";
import toast from "react-hot-toast";
import { CustomDropdown } from "../../components/atoms/CustomDropdown";
import { motion, AnimatePresence } from "framer-motion";

const TimerPopup: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentLog, loading } = useSelector(
    (state: RootState) => state.workLogs,
  );
  const { tasks } = useSelector((state: RootState) => state.tasks);

  const [seconds, setSeconds] = useState(0);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const hasStartedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    dispatch(getAllTasks());
  }, [dispatch]);

  useEffect(() => {
    if (currentLog?.status === "running") {
      if (!intervalRef.current) {
        intervalRef.current = setInterval(
          () => setSeconds((prev) => prev + 1),
          1000,
        );
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentLog?.status]);

  useEffect(() => {
    if (currentLog?.status === "stopped") {
      setSeconds(0);
      toast.success("Timer stopped");
      window.close();
    }
  }, [currentLog?.status]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    if (!selectedProject) return toast.error("Select a project first");
    if (!selectedTask) return toast.error("Select a task first");
    if (!hasStartedRef.current) {
      setSeconds(0);
      dispatch(startLog(selectedTask));
      toast.success("Timer started");
      hasStartedRef.current = true;
    }
  };

  const handlePause = () => {
    if (!currentLog?._id || currentLog.status !== "running") return;
    dispatch(pauseLog(currentLog._id));
    toast("Paused ⏸️");
  };

  const handleResume = () => {
    if (!currentLog?._id || currentLog.status !== "paused") return;
    dispatch(resumeLog(currentLog._id));
    toast("Resumed");
  };

  const handleStop = () => {
    if (!currentLog?._id || currentLog.status === "stopped") return;
    dispatch(stopLog(currentLog._id));
    setSeconds(0);
    toast.success("Stopped");
  };

  const handleCancel = () => {
    toast("Closed without stopping");
    window.close();
  };

  const projectOptions = [
    ...new Map(
      tasks
        .filter((t) => t.project && typeof t.project !== "string")
        .map((t) => [
          (t.project as { _id: string; name: string })._id,
          {
            label: (t.project as { _id: string; name: string }).name,
            value: (t.project as { _id: string; name: string })._id,
          },
        ]),
    ).values(),
  ];

  return (
    <motion.div
      className="min-h-screen w-full flex flex-col bg-gray-50 overflow-y-auto px-4 py-4 md:py-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white py-3.5 px-5 rounded-2xl md:rounded-none flex justify-between items-center shadow-md w-full shrink-0"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-lg md:text-2xl font-bold tracking-wide">⏱ Timer</h1>
      </motion.div>

      <motion.div
        className="w-full pt-6 px-2 flex flex-col sm:flex-row gap-3.5 justify-center items-center shrink-0"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="w-full sm:max-w-xs">
          <CustomDropdown
            options={projectOptions}
            selected={selectedProject}
            onSelect={(val) => {
              setSelectedProject(val);
              setSelectedTask("");
            }}
            placeholder="Select Project"
            disabled={!!currentLog && currentLog.status !== "stopped"}
          />
        </div>
        <div className="w-full sm:max-w-xs">
          <CustomDropdown
            options={tasks
              .filter(
                (t) =>
                  t.project &&
                  typeof t.project !== "string" &&
                  t.project._id === selectedProject,
              )
              .map((t) => ({ label: t.title, value: t._id }))}
            selected={selectedTask}
            onSelect={setSelectedTask}
            placeholder="Select Task"
            disabled={!!currentLog && currentLog.status !== "stopped"}
          />
        </div>
      </motion.div>

      <motion.div
        className="flex-1 flex flex-col justify-center items-center my-auto py-8 w-full"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <motion.div
          className="text-5xl xs:text-6xl sm:text-7xl md:text-8xl font-mono font-extrabold mb-8 text-gray-800 select-all text-center tracking-tight"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          {formatTime(seconds)}
        </motion.div>

        <div className="flex flex-col xs:flex-row flex-wrap gap-3 w-full max-w-[280px] xs:max-w-sm justify-center">
          <AnimatePresence mode="popLayout">
            {!currentLog && (
              <motion.button
                key="start-btn"
                onClick={handleStart}
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm sm:text-base shadow-lg w-full xs:w-auto"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={loading}
              >
                Start
              </motion.button>
            )}
            {currentLog?.status === "running" && (
              <motion.button
                key="pause-btn"
                onClick={handlePause}
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-semibold text-sm sm:text-base shadow-lg w-full xs:w-auto"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={loading}
              >
                Pause
              </motion.button>
            )}
            {currentLog?.status === "paused" && (
              <motion.button
                key="resume-btn"
                onClick={handleResume}
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm sm:text-base shadow-lg w-full xs:w-auto"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={loading}
              >
                Resume
              </motion.button>
            )}
            {currentLog && currentLog.status !== "stopped" && (
              <motion.button
                key="stop-btn"
                onClick={handleStop}
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm sm:text-base shadow-lg w-full xs:w-auto"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={loading}
              >
                Stop
              </motion.button>
            )}
            <motion.button
              key="cancel-btn"
              onClick={handleCancel}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gray-400 hover:bg-gray-500 text-white rounded-xl font-semibold text-sm sm:text-base shadow-lg w-full xs:w-auto"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Cancel
            </motion.button>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TimerPopup;
