import { useState } from "react";
import { IGame } from "../../interface/IGame";
import { constants } from "../../../../constants";
import { useToast } from "../../../universal/Toast";
import { useConfirmation } from "../../../universal/ConfirmationWindowContext";
import { useNavigate } from "react-router-dom";
import { AdminSessionStorage } from "../../enum/AdminSessionStorage";
import { localizeError, localizeSuccess } from "../../../../localization";

export const AdminGameTableItem = ({
  game,
  onActivationModalOpen,
}: {
  game: IGame;
  onActivationModalOpen: (game: IGame) => void;
}) => {
  const [expanded, setExpanded] = useState(false);

  const showToast = useToast();
  const confirm = useConfirmation();
  const navigate = useNavigate();

  const openEditor = async () => {
    if (!!game.activeGameInstance) {
      return;
    }

    sessionStorage.setItem(
      AdminSessionStorage.gameCreator,
      JSON.stringify(game)
    );

    navigate("/admin/games/editor/game/" + game.id);
  };

  const gameAction = async () => {
    if (game.activeGameInstance) {
      navigate("/admin/panel/" + game.activeGameInstance);
      return;
    }
    onActivationModalOpen(game);
  };

  const deleteGame = async () => {
    if (!!game.activeGameInstance) {
      return;
    }
    if (await confirm(`Dzēst spēli ${game.title}?`)) {
      const response = await fetch(`${constants.baseApiUrl}/games/${game.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(
            constants.localStorage.TOKEN
          )}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        showToast(true, localizeSuccess(data.message));
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const data = await response.json();
        showToast(true, localizeError(data?.message) ?? "Sistēmas kļūda");
      }
    }
    return;
  };

  const duplicateGame = async () => {
    if (!!game.activeGameInstance) {
      return;
    }
    if (await confirm(`Kopēt spēli ${game.title}?`)) {
      const response = await fetch(
        `${constants.baseApiUrl}/duplicate-game/${game.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(
              constants.localStorage.TOKEN
            )}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        showToast(true, localizeSuccess(data.message));
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const data = await response.json();
        showToast(true, localizeError(data?.message) ?? "Sistēmas kļūda");
      }
    }
    return;
  };

  return (
    <li className="flex flex-col font-[Manrope] bg-slate-800 rounded-md">
      <div className="flex w-full ">
        <div
          onClick={() => (expanded ? setExpanded(false) : setExpanded(true))}
          className="rounded-s-md  p-2 px-8 grow hover:cursor-pointer"
        >
          <div className="flex gap-6">
            <span className="w-80 font-semibold">{game.title}</span>
            <div className="w-[1px] bg-gray-400"></div>
            <span>{game.created_at.slice(0, 10)}</span>
          </div>
          <div></div>
        </div>
        <button
          onClick={gameAction}
          className="w-32 text-lg bg-[#E63946] text-white font-semibold hover:bg-opacity-50 transition-all hover:cursor-pointer"
        >
          {!!game.activeGameInstance ? "Panelis" : "Spēlēt"}
        </button>
        <div
          onClick={() => (expanded ? setExpanded(false) : setExpanded(true))}
          className="hover:cursor-pointer rounded-e-md bg-slate-800 p-2 px-8"
        >
          {!expanded && (
            <i className="fa-solid fa-chevron-down text-gray-400"></i>
          )}
          {expanded && <i className="fa-solid fa-chevron-up text-gray-400"></i>}
        </div>
      </div>
      {expanded && (
        <div className="pb-6 px-8 pt-2 flex justify-between h-full">
          <div className="flex flex-col gap-4">
            <span>{game.description}</span>
            <table className="text-center">
              <thead>
                <tr>
                  <th className="pe-4">Pēdējoreiz spēlēta</th>
                  <th className="pe-4">Kārtas</th>
                  <th className="pe-4">Jautājumi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="pe-4">
                    {game.last_activation?.slice(0, 10) ?? "nav spēlēta"}
                  </td>
                  <td className="pe-4">{game.roundCount}</td>
                  <td className="pe-4">{game.questionCount}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex place-items-end gap-4">
            <button
              onClick={openEditor}
              disabled={!!game.activeGameInstance}
              className={`group w-8 h-8 ${
                !!game.activeGameInstance && "opacity-50 cursor-not-allowed"
              }`}
            >
              <i
                className={`fa-solid fa-gear text-2xl text-gray-400 ${
                  !!!game.activeGameInstance && "group-hover:text-black"
                }`}
              ></i>
            </button>
            <button
              onClick={duplicateGame}
              disabled={!!game.activeGameInstance}
              className={`group w-8 h-8 ${
                !!game.activeGameInstance && "opacity-50 cursor-not-allowed"
              }`}
            >
              <i
                className={`fa-solid fa-clone text-2xl text-gray-400 ${
                  !!!game.activeGameInstance && "group-hover:text-black"
                }`}
              ></i>
            </button>
            <button
              className={`group w-8 h-8 ${
                !!game.activeGameInstance && "opacity-50 cursor-not-allowed"
              }`}
              disabled={!!game.activeGameInstance}
              onClick={deleteGame}
            >
              <i
                className={`fa-solid fa-trash text-2xl text-gray-400 ${
                  !!!game.activeGameInstance && "group-hover:text-black"
                }`}
              ></i>
            </button>
          </div>
        </div>
      )}
    </li>
  );
};
