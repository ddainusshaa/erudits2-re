import { useState, useEffect } from "react";
import { usePlayer } from "../../universal/PlayerContext";
import { GameView } from "../ui/GameView";
import { TestGameView } from "../ui/TestGameView";
import { BuzzerView } from "../ui/BuzzerView";
import { SpinnerCircularFixed } from "spinners-react";

export const Game = () => {
  const { round, isBuzzerMode } = usePlayer();
  const [showGame, setShowGame] = useState(false);
  const [animateDoors, setAnimateDoors] = useState(false);

  // The starting state determines if the doors should be open or closed
  const isStarting = !!round || isBuzzerMode;

  useEffect(() => {
    if (isStarting) {
      const timeout = setTimeout(() => {
        setShowGame(true);
      }, 2000);

      return () => clearTimeout(timeout); // Cleanup timeout on unmount
    }
  }, [isStarting]);

  useEffect(() => {
    if (!isStarting) {
      setAnimateDoors(false);
      return;
    }

    // Render closed first, then animate open on next frame.
    setAnimateDoors(false);
    const frame = requestAnimationFrame(() => {
      setAnimateDoors(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [isStarting]);

  // If we're fully loaded and finished animating
  if (showGame) {
    if (isBuzzerMode) {
      return <BuzzerView />;
    }
    if (round?.is_test) {
      return <TestGameView />;
    }
    return <GameView />;
  }

  if (!isStarting) {
    return (
      <div className="fixed inset-0 z-40 bg-[#F0EDCA] overflow-hidden flex flex-col items-center justify-center px-4 text-center">
        <img
          src="/GvG.png"
          alt="Game logo"
          className="w-[220px] sm:w-[280px] md:w-[340px] h-auto object-contain"
        />
        <h2 className="mt-6 text-xl sm:text-2xl font-bold text-[#0F9A09] tracking-wide">
          Gaidām spēles sākumu
        </h2>
        <p className="text-slate-700 mt-3 text-sm sm:text-base">
          Lūdzu, uzgaidiet, kamēr vadītājs uzsāks spēli
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 bg-[#F0EDCA] overflow-hidden flex flex-col justify-center items-center">
      <SpinnerCircularFixed size={44} thickness={150} color="#0F9A09" className="z-10" />

      {/* Keep the door animation only while transitioning into game/buzzer. */}
      {isStarting && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden text-center">
          <div
            className={`absolute top-0 left-0 w-1/2 h-full bg-[#F0EDCA] flex items-center justify-end overflow-hidden transition-transform duration-[1500ms] ease-in-out ${
              animateDoors ? '-translate-x-full' : 'translate-x-0'
            }`}
          >
            <div className="h-48 sm:h-64 md:h-80 lg:h-96 flex items-center relative translate-x-[2px]">
              <img src="/GvG-left.png" alt="Left Logo" className="h-full object-contain" />
            </div>
          </div>

          <div
            className={`absolute top-0 right-0 w-1/2 h-full bg-[#F0EDCA] flex items-center justify-start overflow-hidden transition-transform duration-[1500ms] ease-in-out ${
              animateDoors ? 'translate-x-full' : 'translate-x-0'
            }`}
          >
            <div className="h-48 sm:h-64 md:h-80 lg:h-96 flex items-center relative -translate-x-[2px]">
              <img src="/GvG-right.png" alt="Right Logo" className="h-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
