import { PlayerList } from "../../ui/panel/PlayerList";
import { StartStop } from "../../ui/panel/StartStop";
import { RoundControl } from "../../ui/panel/RoundControl";
import { useAdminPanel } from "../../../universal/AdminPanelContext";
import { SpinnerCircularFixed } from "spinners-react";
import { BuzzerModal } from "../../ui/panel/BuzzerModal";
import { useEffect, useRef, useState } from "react";
import echo from "../../../../useEcho";

export const Panel = () => {
  const { game, instanceId, instance, isBuzzerMode } = useAdminPanel();
  const [gifIndex, setGifIndex] = useState(0);
  const splitContainerRef = useRef<HTMLDivElement | null>(null);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const [isWideLayout, setIsWideLayout] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.innerWidth >= 1024;
  });
  const [playerPanePercent, setPlayerPanePercent] = useState(() => {
    if (typeof window === "undefined") {
      return 36;
    }
    const stored = Number(localStorage.getItem("adminPanel.playerPanePercent"));
    if (!Number.isFinite(stored)) {
      return 36;
    }
    return Math.min(60, Math.max(24, stored));
  });
  const [showMediaOverlays, setShowMediaOverlays] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    const stored = localStorage.getItem("adminPanel.showMediaOverlays");
    if (stored === null) {
      return true;
    }

    return stored === "1";
  });
  const lastGifIndexRef = useRef(0);
  const sameGifStreakRef = useRef(1);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(true);

  const panelGifs = [
    "/twitter_1942992156148351014.gif",
    "/speed.gif",
    "/smigonis-zvana.gif",
    "/poop.gif",
    "/MR6GFPXY3QDOSPM7FWNRQZ4OSKTWTWZT.gif",
    "/maxwell-cat.gif",
    "/lvfactcheckgif.gif",
    "/jpegmafia-pizzeria.gif",
    "/IMG_9700.gif",
    "/IMG_7967.gif",
    "/Gw9uPGJWAAArICS.gif",
    "/ezgif.com-optimize.gif",
    "/edienkarte1.gif",
    "/captiwefefon.gif",
    "/caption.gif",
    "/caption-1-2-1.gif",
    "/capti222on.gif",
    "/capt23f23fion.gif",
    "/ca333ption.gif",
    "/4F9EE34B-72ED-486E-B886-AA44DDF33271.gif",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setGifIndex(() => {
        if (panelGifs.length <= 1) {
          return 0;
        }

        const lastIndex = lastGifIndexRef.current;
        let nextIndex = Math.floor(Math.random() * panelGifs.length);

        // Allow repeats, but never allow a third same GIF in a row.
        if (sameGifStreakRef.current >= 2 && nextIndex === lastIndex) {
          let attempts = 0;
          while (nextIndex === lastIndex && attempts < 30) {
            nextIndex = Math.floor(Math.random() * panelGifs.length);
            attempts++;
          }
        }

        if (nextIndex === lastIndex) {
          sameGifStreakRef.current += 1;
        } else {
          sameGifStreakRef.current = 1;
        }

        lastGifIndexRef.current = nextIndex;
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [panelGifs.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setIsWideLayout(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      "adminPanel.playerPanePercent",
      playerPanePercent.toString()
    );
  }, [playerPanePercent]);

  useEffect(() => {
    if (!isDraggingSplit) return;

    const handleMove = (event: MouseEvent) => {
      if (!splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const nextPercent = ((event.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(60, Math.max(24, nextPercent));
      setPlayerPanePercent(clamped);
    };

    const handleUp = () => setIsDraggingSplit(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("mouseleave", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("mouseleave", handleUp);
    };
  }, [isDraggingSplit]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!isDraggingSplit) return;

    const previousCursor = document.body.style.cursor;
    document.body.style.cursor = "col-resize";
    return () => {
      document.body.style.cursor = previousCursor;
    };
  }, [isDraggingSplit]);

  useEffect(() => {
    const pusher = (echo as any)?.connector?.pusher;
    if (!pusher?.connection) return;

    const connection = pusher.connection;
    const handleConnected = () => setIsRealtimeConnected(true);
    const handleDisconnected = () => setIsRealtimeConnected(false);

    setIsRealtimeConnected(connection.state === "connected");
    connection.bind("connected", handleConnected);
    connection.bind("disconnected", handleDisconnected);
    connection.bind("unavailable", handleDisconnected);
    connection.bind("failed", handleDisconnected);

    return () => {
      connection.unbind("connected", handleConnected);
      connection.unbind("disconnected", handleDisconnected);
      connection.unbind("unavailable", handleDisconnected);
      connection.unbind("failed", handleDisconnected);
    };
  }, []);

  const toggleMediaOverlays = () => {
    setShowMediaOverlays((prev) => {
      const next = !prev;
      localStorage.setItem("adminPanel.showMediaOverlays", next ? "1" : "0");
      return next;
    });
  };

  if (!instance) {
    return (
      <div className="flex items-center justify-center h-[100dvh] w-full bg-slate-950">
        <SpinnerCircularFixed size={48} color="#E63946" thickness={180} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] max-h-[100dvh] w-full gap-4 p-3 sm:p-4 overflow-hidden bg-slate-950 text-slate-100">
      {!!isBuzzerMode && <BuzzerModal />}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] items-center gap-4 bg-slate-900/95 p-4 rounded shadow-sm border border-slate-700">
        <div className="flex items-center justify-center lg:justify-start">
          <button
            onClick={() => window.location.assign("/admin/games")}
            className="px-5 py-2.5 rounded bg-slate-800 border border-slate-600 hover:bg-slate-700 text-slate-100 font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            <i className="fa-solid fa-arrow-left-long mr-2"></i>
            Atpakaļ
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-center">
          <h1 className="font-bold text-xl sm:text-2xl text-slate-100">{game?.title}</h1>
          <div className="px-4 py-1.5 bg-slate-800 text-[#91FF00] rounded text-lg font-bold tracking-widest border border-[#91FF00]/40">
            {instance?.code}
          </div>
        </div>
        <div className="w-full lg:w-auto flex justify-center lg:justify-end">
          <div className="flex flex-wrap items-stretch justify-center lg:justify-end gap-2">
            <div
              className={`h-10 px-3 inline-flex items-center justify-center rounded-md border text-sm font-semibold transition-colors ${
                isRealtimeConnected
                  ? "bg-emerald-600/15 border-emerald-500/40 text-emerald-300"
                  : "bg-rose-600/15 border-rose-500/40 text-rose-300"
              }`}
              title={isRealtimeConnected ? "Tiešraide savienota" : "Tiešraide atvienota"}
            >
              <span
                className={`mr-2 h-2 w-2 rounded-full ${
                  isRealtimeConnected ? "bg-emerald-400" : "bg-rose-400"
                }`}
              ></span>
              {isRealtimeConnected ? "Tiešraide: savienota" : "Tiešraide: atvienota"}
            </div>
            <button
              onClick={toggleMediaOverlays}
              className="h-10 px-4 inline-flex items-center justify-center rounded-md bg-slate-800 border border-slate-600 hover:bg-slate-700 text-slate-100 font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              {showMediaOverlays ? "Paslept GIF un video" : "Radit GIF un video"}
            </button>
            {game && instanceId && instance && (
              <StartStop instance={instance} game={game} instanceId={instanceId} />
            )}
          </div>
        </div>
      </div>
      <div
        ref={splitContainerRef}
        className="flex flex-col lg:flex-row flex-1 min-h-0 gap-4"
      >
        <div
          className="w-full min-h-[320px] flex flex-col bg-slate-900/95 rounded shadow-sm border border-slate-700 overflow-hidden"
          style={isWideLayout ? { flex: `0 0 ${playerPanePercent}%` } : undefined}
        >
          <PlayerList />
        </div>
        <div
          className="hidden lg:flex w-2 cursor-col-resize items-stretch"
          onMouseDown={(event) => {
            event.preventDefault();
            setIsDraggingSplit(true);
          }}
          onDoubleClick={() => setPlayerPanePercent(36)}
          title="Velciet, lai mainītu platumu"
        >
          <div
            className={`w-full rounded ${
              isDraggingSplit
                ? "bg-slate-500/70"
                : "bg-slate-700/60 hover:bg-slate-500/70"
            }`}
          ></div>
        </div>
        <div
          className="w-full min-h-[320px] flex flex-col bg-slate-900/95 rounded shadow-sm border border-slate-700 overflow-hidden"
          style={isWideLayout ? { flex: "1 1 0" } : undefined}
        >
          <RoundControl />
        </div>
      </div>

      {showMediaOverlays && (
        <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40 pointer-events-none flex flex-col gap-2">
          <div className="w-[130px] h-[86px] sm:w-[220px] sm:h-[140px] bg-slate-900/95 border border-slate-700 rounded shadow-md overflow-hidden">
            <img
              src={panelGifs[gifIndex]}
              alt="Admin dashboard gif"
              className="w-full h-full object-fill"
            />
          </div>
        </div>
      )}

      {showMediaOverlays && (
        <div className="fixed bottom-3 left-3 sm:bottom-4 sm:left-4 z-40 pointer-events-auto flex flex-col gap-2">
          <div className="w-[160px] h-[100px] sm:w-[260px] sm:h-[150px] bg-slate-900/95 border border-slate-700 rounded shadow-md overflow-hidden">
            <iframe
              src="https://www.youtube.com/embed/85z7jqGAGcc?autoplay=1&mute=1&playsinline=1&rel=0"
              title="Minecraft gameplay"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};
