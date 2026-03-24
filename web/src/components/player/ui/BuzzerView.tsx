import { useEffect } from "react";
import { constants } from "../../../constants";
import { PlayerLocalStorage } from "../enum/PlayerLocalStorage";
import { usePlayer } from "../../universal/PlayerContext";
export const BuzzerView = () => {
  const { buzzerEnabled, setBuzzerEnabled } = usePlayer();

  const handleBuzz = async () => {
    if (!buzzerEnabled) return;
    setBuzzerEnabled(false);

    const player = JSON.parse(
      localStorage.getItem(PlayerLocalStorage.currentPlayer) || "{}"
    );

    const instance = JSON.parse(
      localStorage.getItem(PlayerLocalStorage.currentGame) || "{}"
    );

    const response = await fetch(`${constants.baseApiUrl}/buzz`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem(
          constants.localStorage.TOKEN
        )}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player_id: player.id,
        instance_id: instance.id,
        buzzed_at: new Date().getTime(),
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      if (data.message === "Another buzzer was faster!") {
        setBuzzerEnabled(true);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        handleBuzz();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="bg-white fade-in-short rounded shadow-2xl place-items-center p-8 flex w-full max-w-2xl grow m-4 sm:m-12 flex-col gap-8 border border-slate-200">
      <p className="text-slate-600 font-semibold text-lg text-center">
        Spied pogu vai tastatūras 'Atstarpi', lai atbildētu!
      </p>
      <button
        key={buzzerEnabled?.toString()}
        disabled={!buzzerEnabled}
        onClick={handleBuzz}
        className={`w-full h-80 rounded text-white font-bold text-4xl uppercase tracking-widest shadow-2xl transition-all focus:outline-none focus:ring-4 focus:ring-offset-4 focus:ring-offset-white ${
          !buzzerEnabled
            ? "bg-slate-200 text-slate-500 cursor-not-allowed border-slate-300 shadow-none border"
            : "bg-[#E812FF] hover:brightness-95 active:scale-95 shadow-[#E812FF]/40"
        }`}
      >
        {!!buzzerEnabled && "Spied!"}
      </button>
    </div>
  );
};
