import { useEffect } from "react";
import Countdown from "react-countdown";
import { useSearchParams } from "react-router-dom";
import { useAdminPanel } from "../../../universal/AdminPanelContext";

const TIMER_STYLES: Record<
  string,
  {
    surface: string;
    timer: string;
    label: string;
  }
> = {
  classic: {
    surface:
      "bg-white/78 border border-white/70 text-slate-900 shadow-[0_18px_35px_rgba(15,23,42,0.16)]",
    timer: "text-[#0F9A09] drop-shadow-[0_6px_14px_rgba(15,154,9,0.35)]",
    label: "text-slate-600",
  },
  dark: {
    surface:
      "bg-slate-950/85 border border-slate-800 text-slate-100 shadow-[0_24px_40px_rgba(2,6,23,0.55)]",
    timer: "text-[#91FF00] drop-shadow-[0_0_18px_rgba(145,255,0,0.55)]",
    label: "text-slate-400",
  },
  neon: {
    surface:
      "bg-slate-900/85 border border-fuchsia-500/40 text-slate-100 shadow-[0_24px_45px_rgba(88,28,135,0.45)]",
    timer: "text-[#E812FF] drop-shadow-[0_0_20px_rgba(232,18,255,0.65)]",
    label: "text-fuchsia-200/80",
  },
};

export const TimerDisplay = () => {
  const { gameController, fetchQuestionInfo, instanceId } = useAdminPanel();
  const [searchParams] = useSearchParams();

  const styleKey = (searchParams.get("style") || "classic").toLowerCase();
  const labelParam = (searchParams.get("label") || "").trim();
  const activeStyle = TIMER_STYLES[styleKey] ?? TIMER_STYLES.classic;

  useEffect(() => {
    if (!instanceId) return;
    fetchQuestionInfo();
  }, [instanceId]);

  useEffect(() => {
    if (!gameController?.instance_info?.game_started) return;

    const interval = setInterval(() => {
      fetchQuestionInfo();
    }, 1500);

    return () => clearInterval(interval);
  }, [gameController?.instance_info?.game_started, fetchQuestionInfo]);

  const instanceInfo = gameController?.instance_info;
  const hasTimer =
    !!instanceInfo?.started_at &&
    !!instanceInfo?.answer_time &&
    instanceInfo.answer_time > 0;

  const getCountdownDate = () => {
    if (!instanceInfo?.started_at || !instanceInfo?.answer_time) return 0;

    const dateStartedAt = new Date(instanceInfo.started_at);
    const localTimeOffset = dateStartedAt.getTimezoneOffset() * 60 * 1000;

    return (
      dateStartedAt.getTime() -
      localTimeOffset +
      instanceInfo.answer_time * 1000
    );
  };

  const renderer = ({
    minutes,
    seconds,
    completed,
  }: {
    minutes: number;
    seconds: number;
    completed: boolean;
  }) => {
    if (!hasTimer || completed) {
      return <span>00:00</span>;
    }

    const totalSeconds = minutes * 60 + seconds;
    const shouldFlash = totalSeconds <= 5 && totalSeconds > 0;

    return (
      <span className={shouldFlash ? "timer-flash-red" : undefined}>
        {minutes > 9 ? minutes : "0" + minutes}:
        {seconds > 9 ? seconds : "0" + seconds}
      </span>
    );
  };

  return (
    <div className="app-theme-bg min-h-[100dvh] w-full flex items-center justify-center p-4">
      <div className="app-theme-content w-full flex items-center justify-center">
        <div
          className={`px-10 py-8 rounded-3xl flex flex-col items-center gap-4 ${activeStyle.surface}`}
        >
          <div
            className={`text-[clamp(64px,10vw,180px)] font-bold tracking-widest leading-none ${activeStyle.timer}`}
          >
            {hasTimer ? (
              <Countdown
                key={instanceInfo?.started_at}
                renderer={renderer}
                date={getCountdownDate()}
              />
            ) : (
              "--:--"
            )}
          </div>
          <div
            className={`text-sm sm:text-base uppercase tracking-[0.3em] ${activeStyle.label}`}
          >
            {instanceInfo?.game_started
              ? labelParam || "Taimeris"
              : "Gaida sākumu"}
          </div>
        </div>
      </div>
    </div>
  );
};
