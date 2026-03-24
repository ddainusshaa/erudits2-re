import { PlayerList } from "../../ui/panel/PlayerList";
import { StartStop } from "../../ui/panel/StartStop";
import { RoundControl } from "../../ui/panel/RoundControl";
import { useAdminPanel } from "../../../universal/AdminPanelContext";
import { SpinnerCircularFixed } from "spinners-react";
import { BuzzerModal } from "../../ui/panel/BuzzerModal";
import { useEffect, useRef, useState } from "react";

export const Panel = () => {
  const { game, instanceId, instance, isBuzzerMode } = useAdminPanel();
  const [gifIndex, setGifIndex] = useState(0);
  const lastGifIndexRef = useRef(0);
  const sameGifStreakRef = useRef(1);

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

  if (!instance) {
    return (
      <div className="mx-auto mt-10 w-10">
        <SpinnerCircularFixed size={40} color="#E63946" thickness={180} />
      </div>
    );
  }

  return (
    <div className="app-theme-bg flex flex-col min-h-[100dvh] gap-6 p-6 overflow-y-auto">
      {!!isBuzzerMode && <BuzzerModal />}
      <div className="app-theme-content grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] items-center gap-4 bg-white p-4 rounded shadow-sm border border-slate-200">
        <div className="flex items-center justify-center lg:justify-start">
          <button
            onClick={() => window.location.assign("/admin/games")}
            className="px-5 py-2.5 rounded bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <i className="fa-solid fa-arrow-left-long mr-2"></i>
            Atpakaļ
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-center">
          <h1 className="font-bold text-xl sm:text-2xl text-slate-800">{game?.title}</h1>
          <div className="px-4 py-1.5 bg-[#F0EDCA] text-[#0F9A09] rounded text-lg font-bold tracking-widest border border-[#91FF00]/40">
            {instance?.code}
          </div>
        </div>
        <div className="w-full lg:w-auto flex justify-center lg:justify-end">
          {game && instanceId && instance && (
            <StartStop instance={instance} game={game} instanceId={instanceId} />
          )}
        </div>
      </div>
      <div className="app-theme-content flex flex-col lg:flex-row flex-1 gap-6 pb-6">
        <div className="w-full lg:w-1/3 min-h-[400px] flex flex-col bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
          <PlayerList />
        </div>
        <div className="w-full lg:w-2/3 flex flex-col bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
          <RoundControl />
        </div>
      </div>

      <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40 pointer-events-none flex flex-col gap-2">
        <div className="w-[130px] h-[86px] sm:w-[220px] sm:h-[140px] bg-white/95 border border-slate-200 rounded shadow-md overflow-hidden">
          <img
            src={panelGifs[gifIndex]}
            alt="Admin dashboard gif"
            className="w-full h-full object-fill"
          />
        </div>
      </div>

      <div className="fixed bottom-3 left-3 sm:bottom-4 sm:left-4 z-40 pointer-events-auto flex flex-col gap-2">
        <div className="w-[160px] h-[100px] sm:w-[260px] sm:h-[150px] bg-white/95 border border-slate-200 rounded shadow-md overflow-hidden">
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
    </div>
  );
};
