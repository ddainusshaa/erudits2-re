import { useState } from "react";
import { AnswerOption } from "./AnswerOption";
import { usePlayer } from "../../universal/PlayerContext";
import { SpinnerCircularFixed } from "spinners-react";
import Countdown from "react-countdown";
import { OpenAnswer } from "./OpenAnswer";
import { PlayerLocalStorage } from "../enum/PlayerLocalStorage";
import { useConfirmation } from "../../universal/ConfirmationWindowContext";
import { constants } from "../../../constants";

export const TestGameView = () => {
  const [viewImage, setViewImage] = useState(false);

  const {
    questions,
    answers,
    round,
    selectedAnswers,
    setSelectedAnswers,
    playerId,
    roundFinished,
    setRoundFinished,
    setChangedAnswer,
    countdownTime,
    selectedQuestionIndex,
    setSelectedQuestionIndex,
    isDisqualified,
  } = usePlayer();

  const confirm = useConfirmation();

  if (!questions[selectedQuestionIndex]) {
    return (
      <div className="flex flex-col gap-4 place-items-center">
        <p className="text-slate-700 text-xl font-semibold">Lūdzu, uzgaidiet!</p>
        <SpinnerCircularFixed size={45} thickness={180} color="#0F9A09" />
      </div>
    );
  }

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
      setRoundFinished(true);
      setViewImage(false);
      setSelectedQuestionIndex(0);
      return (
        <div
          className="text-slate-800 font-semibold lg:text-xl flex place-items-center rounded-mm"
          style={{
            backgroundColor: `rgba(255, 0, 0, 0.5)`,
          }}
        >
          <i className="fa-regular fa-clock lg:text-xl drop-shadow-lg me-3"></i>
          00:00
        </div>
      );
    }
    return (
      <div
        className="text-slate-800 font-semibold flex place-items-center lg:text-xl rounded-md"
        style={{
          backgroundColor: `rgba(255, 0, 0, ${
            minutes === 0 && seconds < 11 ? 0.05 * (11 - seconds) : 0
          })`,
        }}
      >
        <i className="fa-regular fa-clock lg:text-xl drop-shadow-lg me-3"></i>
        {minutes > 9 ? minutes : "0" + minutes}:
        {seconds > 9 ? seconds : "0" + seconds}
      </div>
    );
  };

  const finishRound = async () => {
    if (await confirm("Iesniegt atbildes?")) {
      setSelectedQuestionIndex(selectedQuestionIndex + 1);
      setRoundFinished(true);
      await fetch(`${constants.baseApiUrl}/player-finish-round`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player_id: playerId,
        }),
      });
    }
  };

  const nextQuestion = () => {
    if (selectedQuestionIndex + 1 === questions.length) {
      finishRound();
      return;
    }

    if (selectedQuestionIndex + 1 < questions.length) {
      setSelectedQuestionIndex(selectedQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (selectedQuestionIndex - 1 >= 0) {
      setSelectedQuestionIndex(selectedQuestionIndex - 1);
    }
  };

  const setSelectedAnswer = (answerId: string) => {
    setChangedAnswer(true);
    // @ts-ignore
    setSelectedAnswers((prev) => {
      const newAnswers = new Map(prev);
      const questionId = questions[selectedQuestionIndex].id;
      newAnswers.set(questionId, answerId);
      localStorage.setItem(
        PlayerLocalStorage.answers,
        JSON.stringify(Object.fromEntries(newAnswers))
      );
      return newAnswers;
    });
  };

  const handleViewImage = () => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setViewImage(false);
      }
    };

    if (!viewImage) {
      document.addEventListener("keydown", handleKeyDown);
      setViewImage(!viewImage);
      return;
    }

    document.removeEventListener("keydown", handleKeyDown);
    setViewImage(!viewImage);
  };

  if (roundFinished) {
    return (
      <div className="flex place-items-center justify-center flex-col gap-4">
        <p className="text-slate-800 text-2xl font-semibold">
          Lūdzu, gaidiet nākamo kārtu!
        </p>
        <SpinnerCircularFixed size={45} thickness={180} color="#0F9A09" />
      </div>
    );
  }

  const getCountdownDate = () => {
    if (!countdownTime || !round?.answer_time) return 0;

    const dateStartedAt = new Date(countdownTime);
    const localTimeOffset = dateStartedAt.getTimezoneOffset() * 60 * 1000;

    return dateStartedAt.getTime() - localTimeOffset + round.answer_time * 1000;
  };

  return (
    <div className="text-center select-none lg:p-12 w-full flex flex-col lg:gap-4 min-h-[100dvh] fade-in max-w-7xl mx-auto px-4">
      {!!isDisqualified && (
        <div className="lg:fixed place-items-center h-12 lg:text-xl font-semibold text-white left-0 top-0 w-full lg:opacity-90 px-4 bg-[#E812FF] flex justify-around">
          <i className="fa-solid fa-ban"></i>Dalībnieks diskvalificēts - punkti
          netiek uzskaitīti<i className="fa-solid fa-ban"></i>
        </div>
      )}
      {!!viewImage && (
        <div
          onClick={handleViewImage}
          onDrag={handleViewImage}
          className="absolute z-30 w-full h-full bg-black bg-opacity-90 flex place-items-center justify-center top-0 left-0"
        >
          <img
            className="w-full h-full object-contain"
            src={
              constants.baseImgUrl + questions[selectedQuestionIndex].image_url
            }
          ></img>
          <p className="absolute z-40 text-white text-xl lg:text-3xl font-semibold bg-black opacity-70 px-4 py-2 rounded-md bottom-4">
            Uzspiediet jebkur, lai aizvērtu bildi
          </p>
        </div>
      )}

      <div className="bg-white/80 border border-slate-200 lg:rounded-md text-slate-800 w-full flex flex-col place-items-center lg:px-12 lg:py-4 py-2 px-4">
        <div className="flex lg:justify-center justify-between lg:gap-12 w-full place-items-center lg:px-12">
          <Countdown
            key={countdownTime}
            renderer={renderer}
            date={getCountdownDate()}
          />

          <div className="text-slate-800 font-semibold lg:text-xl">
            <span>
              {selectedQuestionIndex + 1}/{questions.length}
            </span>
            <i className="fa-regular fa-circle-question lg:text-xl drop-shadow-lg ms-3"></i>
          </div>
        </div>
        <p className="font-semibold lg:text-3xl text-xl drop-shadow-md">
          {questions[selectedQuestionIndex].title}
        </p>
      </div>
      <div className="bg-white/80 border border-slate-200 lg:rounded-md text-slate-800 grow place-items-center p-4 lg:p-8 flex flex-col lg:flex-row gap-4 lg:justify-between">
        {window.outerWidth <= 1024 && (
          <div className="flex w-full gap-2">
            <button
              onClick={prevQuestion}
              disabled={selectedQuestionIndex === 0}
              className="w-full h-16 justify-center bg-slate-100 rounded-md transition-all"
            >
              <i className="fa-solid fa-angle-left text-4xl drop-shadow-lg"></i>
            </button>
            <button
              onClick={nextQuestion}
              className="w-full h-16 justify-center bg-slate-100 rounded-md transition-all"
            >
              <i className="fa-solid fa-angle-right text-4xl drop-shadow-lg"></i>
            </button>
          </div>
        )}
        {window.outerWidth > 1024 && (
          <button
            onClick={prevQuestion}
            disabled={selectedQuestionIndex === 0}
            className={`w-24 h-full justify-center bg-slate-100 rounded-md transition-all  ${
              selectedQuestionIndex === 0
                ? "cursor-not-allowed"
                : "hover:bg-slate-200"
            }`}
          >
            <i className="fa-solid fa-angle-left text-6xl drop-shadow-lg"></i>
          </button>
        )}
        {!questions[selectedQuestionIndex].is_text_answer && (
          <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-4">
            {answers
              .filter(
                (answer) =>
                  answer.question_id === questions[selectedQuestionIndex].id
              )
              .map((answer, index) => (
                <AnswerOption
                  key={answer.id}
                  setSelectedAnswer={setSelectedAnswer}
                  selectedAnswer={
                    selectedAnswers?.get(questions[selectedQuestionIndex].id) ??
                    ""
                  }
                  answerId={answer.id}
                  childNr={index + 1}
                  content={answer.text ?? ""}
                  isTest={true}
                />
              ))}
          </div>
        )}
        {!!questions[selectedQuestionIndex].is_text_answer && (
          <OpenAnswer
            guidelines={questions[selectedQuestionIndex].guidelines}
            selectedAnswer={
              selectedAnswers?.get(questions[selectedQuestionIndex].id) ?? ""
            }
            setSelectedAnswer={setSelectedAnswer}
          />
        )}
        {window.outerWidth > 1024 && (
          <button
            onClick={nextQuestion}
            className="w-24 h-full justify-center bg-slate-100 rounded-md transition-all hover:bg-slate-200"
          >
            <i className="fa-solid fa-angle-right text-6xl drop-shadow-lg"></i>
          </button>
        )}
      </div>

      {questions[selectedQuestionIndex].image_url && (
        <button
          onClick={handleViewImage}
          className="bg-white/80 border border-slate-200 hover:bg-white lg:rounded-md text-slate-800 place-items-center justify-center h-20"
        >
          <div className="font-bold text-2xl">
            {viewImage ? "Aizvērt attēlu" : "Skatīt attēlu"}
            <i className="fa-regular fa-image text-xl ms-2"></i>
          </div>
        </button>
      )}
    </div>
  );
};
