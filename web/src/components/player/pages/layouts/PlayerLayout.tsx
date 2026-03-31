import { Outlet } from "react-router-dom";
import { PlayerProvider, usePlayer } from "../../../universal/PlayerContext";

export const PlayerLayout = () => {
  return (
    <div className="app-theme-bg box-border flex min-h-[100dvh] w-full justify-center text-slate-800 font-sans antialiased overflow-x-hidden p-4">
      <PlayerProvider>
        <PlayerLayoutContent />
      </PlayerProvider>
    </div>
  );
};

const PlayerLayoutContent = () => {
  const { isRealtimeConnected, reconnectRealtime } = usePlayer();

  return (
    <div className="app-theme-content w-full flex justify-center">
      {!isRealtimeConnected && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-md px-4 py-3 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-slate-700">
              Savienojums pārtrūka
            </div>
            <button
              onClick={reconnectRealtime}
              className="h-9 px-3 rounded bg-[#0F9A09] text-white text-sm font-semibold hover:brightness-95"
            >
              Atjaunot
            </button>
          </div>
        </div>
      )}
      <Outlet />
    </div>
  );
};
