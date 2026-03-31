import { useState } from "react";
import { constants } from "../../../../constants";
import { useConfirmation } from "../../../universal/ConfirmationWindowContext";
import { useToast } from "../../../universal/Toast";
import { IGame } from "../../interface/IGame";
import { IInstance } from "../../interface/IInstance";
import { useNavigate } from "react-router-dom";
import { localizeError } from "../../../../localization";

export const StartStop = ({
  game,
  instance,
  instanceId,
}: {
  game: IGame;
  instance: IInstance;
  instanceId: string;
}) => {
  const confirm = useConfirmation();
  const showToast = useToast();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(!!instance.game_started);

  const startGame = async () => {
    setIsLoading(true);
    const confirmed = await confirm(`Sākt spēli ${game.title}?`);
    if (!confirmed) {
      setIsLoading(false);
      return;
    }

    const response = await fetch(`${constants.baseApiUrl}/game-control`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem(
          constants.localStorage.TOKEN
        )}`,
      },
      body: JSON.stringify({
        command: "start",
        instance_id: instanceId,
      }),
    });

    if (response.ok) {
      showToast(true, "Spēle sākta");
      setGameStarted(true);
    } else {
      const data = await response.json();
      showToast(false, localizeError(data.message));
    }
    setIsLoading(false);
  };

  const closeGame = async () => {
    setIsLoading(true);
    if (await confirm(`Slēgt spēli ${game.title}?`)) {
      const response = await fetch(`${constants.baseApiUrl}/game-control`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(
            constants.localStorage.TOKEN
          )}`,
        },
        body: JSON.stringify({
          command: "end",
          instance_id: instanceId,
        }),
      });
      if (response.ok) {
        showToast(true, "Spēle slēgta");
        navigate("/admin/games");
      } else {
        const data = await response.json();
        showToast(false, localizeError(data.message));
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="gap-2 flex items-stretch">
      <button
        disabled={isLoading}
        onClick={closeGame}
        className={`h-10 min-w-[130px] px-4 inline-flex items-center justify-center rounded-md ${
          isLoading ? "bg-slate-400" : " bg-red-500 hover:bg-red-600"
        } text-white font-bold transition-all`}
      >
        <i className="fa-xmark fa-solid me-2"></i>
        Slēgt spēli
      </button>
      <button
        disabled={isLoading || gameStarted}
        onClick={startGame}
        className={`h-10 min-w-[130px] px-4 inline-flex items-center justify-center rounded-md ${
          isLoading || gameStarted
            ? "bg-slate-400"
            : "bg-emerald-500 hover:bg-emerald-600"
        }  text-white font-bold  transition-all`}
      >
        <i className="fa-play fa-solid me-2"></i>
        Sākt spēli
      </button>
    </div>
  );
};
