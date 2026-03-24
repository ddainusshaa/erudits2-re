import { Sidebar } from "../../ui/sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import { BreadCrumbs } from "../../../universal/BreadCrumbs";
import { AdminSidebarProvider } from "../../../universal/AdminGameSidebarContext";

export const CreatorLayout = () => {
  return (
    <AdminSidebarProvider>
      <div className="app-theme-bg flex flex-col min-h-[100dvh] w-full overflow-x-hidden font-sans text-slate-900">
        <div className="app-theme-content w-full bg-white border-b border-slate-200 px-6 py-4">
          <BreadCrumbs />
        </div>
        <div className="app-theme-content flex flex-col md:flex-row gap-6 p-6 flex-grow">
          <div className="w-full md:w-1/4 max-w-sm rounded border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col max-h-[80vh] overflow-y-auto">
            <Sidebar />
          </div>
          <div className="flex-1 rounded border border-slate-200 bg-white shadow-sm p-6 overflow-hidden">
            <Outlet />
          </div>
        </div>
      </div>
    </AdminSidebarProvider>
  );
};
