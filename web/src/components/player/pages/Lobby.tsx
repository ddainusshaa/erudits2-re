import { useEffect, useState } from "react";
import { SpinnerCircularFixed } from "spinners-react";
import { PlayerLocalStorage } from "../enum/PlayerLocalStorage";
import { IGameSessionStorage } from "../interface/IGameSessionStorage";
import { constants } from "../../../constants";
import { localizeError } from "../../../localization";

import { usePlayer } from "../../universal/PlayerContext";

export const Lobby = () => {
  const [error, setError] = useState("");
  const [gameTitle, setGameTitle] = useState("");
  const [instanceId, setInstanceId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { playerName, setPlayerName, setPlayerId, setIsReady, isReady } =
    usePlayer();

  useEffect(() => {
    const gameSessionStorage = JSON.parse(
      localStorage.getItem(PlayerLocalStorage.currentGame) ?? "{}"
    ) as IGameSessionStorage;
    setInstanceId(gameSessionStorage.id);

    if (gameSessionStorage?.title) {
      setGameTitle(gameSessionStorage.title);
    }
  }, []);

  const readyPlayer = async () => {
    setIsLoading(true);
    setError("");
    if (playerName.trim() === "") {
      setError("Lūdzu, ievadiet spēlētāja nosaukumu!");
      setIsLoading(false);
      return;
    }
    if (playerName.trim().length > 16) {
      setError("Spēlētāja nosaukums ir pārāk garš (maks. 16 simboli).");
      setIsLoading(false);
      return;
    }
    if (await createPlayer()) {
      setIsReady(true);
      setIsLoading(false);
    }
    setIsLoading(false);
  };

  const createPlayer = async () => {
    const response = await fetch(`${constants.baseApiUrl}/create-player`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player_name: playerName,
        instance_id: instanceId,
      }),
    });
    const data = await response.json();

    if (response.ok) {
      const normalizedPlayerName = playerName.trim();
      localStorage.setItem(
        PlayerLocalStorage.currentPlayer,
        JSON.stringify({
          id: data.id,
          name: normalizedPlayerName,
        })
      );
      setPlayerName(normalizedPlayerName);
      setPlayerId(data.id);
      return true;
    }

    const rawErrorMessage =
      data?.error ?? data?.message ?? data?.errors?.player_name?.[0];

    setError(localizeError(rawErrorMessage ?? "Kļūda veidojot spēlētāju"));
    return false;
  };

  return (
    <div className="w-full min-h-[calc(100dvh-2rem)] flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-white/55 bg-white/45 backdrop-blur-md shadow-[0_20px_45px_rgba(15,23,42,0.16)] p-4 sm:p-5">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col place-items-center justify-center text-slate-800 p-6 bg-white/88 rounded-xl border border-white/70 shadow-lg">
            <p className="font-medium text-slate-500 text-sm uppercase tracking-wider mb-2">Jūs esat pievienojušies spēlei</p>
            <p className="font-extrabold text-2xl sm:text-3xl text-center text-[#E812FF]">{gameTitle}</p>
          </div>

          <div className="flex flex-col gap-6 p-6 sm:p-8 bg-white/88 rounded-xl border border-white/70 shadow-lg">
            <div className="flex flex-col gap-3">
              <label
                htmlFor="playername"
                className="font-semibold text-slate-700 text-sm"
              >
                Lūdzu, ievadiet spēlētāja nosaukumu:
              </label>
              <input
                disabled={isReady}
                id="playername"
                className="w-full h-14 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded px-4 text-center text-xl focus:outline-none focus:ring-2 focus:ring-[#E812FF] focus:border-transparent transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                placeholder="Pēteris"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>

            <div className="flex justify-center mt-2">
              {!isReady && !isLoading && (
                <button
                  onClick={readyPlayer}
                  className={`w-full h-14 rounded text-xl font-bold flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#0F9A09] focus:ring-offset-2 ${
                    !!playerName.length
                      ? "bg-[#0F9A09] text-white hover:brightness-95 shadow-lg"
                      : "bg-slate-200 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  Gatavs spēlei
                </button>
              )}
              {isLoading && (
                <button className="w-full h-14 rounded text-xl font-bold text-white bg-[#0F9A09] flex items-center justify-center cursor-not-allowed opacity-80">
                  <SpinnerCircularFixed color="#ffffff" size={28} thickness={160} />
                </button>
              )}
              {isReady && (
                <div className="w-full flex justify-center items-center h-14 rounded bg-[#91FF00]/20 text-[#0F9A09] border border-[#91FF00]/50 font-bold gap-3">
                  <SpinnerCircularFixed color="#0F9A09" size={24} thickness={160} />
                  Gaidām pārējos...
                </div>
              )}
            </div>

            {error && (
              <p className="text-center font-medium py-2 px-4 rounded bg-[#F0EDCA] text-[#0F9A09] border border-[#E812FF]/40">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
