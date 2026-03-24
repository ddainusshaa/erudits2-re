import { useState, useEffect } from "react";
import { usePlayer } from "../../universal/PlayerContext";
import { GameView } from "../ui/GameView";
import { TestGameView } from "../ui/TestGameView";
import { BuzzerView } from "../ui/BuzzerView";
import { SpinnerCircularFixed } from "spinners-react";

export const Game = () => {
  const { round, isBuzzerMode } = usePlayer();
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    if (round || isBuzzerMode) {
      const timeout = setTimeout(() => {
        setShowGame(true);
      }, 2000);

      return () => clearTimeout(timeout); // Cleanup timeout on unmount
    }
  }, [round, isBuzzerMode]);

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

  // The starting state determines if the doors should be open or closed
  const isStarting = !!round || isBuzzerMode;

  return (
    <div className="relative w-full min-h-[100dvh] app-theme-bg overflow-hidden flex flex-col justify-center items-center">
      
      {/* Dynamic Background for Loading - Optional but nice */}
      <div className="absolute inset-0 z-0 pointer-events-none"></div>

      {/* The Split Screen overlay area */}
      <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden text-center">
        
        {/* Left Door */}
        <div 
          className={`absolute top-0 left-0 w-1/2 h-full bg-[#F0EDCA] flex items-center justify-end overflow-hidden transition-transform duration-[1500ms] ease-in-out ${
            isStarting ? '-translate-x-full' : 'translate-x-0'
          }`}
        >
          {/* Logo container placed to overlap in the center */}
          <div className="h-48 sm:h-64 md:h-80 lg:h-96 flex items-center relative translate-x-[2px]">
            <img src="/GvG-left.png" alt="Left Logo" className="h-full object-contain" />
          </div>
        </div>

        {/* Right Door */}
        <div 
          className={`absolute top-0 right-0 w-1/2 h-full bg-[#F0EDCA] flex items-center justify-start overflow-hidden transition-transform duration-[1500ms] ease-in-out ${
            isStarting ? 'translate-x-full' : 'translate-x-0'
          }`}
        >
          {/* Logo container placed to overlap in the center */}
          <div className="h-48 sm:h-64 md:h-80 lg:h-96 flex items-center relative -translate-x-[2px]">
            <img src="/GvG-right.png" alt="Right Logo" className="h-full object-contain" />
          </div>
        </div>

        {/* The Text / Loading state that sits behind or in front of the door in the center */}
        <div className={`absolute bottom-16 sm:bottom-24 w-full flex flex-col items-center justify-center transition-opacity duration-1000 ${isStarting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F9A09] mb-4 tracking-widest uppercase drop-shadow-md">Gaidām spēles sākumu</h2>
            <SpinnerCircularFixed size={48} thickness={150} color="#0F9A09" className="mx-auto" />
            <p className="text-slate-600 mt-4 text-sm sm:text-base">Uzgaidiet, kamēr vadītājs uzsāks spēli</p>
        </div>

      </div>
    </div>
  );
};
