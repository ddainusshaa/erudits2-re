import { PlayerLocalStorage } from "../enum/PlayerLocalStorage";

export const GameEnd = () => {
  const exitGame = () => {
    localStorage.removeItem(PlayerLocalStorage.currentGame);
    localStorage.removeItem(PlayerLocalStorage.currentPlayer);
    localStorage.removeItem(PlayerLocalStorage.answers);
    window.location.assign("/");
  };

  return (
    <div className="w-full min-h-[calc(100dvh-2rem)] flex items-center justify-center">
      <div className="w-full max-w-xl rounded-2xl border border-white/55 bg-white/45 backdrop-blur-md shadow-[0_20px_45px_rgba(15,23,42,0.16)] p-4 sm:p-5">
        <div className="flex flex-col gap-4 items-center bg-white/88 border border-white/70 rounded-xl shadow-lg px-6 py-8">
          <p className="text-center text-slate-800 font-bold w-full text-2xl lg:text-4xl">
            Spēle ir noslēgusies.
          </p>
          <button
            onClick={exitGame}
            className="bg-[#0F9A09] text-white h-10 w-40 rounded font-semibold hover:brightness-95"
          >
            Atgriezties
          </button>
        </div>
      </div>
    </div>
  );
};
