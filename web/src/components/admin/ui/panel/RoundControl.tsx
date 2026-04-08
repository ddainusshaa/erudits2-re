import { RoundTable } from "./RoundTable";
import { SpinnerCircularFixed } from "spinners-react";
import { useAdminPanel } from "../../../universal/AdminPanelContext";
import { useEffect, useState } from "react";
import { constants } from "../../../../constants";
import { useToast } from "../../../universal/Toast";
import { RoundCountdown } from "./RoundCountdown";
import { localizeError, localizeSuccess } from "../../../../localization";
import { exportStatsPdf } from "./exportStatsPdf";

export const RoundControl = () => {
  const { gameController, fetchQuestionInfo, instanceId, instance, players, game } =
    useAdminPanel();
  const [fetchDisabled, setFetchDisabled] = useState(false);
  const [timerStyle, setTimerStyle] = useState(() => {
    if (typeof window === "undefined") {
      return "classic";
    }
    return localStorage.getItem("adminPanel.timerStyle") ?? "classic";
  });
  const [timerLabel, setTimerLabel] = useState(() => {
    if (typeof window === "undefined") {
      return "Taimeris";
    }
    return localStorage.getItem("adminPanel.timerLabel") ?? "Taimeris";
  });
  const showToast = useToast();
  const instance_info = gameController?.instance_info;

  const refresh = async () => {
    setFetchDisabled(true);
    fetchQuestionInfo();
    setTimeout(() => setFetchDisabled(false), 2500);
  };

  const openTimerDisplay = () => {
    if (!instanceId) return;
    if (typeof window === "undefined") return;
    localStorage.setItem("adminPanel.timerStyle", timerStyle);
    localStorage.setItem("adminPanel.timerLabel", timerLabel);
    const label = encodeURIComponent(timerLabel.trim() || "Taimeris");
    const url = `${window.location.origin}/admin/panel/${instanceId}/timer?style=${timerStyle}&label=${label}`;
    window.open(url, "_blank");
  };

  const onExportStatsPdf = () => {
    if (!gameController) {
      showToast(false, "Nav datu eksportam.");
      return;
    }

    exportStatsPdf({
      gameTitle: game?.title,
      gameCode: instance?.code,
      players,
      gameController,
    });
  };

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

  useEffect(() => {
    if (!instance_info?.game_started || !instance_info?.current_round) {
      return;
    }

    const interval = setInterval(() => {
      fetchQuestionInfo();
    }, 1500);

    return () => clearInterval(interval);
  }, [
    fetchQuestionInfo,
    instance_info?.game_started,
    instance_info?.current_round,
    instance_info?.current_question,
  ]);

  if (!gameController || !instance_info) {
    return (
      <div className="mx-auto mt-10">
        <SpinnerCircularFixed size={40} color="#2563eb" thickness={180} />
      </div>
    );
  }

  return (
    <div className="flex flex-col place-items-center w-full h-full min-h-0 overflow-x-auto admin-scrollbar">
      <div className="flex gap-1 place-items-center mb-1 p-2 justify-center bg-slate-900 text-slate-100">
        <p className="font-semibold text-slate-100">Kārtas</p>
        <button
          disabled={fetchDisabled || !instance_info.game_started}
          onClick={refresh}
          className="text-slate-500 hover:text-slate-100 transition-colors"
        >
          {fetchDisabled ? (
            <SpinnerCircularFixed size={12} thickness={230} color="#f1f5f9" />
          ) : (
            <i className="fa-solid fa-refresh"></i>
          )}
        </button>
        <button
          type="button"
          onClick={onExportStatsPdf}
          className="ml-2 h-7 px-3 rounded bg-red-700 hover:bg-red-600 text-white text-xs font-semibold border border-red-500/70"
          title="Eksportēt spēlētāju statistiku uz PDF"
        >
          <i className="fa-solid fa-file-pdf mr-1"></i>
          PDF atskaite
        </button>
      </div>
      {!!instance_info.game_started && (
        <div className="bg-slate-900 flex flex-col justify-between w-full h-full text-slate-100 min-h-0">
          <div className="w-full h-84 bg-slate-800 py-3 shadow-sm border-b border-slate-700">
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
              <div className="bg-slate-900 border border-slate-700 flex-col flex place-items-center px-4 py-1 rounded shadow-sm min-w-[180px]">
                <p className="text-xs text-slate-400">Nepieciešams diskvalificēt</p>
                {instance?.current_round && (
                  <p className="font-semibold text-slate-100">
                    {instance_info.disqualify_amount} spēlētājus
                  </p>
                )}
                {!instance?.current_round && <p className="font-semibold text-slate-100">-</p>}
              </div>

              <div className="flex flex-col place-items-center grow justify-center">
                <p className="text-xs text-slate-400">Pašreizējā kārta</p>
                <p className="font-semibold text-slate-100 text-lg">
                  {instance_info.current_round ?? "-"}
                </p>
              </div>
              <div className="bg-slate-900 border border-slate-700 flex-col flex place-items-center px-4 py-1 rounded shadow-sm min-w-[180px]">
                <p className="text-xs text-slate-400">Atlikušais laiks</p>
                <p className="font-semibold text-slate-100">
                  <RoundCountdown gameController={gameController} />
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  <select
                    value={timerStyle}
                    onChange={(event) => setTimerStyle(event.target.value)}
                    className="h-8 rounded bg-slate-800 border border-slate-700 text-slate-100 text-xs px-2"
                  >
                    <option value="classic">Klasisks</option>
                    <option value="dark">Tumšs</option>
                    <option value="neon">Neons</option>
                  </select>
                  <input
                    value={timerLabel}
                    onChange={(event) => setTimerLabel(event.target.value)}
                    placeholder="Taimeris"
                    className="h-8 w-32 rounded bg-slate-800 border border-slate-700 text-slate-100 text-xs px-2"
                  />
                  <button
                    type="button"
                    onClick={openTimerDisplay}
                    className="h-8 px-3 rounded bg-slate-800 border border-slate-700 text-slate-100 text-xs font-semibold hover:bg-slate-700"
                  >
                    Taimeris
                  </button>
                </div>
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

          <div className="w-full h-84 bg-slate-800 py-3 flex justify-between px-6 shadow-top border-t border-slate-700 rounded-b-2xl">
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
            <div className="flex flex-col place-items-center grow justify-center min-w-0">
              <p className="text-xs text-slate-400">Pašreizējais jautājums</p>
              <p className="font-semibold text-slate-100 text-lg text-center break-words break-all whitespace-normal leading-snug max-w-full">
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
        <div className="w-full h-full min-h-[380px] flex items-center justify-center p-6 bg-slate-800 border-t border-slate-700">
          <div className="max-w-lg text-center bg-slate-900 border border-slate-700 rounded p-6 shadow-sm">
            <p className="text-lg font-semibold text-slate-100 mb-1">Spēle vēl nav sākta</p>
            <p className="text-slate-300">
              Nospiediet "Sākt spēli", lai aktivizētu kārtu un jautājumu vadību.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
