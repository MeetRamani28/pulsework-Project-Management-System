import React from "react";
import TimerPopup from "../../components/molecules/TimerPopup";

const TimerPopupPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-3 sm:p-4 overflow-y-auto select-none">
      <div className="w-full max-w-[340px] xs:max-w-sm sm:max-w-md bg-white rounded-2xl border border-slate-200/60 shadow-xl p-4 sm:p-5 md:p-6 my-auto transition-all duration-300">
        <div className="mb-4 border-b border-slate-100 pb-2.5 sm:pb-3 flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest truncate">
              PulseWork Tracker Node
            </span>
          </div>
          <span className="text-[9px] sm:text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono shrink-0">
            v1.0.0
          </span>
        </div>

        <div className="w-full">
          <TimerPopup />
        </div>
      </div>
    </div>
  );
};

export default TimerPopupPage;
