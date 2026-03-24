import { PlayerLocalStorage } from "../enum/PlayerLocalStorage";

export const Disqualified = () => {
  const exitGame = () => {
    localStorage.removeItem(PlayerLocalStorage.currentGame);
    localStorage.removeItem(PlayerLocalStorage.currentPlayer);
    window.location.assign("/");
  };

  return (
    <div className="flex flex-col w-full h-full gap-6">
      <p className="px-12 py-6 bg-white border border-slate-200 rounded text-center mx-auto text-slate-800 font-bold text-4xl shadow-md">
        Jūs esat diskvalificēti.
      </p>
      <button
        onClick={exitGame}
        className="bg-[#E812FF] text-white h-10 w-40 mx-auto rounded font-semibold hover:brightness-95"
      >
        Atgriezties
      </button>
    </div>
  );
};
