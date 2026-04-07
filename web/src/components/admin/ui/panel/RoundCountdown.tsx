import Countdown from "react-countdown";
import { IGameController } from "../../../universal/AdminPanelContext";

export const RoundCountdown = ({
  gameController,
}: {
  gameController: IGameController;
}) => {
  const { instance_info } = gameController;

  const parseApiDateMs = (value?: string) => {
    if (!value) return NaN;

    // Laravel may return naive "YYYY-MM-DD HH:mm:ss"; treat it as UTC.
    const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value);
    const normalized = hasTimezone
      ? value
      : `${value.replace(" ", "T")}Z`;

    return new Date(normalized).getTime();
  };

  if (!instance_info?.started_at || !instance_info?.answer_time) return "-";

  const getCountdownDate = () => {
    if (!instance_info?.started_at || !instance_info?.answer_time) return 0;

    const startedAtMs = parseApiDateMs(instance_info.started_at);
    const parsedServerNowMs = parseApiDateMs(instance_info.server_now);
    const serverNowMs = Number.isNaN(parsedServerNowMs)
      ? Date.now()
      : parsedServerNowMs;

    if (Number.isNaN(startedAtMs)) {
      return 0;
    }

    const elapsedMs = Math.max(0, serverNowMs - startedAtMs);
    const remainingMs = Math.max(0, instance_info.answer_time * 1000 - elapsedMs);

    return Date.now() + remainingMs;
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
    if (completed) {
      return (
        <div
          className=""
          style={{
            color: `rgba(255, 0, 0, 0.5)`,
          }}
        >
          00:00
        </div>
      );
    }
    return (
      <div className="">
        {minutes > 9 ? minutes : "0" + minutes}:
        {seconds > 9 ? seconds : "0" + seconds}
      </div>
    );
  };

  return (
    <Countdown
      key={instance_info?.started_at}
      renderer={renderer}
      date={getCountdownDate()}
    />
  );
};
