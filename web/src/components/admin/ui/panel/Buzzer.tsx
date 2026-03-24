import { useBuzzer } from "../../../universal/BuzzerContext";

export const Buzzer = () => {
  const { buzzedPlayer } = useBuzzer();

  return (
    <div className="app-theme-bg flex min-h-[100dvh] flex-col w-full justify-center items-center text-slate-900 p-4">
      <div className="place-self-center grow  w-full flex place-items-center justify-center">
        {buzzedPlayer.title && (
          <p
            key={buzzedPlayer.id}
            className="flash-animation font-bold text-[16rem] p-24 rounded"
          >
            {buzzedPlayer.title}
          </p>
        )}
      </div>
    </div>
  );
};
