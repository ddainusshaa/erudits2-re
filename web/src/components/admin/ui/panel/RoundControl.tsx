import { RoundTable } from "./RoundTable";
import { SpinnerCircularFixed } from "spinners-react";
import { useAdminPanel } from "../../../universal/AdminPanelContext";
import { useState } from "react";
import { constants } from "../../../../constants";
import { useToast } from "../../../universal/Toast";
import { RoundCountdown } from "./RoundCountdown";
import { localizeError, localizeSuccess } from "../../../../localization";

export const RoundControl = () => {
  const { gameController, fetchQuestionInfo, instanceId, instance } =
    useAdminPanel();
  const [fetchDisabled, setFetchDisabled] = useState(false);
  const showToast = useToast();

  const refresh = async () => {
    setFetchDisabled(true);
    fetchQuestionInfo();
    setTimeout(() => setFetchDisabled(false), 2500);
  };

  if (!gameController) {
    return (
      <div className="mx-auto mt-10">
        <SpinnerCircularFixed size={40} color="#2563eb" thickness={180} />
      </div>
    );
  }

  const nextRound = async () => {
    const response = await fetch(`${constants.baseApiUrl}/next-round`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem(
          constants.localStorage.TOKEN
        )}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instance_id: instanceId,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      fetchQuestionInfo();
      showToast(true, localizeSuccess(data.message));
    } else {
      const data = await response.json();
      showToast(false, localizeError(data.message));
    }
  };

  const previousRound = async () => {
    const response = await fetch(`${constants.baseApiUrl}/previous-round`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem(
          constants.localStorage.TOKEN
        )}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instance_id: instanceId,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      fetchQuestionInfo();
      showToast(true, localizeSuccess(data.message));
    } else {
      const data = await response.json();
      showToast(false, localizeError(data.message));
    }
  };

  const nextQuestion = async () => {
    const response = await fetch(`${constants.baseApiUrl}/next-question`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem(
          constants.localStorage.TOKEN
        )}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instance_id: instanceId,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      fetchQuestionInfo();
      showToast(true, localizeSuccess(data.message));
    } else {
      const data = await response.json();
      showToast(false, localizeError(data.message));
    }
  };

  const previousQuestion = async () => {
    const response = await fetch(`${constants.baseApiUrl}/previous-question`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem(
          constants.localStorage.TOKEN
        )}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instance_id: instanceId,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      fetchQuestionInfo();
      showToast(true, localizeSuccess(data.message));
    } else {
      const data = await response.json();
      showToast(false, localizeError(data.message));
    }
  };

  const { instance_info } = gameController;

  return (
    <div className="flex flex-col place-items-center w-full overflow-x-auto">
      <div className="flex gap-1 place-items-center mb-1 p-2 justify-center bg-white text-slate-800">
        <p className="font-semibold text-slate-800">Kārtas</p>
        <button
          disabled={fetchDisabled || !instance_info.game_started}
          onClick={refresh}
          className="text-slate-400 hover:text-slate-700 transition-colors"
        >
          {fetchDisabled ? (
            <SpinnerCircularFixed size={12} thickness={230} color="#334155" />
          ) : (
            <i className="fa-solid fa-refresh"></i>
          )}
        </button>
      </div>
      {!!instance_info.game_started && (
        <div className="bg-white flex flex-col justify-between w-full h-full text-slate-800">
          <div className="w-full h-84 bg-slate-50 py-3 shadow-sm border-b border-slate-200">
            <div className="flex justify-between px-6 gap-4">
              <button
                disabled={!instance_info.game_started}
                onClick={previousRound}
                className={`${
                  !instance_info.game_started
                    ? "bg-slate-200 text-slate-400"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                } font-bold px-4 rounded py-2 transition-all shadow-sm`}
              >
                <i className="fa-solid fa-backward-fast me-2"></i>
                Iepriekšējā kārta
              </button>
              <div className="bg-white border border-slate-200 flex-col flex place-items-center px-4 py-1 rounded shadow-sm min-w-[180px]">
                <p className="text-xs text-slate-500">Nepieciešams diskvalificēt</p>
                {instance?.current_round && (
                  <p className="font-semibold text-slate-800">
                    {instance_info.disqualify_amount} spēlētājus
                  </p>
                )}
                {!instance?.current_round && <p className="font-semibold text-slate-800">-</p>}
              </div>

              <div className="flex flex-col place-items-center grow justify-center">
                <p className="text-xs text-slate-500">Pašreizējā kārta</p>
                <p className="font-semibold text-slate-800 text-lg">
                  {instance_info.current_round ?? "-"}
                </p>
              </div>
              <div className="bg-white border border-slate-200 flex-col flex place-items-center px-4 py-1 rounded shadow-sm min-w-[180px]">
                <p className="text-xs text-slate-500">Atlikušais laiks</p>
                <p className="font-semibold text-slate-800">
                  <RoundCountdown gameController={gameController} />
                </p>
              </div>
              <button
                disabled={!instance_info.game_started}
                onClick={nextRound}
                className={`${
                  !instance_info.game_started
                    ? "bg-slate-200 text-slate-400"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                } font-bold px-4 rounded py-2 transition-all shadow-sm`}
              >
                Nākamā kārta
                <i className="fa-solid fa-forward-fast ms-2"></i>
              </button>
            </div>
          </div>
          {gameController.player_answers && (
            <RoundTable gameController={gameController} />
          )}

          <div className="w-full h-84 bg-slate-50 py-3 flex justify-between px-6 shadow-top border-t border-slate-200 rounded-b-2xl">
            <button
              disabled={instance_info.is_test || !instance_info.current_round}
              onClick={previousQuestion}
              className={`${
                instance_info.is_test || !instance_info.current_round
                  ? "bg-slate-200 text-slate-400"
                  : "bg-blue-700 hover:bg-blue-600 text-white"
              } font-bold px-4 rounded py-2 transition-all shadow-sm`}
            >
              <i className="fa-solid fa-backward me-2"></i>
              Iepriekšējais jautājums
            </button>
            <div className="flex flex-col place-items-center grow justify-center">
              <p className="text-xs text-slate-500">Pašreizējais jautājums</p>
              <p className="font-semibold text-slate-800 text-lg">
                {instance_info.current_question ?? "-"}
              </p>
            </div>
            <button
              disabled={instance_info.is_test || !instance_info.current_round}
              onClick={nextQuestion}
              className={`${
                instance_info.is_test || !instance_info.current_round
                  ? "bg-slate-300 text-slate-500"
                  : "bg-blue-700 hover:bg-blue-800"
              }  text-white font-bold px-4 rounded-sm py-2 transition-all`}
            >
              Nākamais jautājums
              <i className="fa-solid fa-forward ms-2"></i>
            </button>
          </div>
        </div>
      )}
      {!instance_info.game_started && (
        <div className="w-full h-full min-h-[380px] flex items-center justify-center p-6 bg-slate-50 border-t border-slate-200">
          <div className="max-w-lg text-center bg-white border border-slate-200 rounded p-6 shadow-sm">
            <p className="text-lg font-semibold text-slate-800 mb-1">Spēle vēl nav sākta</p>
            <p className="text-slate-500">
              Nospiediet "Sākt spēli", lai aktivizētu kārtu un jautājumu vadību.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
