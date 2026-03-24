import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SpinnerCircularFixed } from "spinners-react";
import { constants } from "../../../constants";
import { PlayerLocalStorage } from "../enum/PlayerLocalStorage";
import { IGameSessionStorage } from "../interface/IGameSessionStorage";

interface IPlayerStorage {
  id?: string;
  name?: string;
}

export const LandingPage = () => {
  const accentMagenta = "#E812FF";
  const accentGreen = "#0F9A09";
  const accentLime = "#91FF00";
  const accentSand = "#F0EDCA";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [existingGameCode, setExistingGameCode] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const validateStoredSession = async () => {
      const gameSessionStorage = JSON.parse(
        localStorage.getItem(PlayerLocalStorage.currentGame) ?? "{}"
      ) as IGameSessionStorage;

      if (!gameSessionStorage?.id) {
        setExistingGameCode("");
        return;
      }

      try {
        const response = await fetch(
          `${constants.baseApiUrl}/round-info/${gameSessionStorage.id}`
        );

        if (response.ok) {
          setExistingGameCode(gameSessionStorage.id);
          return;
        }
      } catch {
        // Intentionally ignore and clear stale session below.
      }

      localStorage.removeItem(PlayerLocalStorage.currentGame);
      localStorage.removeItem(PlayerLocalStorage.currentPlayer);
      localStorage.removeItem(PlayerLocalStorage.answers);
      setExistingGameCode("");
    };

    validateStoredSession();
  }, []);

  const postJoin = async (joinCode: string) => {
    setIsLoading(true);
    setError("");

    const trimmedCode = joinCode.trim().toUpperCase();
    if (trimmedCode.length < 3) {
      setError("Ludzu ievadiet derigu kodu");
      setIsLoading(false);
      return;
    }

    try {
      const player = JSON.parse(
        localStorage.getItem(PlayerLocalStorage.currentPlayer) ?? "{}"
      ) as IPlayerStorage;

      const response = await fetch(`${constants.baseApiUrl}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: trimmedCode,
          player_id: player?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error ?? "Neizdevas pievienoties spelei");
        setIsLoading(false);
        return;
      }

      localStorage.setItem(
        PlayerLocalStorage.currentGame,
        JSON.stringify({
          id: data.id,
          end_date: data.end_date,
          title: data.title,
        } as IGameSessionStorage)
      );

      navigate("/play/lobby");
    } catch {
      setError("Kluda, meginiet velreiz");
    }

    setIsLoading(false);
  };

  const handleJoin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await postJoin(code);
  };

  const handleJoinExisting = () => {
    navigate("/play/lobby");
  };

  const setCodeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, "").toUpperCase();
    setCode(value);
  };

  return (
    <div className="flex min-h-[100dvh] w-full bg-[#f4f7fa] items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-8 -left-10 w-44 h-44 rotate-[28deg]" style={{ backgroundColor: accentLime }}></div>
        <div
          className="absolute -top-16 -left-24 w-64 h-64"
          style={{
            backgroundImage: `repeating-linear-gradient(150deg, transparent 0 9px, ${accentGreen} 9px 11px)`,
            opacity: 0.65,
          }}
        ></div>

        <div className="absolute -bottom-12 -right-10 w-48 h-48 rotate-[16deg]" style={{ backgroundColor: accentMagenta }}></div>
        <div
          className="absolute -bottom-10 -right-10 w-56 h-56"
          style={{
            backgroundImage: `repeating-linear-gradient(140deg, transparent 0 10px, ${accentGreen} 10px 12px)`,
            opacity: 0.6,
          }}
        ></div>

        <div className="absolute top-[14%] right-[15%] w-8 h-8 rounded-full" style={{ backgroundColor: accentMagenta }}></div>
        <div className="absolute top-[17%] right-[10%] w-4 h-4 rounded-full" style={{ backgroundColor: accentSand }}></div>
        <div className="absolute top-[9%] left-[16%] w-7 h-7 rounded-full" style={{ backgroundColor: accentGreen }}></div>
        <div className="absolute bottom-[12%] left-[18%] w-9 h-9 rounded-full" style={{ backgroundColor: accentLime, opacity: 0.35 }}></div>
        <div className="absolute bottom-[14%] right-[32%] w-7 h-7 rounded-full" style={{ backgroundColor: accentSand }}></div>

        <div className="absolute top-[24%] left-[25%] w-24 h-24 rotate-[28deg]" style={{ backgroundColor: accentMagenta, opacity: 0.2 }}></div>
        <div className="absolute top-[22%] right-[28%] w-24 h-24 rotate-[30deg]" style={{ backgroundColor: accentLime, opacity: 0.18 }}></div>
        <div className="absolute bottom-[25%] left-[24%] w-28 h-28 rotate-[30deg]" style={{ backgroundColor: accentSand, opacity: 0.5 }}></div>

        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, ${accentSand}66 0%, transparent 35%), radial-gradient(circle at 80% 75%, ${accentLime}33 0%, transparent 35%), radial-gradient(circle at 52% 40%, ${accentMagenta}22 0%, transparent 45%)`,
          }}
        ></div>
      </div>

      {!!existingGameCode && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
          <div className="bg-white border-l-4 shadow-md rounded p-4 flex flex-col sm:flex-row items-center gap-4 w-full" style={{ borderColor: accentMagenta }}>
            <div className="flex-1 flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: `${accentSand}AA`, color: accentGreen }}>
                <i className="fa-solid fa-circle-info text-sm"></i>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800 text-sm">Aktiva spele</p>
                <p className="text-slate-500 text-xs mt-0.5">Jums ir iesakta sesija</p>
              </div>
            </div>
            <button
              onClick={handleJoinExisting}
              className="whitespace-nowrap px-4 py-2 text-white text-sm font-semibold rounded transition-all hover:brightness-95 shadow-sm w-full sm:w-auto focus:ring-2 focus:ring-offset-2"
              style={{ backgroundColor: accentGreen, boxShadow: `0 0 0 2px ${accentGreen}00` }}
            >
              Atgriezties
            </button>
          </div>
        </div>
      )}

      <main className="w-full max-w-[26rem] z-10 flex flex-col items-center gap-3">
        <img
          src="/GvG.png"
          alt="Game logo"
          className="w-[220px] sm:w-[260px] md:w-[300px] h-auto max-w-full object-contain"
        />

        <div className="bg-white rounded shadow-xl border border-slate-100 overflow-hidden w-full relative">
          <div className="absolute top-0 left-0 w-full h-[4px]" style={{ backgroundColor: accentSand }}></div>

          <form onSubmit={handleJoin} className="px-8 py-7 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5 w-full mt-1">
              <label
                htmlFor="gameCode"
                className="text-xs font-bold text-slate-400 uppercase tracking-widest"
              >
                Speles Kods
              </label>
              <div className="relative">
                <input
                  id="gameCode"
                  placeholder="KODS..."
                  type="text"
                  className="w-full h-12 bg-transparent border-0 border-b-2 border-slate-200 text-slate-800 placeholder-slate-300 text-xl tracking-[0.2em] font-bold uppercase focus:ring-0 transition-colors px-1"
                  style={{ caretColor: accentGreen }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderBottomColor = accentMagenta;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderBottomColor = "#e2e8f0";
                  }}
                  value={code}
                  onChange={setCodeValue}
                  autoComplete="off"
                />
              </div>
            </div>

            {!!error && (
              <div
                className="w-full rounded text-sm px-3 py-2"
                style={{ backgroundColor: `${accentSand}99`, border: `1px solid ${accentMagenta}66`, color: accentGreen }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-white rounded font-semibold text-[15px] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center shadow-md mt-2"
              style={{
                backgroundColor: accentGreen,
                boxShadow: `0 8px 24px ${accentGreen}33`,
              }}
            >
              {isLoading ? (
                <SpinnerCircularFixed
                  size={22}
                  thickness={160}
                  color="#ffffff"
                  className="mr-2"
                />
              ) : (
                "Spelet"
              )}
            </button>

          </form>
        </div>
      </main>
    </div>
  );
};
