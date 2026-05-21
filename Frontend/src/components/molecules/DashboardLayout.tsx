import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import Sidebar from "../atoms/Sidebar";
import Header from "../atoms/Header";
import type { RootState, AppDispatch } from "../../store/store";
import { getCurrentUser } from "../../Reducers/AuthReducers";
import { Menu, X } from "lucide-react";

const DashboardLayout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, loading, token } = useSelector(
    (state: RootState) => state.auth,
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (token && !user) {
      dispatch(getCurrentUser());
    }
  }, [token, user, dispatch]);

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  useEffect(() => {
  setIsSidebarOpen(false); // જ્યારે પણ પેજ બદલાય ત્યારે સાઇડબાર બંધ થઈ જશે
}, [location]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-gray-100 text-gray-700 px-4">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-indigo-600 border-t-transparent" />
        <span className="ml-3 text-sm sm:text-base">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden relative">
      <div
        className={`
          fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
          md:relative md:transform-none md:z-auto
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <Sidebar />
      </div>

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <div className="flex items-center w-full bg-white border-b border-slate-100 md:border-none">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-3 ml-2 text-slate-600 hover:text-indigo-600 focus:outline-none md:hidden shrink-0"
          >
            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="flex-1 min-w-0">
            <Header />
          </div>
        </div>

        <main className="flex-1 custom-scrollbar overflow-x-hidden overflow-y-auto p-3 sm:p-5 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
