import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  getAllSummaries,
  clearTimeLogError,
  clearTimeLogSuccess,
} from "../../Reducers/TimeLogsReducers";
import { getAllTasks } from "../../Reducers/TaskReducers";
import toast, { Toaster } from "react-hot-toast";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

const EmployeeWorkLogs: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { error, success, currentLog, summaries } = useSelector(
    (state: RootState) => state.workLogs,
  );

  useEffect(() => {
    dispatch(getAllSummaries());
    dispatch(getAllTasks());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearTimeLogError());
    }
    if (success) {
      toast.success("Logs synchronized successfully ✨");
      dispatch(clearTimeLogSuccess());
    }
  }, [error, success, dispatch]);

  const handleStart = () => {
    const url = `/employee/timer-popup`;
    const target = "TimerPopup";
    const features =
      "width=450,height=470,resizable=yes,scrollbars=no,status=no";

    const timerWindow = window.open(url, target, features);

    if (
      !timerWindow ||
      timerWindow.closed ||
      typeof timerWindow.closed === "undefined"
    ) {
      toast.error(
        "Popup blocked! Please allow popups in your browser settings to open the timer window.",
        {
          duration: 5000,
        },
      );
    } else {
      timerWindow.focus();
    }
  };

  const formatHHMM = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const calendarEvents = summaries
    ? summaries.map((s) => ({
        id: s.date,
        title: `⏱️ ${s.formatted || formatHHMM(s.totalHours * 3600)} | 📝 ${s.taskCount}`,
        start: s.date,
        allDay: true,
        backgroundColor: "#e0f2fe",
        textColor: "#0369a1",
        borderColor: "#bae6fd",
      }))
    : [];

  return (
    <motion.div
      className="p-3 sm:p-5 md:p-6 bg-slate-50/50 min-h-screen space-y-5 sm:space-y-6 overflow-x-hidden"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Toaster position="bottom-right" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
            My Work Calendar
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 truncate">
            Audit daily timeline summary matrices and productivity logs
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStart}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition shrink-0 w-full sm:w-auto self-start sm:self-auto"
        >
          <Play size={14} fill="white" className="shrink-0" />
          <span>Start Tracker Window</span>
        </motion.button>
      </div>

      {currentLog?.status === "running" && (
        <motion.div
          className="p-3.5 sm:p-4 rounded-xl bg-amber-50 border border-amber-200/60 shadow-sm flex items-center gap-2 w-full"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <span className="relative flex h-2 w-2 shrink-0 mt-0.5 sm:mt-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <p className="text-xs sm:text-sm font-semibold text-amber-800 leading-tight min-w-0 flex-1 truncate">
            Active Tracker Pipeline Running:{" "}
            <span className="text-amber-950 underline font-bold decoration-amber-400/50 underline-offset-2 ml-0.5 break-all">
              {currentLog.task?.title}
            </span>
          </p>
        </motion.div>
      )}

      <motion.div
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 sm:p-5 md:p-6 min-h-[450px] sm:min-h-[500px] pulsework-calendar-wrapper -mx-4 sm:mx-0 w-[calc(100%+2rem)] sm:w-full"
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      >
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth",
          }}
          events={calendarEvents}
          height="auto"
          editable={false}
          selectable={false}
          dayMaxEvents={true}
        />

        <style>{`
          .fc .fc-toolbar {
            flex-direction: column;
            gap: 0.75rem;
            width: 100%;
          }
          .fc .fc-toolbar-title {
            font-size: 1.15rem;
            font-weight: 800;
            color: #1e293b;
            text-align: center;
          }
          .fc .fc-button {
            padding: 0.35rem 0.65rem;
            font-size: 0.8rem;
            font-weight: 600;
            border-radius: 0.5rem !important;
            text-transform: capitalize;
          }
          .fc .fc-toolbar-chunk {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.25rem;
            width: 100%;
          }
          .fc .fc-event {
            padding: 2px 4px;
            font-size: 10px !important;
            font-weight: 700;
            border-radius: 6px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          @media (min-width: 640px) {
            .fc .fc-toolbar {
              flex-direction: row;
              justify-content: space-between;
              gap: 0;
            }
            .fc .fc-toolbar-title {
              font-size: 1.5rem;
            }
            .fc .fc-toolbar-chunk {
              width: auto;
            }
            .fc .fc-event {
              font-size: 12px !important;
              padding: 3px 6px;
            }
          }
        `}</style>
      </motion.div>
    </motion.div>
  );
};

export default EmployeeWorkLogs;
