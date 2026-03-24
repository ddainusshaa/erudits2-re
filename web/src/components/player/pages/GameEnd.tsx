import { PlayerLocalStorage } from "../enum/PlayerLocalStorage";

export const GameEnd = () => {
  const exitGame = () => {
    localStorage.removeItem(PlayerLocalStorage.currentGame);
    window.location.assign("/");
  };

  return (
    <div className="flex flex-col w-full h-full gap-6">
      <p className="px-12 py-6 bg-white border border-slate-200 rounded text-center mx-auto text-slate-800 font-bold w-full lg:w-auto text-2xl lg:text-4xl shadow-md">
        Spēle ir noslēgusies.
      </p>
      <button
        onClick={exitGame}
        className="bg-[#0F9A09] text-white h-10 w-40 mx-auto rounded font-semibold hover:brightness-95"
      >
        Atgriezties
      </button>
    </div>
  );
};
