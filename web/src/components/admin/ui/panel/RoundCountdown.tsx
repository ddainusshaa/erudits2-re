import Countdown from "react-countdown";
import { IGameController } from "../../../universal/AdminPanelContext";

export const RoundCountdown = ({
  gameController,
}: {
  gameController: IGameController;
}) => {
  const { instance_info } = gameController;

  if (!instance_info?.started_at || !instance_info?.answer_time) return "-";

  const getCountdownDate = () => {
    if (!instance_info?.started_at || !instance_info?.answer_time) return 0;

    const dateStartedAt = new Date(instance_info.started_at);
    const localTimeOffset = dateStartedAt.getTimezoneOffset() * 60 * 1000;

    return (
      dateStartedAt.getTime() -
      localTimeOffset +
      instance_info.answer_time * 1000
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
