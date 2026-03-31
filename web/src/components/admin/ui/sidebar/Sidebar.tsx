import { useState } from "react";
import { SidebarRound } from "./SidebarRound";
import { useSidebar } from "../../../universal/AdminGameSidebarContext";
import { formatText } from "../../../universal/functions";
import { AdminSessionStorage } from "../../enum/AdminSessionStorage";
import { constants } from "../../../../constants";
import { useNavigate } from "react-router-dom";
import { useBreadCrumbs } from "../../../universal/BreadCrumbContext";
import { SpinnerCircularFixed } from "spinners-react";

export const Sidebar = () => {
  const { game, rounds } = useSidebar();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setBreadCrumbs, clearBreadCrumbs } = useBreadCrumbs();

  const createRound = async () => {
    setIsLoading(true);
    const values = JSON.parse(
      sessionStorage.getItem(AdminSessionStorage.gameCreator) || "{}"
    );
    if (!values) {
      return;
    }
    sessionStorage.setItem(AdminSessionStorage.gameId, values.id);
    const response = await fetch(
      `${constants.baseApiUrl}/create-round/${values.id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            constants.localStorage.TOKEN
          )}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      clearBreadCrumbs();
      setBreadCrumbs("/admin/games", "Spēļu saraksts");
      setBreadCrumbs("/admin/games/editor/game/" + game!.id, game!.title);
      setBreadCrumbs("", "Spēles kārta");

      sessionStorage.setItem(
        AdminSessionStorage.roundCreator,
        JSON.stringify({
          id: data.round.id,
          title: data.round.title,
          disqualify_amount: data.round.disqualify_amount,
          points: data.round.points,
          answer_time: data.round.answer_time,
          is_additional: data.round.is_additional,
          game_id: data.round.game_id,
          is_test: data.round.is_test,
        })
      );
      navigate(`/admin/games/creator/round/${data.round.id}`);
    } else {
      console.error("Failed to create game:", response.statusText);
    }
    setIsLoading(false);
  };

  return (
    <>
      {game && (
        <div className="flex flex-col gap-2 max-h-full overflow-y-auto admin-scrollbar p-3 bg-slate-900 text-slate-100">
          <p className="text-lg font-semibold text-slate-100">
            Navigācija - {formatText(game?.title, 18)}
          </p>
          {rounds &&
            rounds.map((round) => (
              <SidebarRound key={round.id} round={round} />
            ))}
          <hr className="border-slate-700" />
          <button
            onClick={createRound}
            className="bg-blue-700 text-white font-semibold grow h-10 rounded-md hover:bg-blue-600 px-2 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-default"
            disabled={isLoading}
          >
            {!isLoading && <i className="fa-solid fa-plus"></i>}
            {isLoading && (
              <div className="mx-auto w-5">
                <SpinnerCircularFixed
                  color="#ffffff"
                  size={20}
                  thickness={180}
                />
              </div>
            )}
          </button>
        </div>
      )}
      {!game && (
        <div className="flex flex-col gap-2 p-3 bg-slate-900 text-slate-100">
          <p className="text-lg font-semibold text-slate-100">Navigācija</p>
        </div>
      )}
    </>
  );
};
