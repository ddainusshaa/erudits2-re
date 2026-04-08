import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SpinnerCircularFixed } from "spinners-react";
import { constants } from "../../../constants";
import { PlayerLocalStorage } from "../enum/PlayerLocalStorage";
import { IGameSessionStorage } from "../interface/IGameSessionStorage";

export const LandingPage = () => {
  const accentMagenta = "#E812FF";
  const accentGreen = "#0F9A09";
  const accentSand = "#F0EDCA";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [existingGameCode, setExistingGameCode] = useState("");
  const [zoomInverseScale, setZoomInverseScale] = useState(1);

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

  useEffect(() => {
    const syncZoom = () => {
      const scale = window.visualViewport?.scale ?? 1;
      const safeScale = Number.isFinite(scale) && scale > 0 ? scale : 1;
      setZoomInverseScale(1 / safeScale);
    };

    syncZoom();
    window.addEventListener("resize", syncZoom);
    window.visualViewport?.addEventListener("resize", syncZoom);

    return () => {
      window.removeEventListener("resize", syncZoom);
      window.visualViewport?.removeEventListener("resize", syncZoom);
    };
  }, []);

  const postJoin = async (joinCode: string) => {
    setIsLoading(true);
    setError("");

    const trimmedCode = joinCode.trim().toUpperCase();
    if (trimmedCode.length < 3) {
      setError("Lūdzu ievadiet derīgu kodu");
      setIsLoading(false);
      return;
    }

    try {
      // Joining by code should create/reuse session, but not silently reuse stale player identity.
      localStorage.removeItem(PlayerLocalStorage.currentPlayer);
      localStorage.removeItem(PlayerLocalStorage.answers);

      const response = await fetch(`${constants.baseApiUrl}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: trimmedCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error ?? "Neizdevās pievienoties spēlei");
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
      setError("Kļūda, mēģiniet vēlreiz");
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
    <div className="app-theme-bg min-h-[100dvh] w-full font-sans overflow-hidden">
      <div
        className="relative min-h-[100dvh] w-full flex items-center justify-center p-4"
        style={{
          transform: `scale(${zoomInverseScale})`,
          transformOrigin: "center center",
          width: `${100 / zoomInverseScale}%`,
          minHeight: `${100 / zoomInverseScale}dvh`,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
      {!!existingGameCode && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
          <div className="bg-white border-l-4 shadow-md rounded p-4 flex flex-col sm:flex-row items-center gap-4 w-full" style={{ borderColor: accentMagenta }}>
            <div className="flex-1 flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: `${accentSand}AA`, color: accentGreen }}>
                <i className="fa-solid fa-circle-info text-sm"></i>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800 text-sm">Aktīva spēle</p>
                <p className="text-slate-500 text-xs mt-0.5">Jums ir iesākta sesija</p>
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

      <main className="w-full max-w-[26rem] z-10">
        <div className="w-full rounded-2xl border border-white/40 bg-white/28 backdrop-blur-lg shadow-[0_18px_40px_rgba(15,23,42,0.12)] p-4 sm:p-5">
          <div className="flex flex-col items-center gap-3">
            <img
              src="/GvG.png"
              alt="Game logo"
              className="w-[220px] sm:w-[260px] md:w-[300px] h-auto max-w-full object-contain"
            />

            <div className="bg-white/86 rounded-xl shadow-lg border border-white/70 overflow-hidden w-full relative">

              <form onSubmit={handleJoin} className="px-8 py-7 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5 w-full mt-1">
              <label
                htmlFor="gameCode"
                className="text-xs font-bold text-slate-800 uppercase tracking-widest"
              >
                Spēles kods
              </label>
              <div className="relative">
                <input
                  id="gameCode"
                  placeholder="KODS..."
                  type="text"
                  className="w-full h-12 bg-white/90 border border-slate-400 text-slate-950 placeholder-slate-700 rounded px-3 text-xl tracking-[0.2em] font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[#E812FF] focus:border-transparent transition-all"
                  style={{ caretColor: accentGreen }}
                  value={code}
                  onChange={setCodeValue}
                  autoComplete="off"
                />
              </div>
            </div>

            {!!error && (
              <div
                className="w-full rounded text-sm font-medium px-3 py-2"
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
                "Spēlēt"
              )}
            </button>

              </form>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
};
