import { Outlet } from "react-router-dom";
import { PlayerProvider } from "../../../universal/PlayerContext";

export const PlayerLayout = () => {
  return (
    <div className="app-theme-bg flex min-h-[100dvh] w-full justify-center text-slate-800 font-sans antialiased overflow-x-hidden p-4">
      <PlayerProvider>
        <div className="app-theme-content w-full flex justify-center">
          <Outlet />
        </div>
      </PlayerProvider>
    </div>
  );
};
