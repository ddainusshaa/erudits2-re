import { useState } from "react";

export const OpenAnswer = ({
  guidelines,
  selectedAnswer,
  setSelectedAnswer,
  showSubmitButton,
  onSubmit,
}: {
  guidelines: string;
  selectedAnswer: string;
  setSelectedAnswer: (answer: string) => void;
  showSubmitButton?: boolean;
  onSubmit?: () => void;
}) => {
  const [error, setError] = useState(false);

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (onSubmit) {
      setError(false);
      if (selectedAnswer.length < 1) {
        setError(true);
        return;
      }
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col place-items-center justify-center gap-4 mx-auto w-full max-w-5xl">
      <p className="text-slate-900 lg:text-2xl text-xl font-semibold text-center break-words">
        {guidelines}
      </p>
      <div className="w-full">
        <form
          onSubmit={handleSubmit}
          className="flex lg:flex-row flex-col gap-4 w-full"
        >
          <input
            value={selectedAnswer}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            type="text"
            className={`text-2xl lg:text-4xl ${
              error && "border-2 border-red-600"
            } text-black px-4 py-2 rounded-md shadow-lg bg-white w-full lg:flex-1 min-w-0 lg:h-[4rem] h-16 text-center`}
            placeholder="Ievadiet savu atbildi šeit!"
          />

          {showSubmitButton && (
            <button
              onClick={handleSubmit}
              className="px-4 bg-white text-slate-900 border border-slate-300 font-bold text-xl rounded hover:bg-slate-100 lg:h-auto h-16 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-sm"
            >
              Iesniegt
              <i className="fa-solid fa-arrow-right ms-2"></i>
            </button>
          )}
        </form>
        <p className="text-red-600 font-semibold text-lg mt-2">
          {error ? "Lūdzu, ievadiet atbildi!" : " "}
        </p>
      </div>
    </div>
  );
};
