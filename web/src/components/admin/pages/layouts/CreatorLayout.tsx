import { Sidebar } from "../../ui/sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import { BreadCrumbs } from "../../../universal/BreadCrumbs";
import { AdminSidebarProvider } from "../../../universal/AdminGameSidebarContext";

export const CreatorLayout = () => {
  return (
    <AdminSidebarProvider>
      <div className="flex flex-col h-[100dvh] max-h-[100dvh] w-full overflow-hidden font-sans bg-slate-950 text-slate-100">
        <div className="w-full bg-slate-900 border-b border-slate-700 px-6 py-4">
          <BreadCrumbs />
        </div>
        <div className="flex flex-col md:flex-row gap-4 p-4 flex-1 min-h-0">
          <div className="w-full md:w-[360px] md:min-w-[300px] rounded border border-slate-700 bg-slate-900 shadow-sm overflow-hidden flex flex-col min-h-0">
            <Sidebar />
          </div>
          <div className="flex-1 rounded border border-slate-700 bg-slate-900 shadow-sm p-4 overflow-auto min-h-0 admin-scrollbar">
            <Outlet />
          </div>
        </div>
      </div>
    </AdminSidebarProvider>
  );
};
