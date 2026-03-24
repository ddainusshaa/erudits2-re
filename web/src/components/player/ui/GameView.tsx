import { useState } from "react";
import { AnswerOption } from "./AnswerOption";
import { usePlayer } from "../../universal/PlayerContext";
import { SpinnerCircularFixed } from "spinners-react";
import Countdown from "react-countdown";
import { OpenAnswer } from "./OpenAnswer";
import { PlayerLocalStorage } from "../enum/PlayerLocalStorage";
import { constants } from "../../../constants";

export const GameView = () => {
  const [viewImage, setViewImage] = useState(false);
  const [text, setText] = useState("");

  const {
    answers,
    round,
    selectedAnswers,
    setSelectedAnswers,
    roundFinished,
    currentQuestion,
    setRoundFinished,
    setChangedAnswer,
    countdownTime,
    isTiebreaking,
    isDisqualified,
  } = usePlayer();

  if (!currentQuestion || !round) {
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
      setChangedAnswer(true);
      setViewImage(false);
      setText("");
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

  const setSelectedAnswer = (answerId: string) => {
    setChangedAnswer(true);
    setSelectedAnswers(new Map([[currentQuestion.id, answerId]]));
    localStorage.setItem(
      PlayerLocalStorage.answers,
      JSON.stringify({ [currentQuestion.id]: answerId })
    );
    setRoundFinished(true);
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
      <div className="flex place-items-center justify-center flex-col gap-4 fade-in-short">
        <p className="text-slate-800 text-3xl font-bold">Atbilde iesniegta</p>
        <div className="w-12 h-12 bg-white border-white border-4 rounded-full text-center">
          <i className="fa-solid fa-check text-emerald-500 text-3xl mt-1"></i>
        </div>
        <p className="text-slate-700 text-xl font-semibold">
          Lūdzu, gaidiet nākamo jautājumu
        </p>
      </div>
    );
  }

  const getCountdownDate = () => {
    if (!countdownTime || !round?.answer_time) return 0;

    const dateStartedAt = new Date(countdownTime);
    if (isTiebreaking) {
      return dateStartedAt.getTime() + round.answer_time * 1000;
    }

    return dateStartedAt.getTime() + round.answer_time * 1000;
  };

  const handleInputChange = (input: string) => {
    setText(input);
    localStorage.setItem(
      PlayerLocalStorage.answers,
      JSON.stringify({ [currentQuestion.id]: input })
    );
  };

  const handleSubmit = () => {
    setSelectedAnswers(new Map([[currentQuestion.id, text]]));
    setRoundFinished(true);
    setChangedAnswer(true);
    setText("");
  };

  return (
    <div
      className={`text-center select-none lg:p-12 w-full flex flex-col fade-in lg:gap-4 min-h-[100dvh] max-w-7xl mx-auto pl-4`}
    >
      {!!isDisqualified && (
        <div className="fixed place-items-center h-12 text-xl font-semibold text-white left-0 top-0 w-full opacity-90 bg-[#E812FF] flex justify-around">
          <i className="fa-solid fa-ban"></i>Dalībnieks diskvalificēts - punkti
          netiek uzskaitīti<i className="fa-solid fa-ban"></i>
        </div>
      )}
      {!!isTiebreaking && (
        <div className="flex lg:absolute left-0 top-0 px-12 h-12 bg-yellow-300 animate-pulse w-full shadow-lg place-items-center justify-between lg:text-2xl">
          <i className="fa-solid fa-scale-balanced"></i>
          <p className="font-bold">Neizšķirts - papildu jautājums</p>
          <i className="fa-solid fa-scale-balanced"></i>
        </div>
      )}
      {viewImage && (
        <div
          onClick={handleViewImage}
          onDrag={handleViewImage}
          className="absolute z-30 w-full h-full bg-black bg-opacity-90 flex place-items-center justify-center top-0 left-0"
        >
          <img
            className="w-full h-full object-contain"
            src={constants.baseImgUrl + currentQuestion.image_url}
          ></img>
          <p className="absolute z-40 text-white text-xl lg:text-3xl font-semibold bg-black opacity-70 px-4 py-2 rounded-md bottom-4">
            Uzspiediet jebkur, lai aizvērtu bildi
          </p>
        </div>
      )}

      <div className="bg-white/80 border border-slate-200 lg:rounded-md text-slate-800 w-full lg:h-24 flex flex-col place-items-center lg:px-12 pt-2 px-4">
        <div className="flex lg:justify-center justify-between lg:gap-12 w-full place-items-center lg:px-12">
          <Countdown
            key={countdownTime}
            renderer={renderer}
            date={getCountdownDate()}
          />

          <div className="text-slate-800 font-semibold lg:text-xl">
            {!isTiebreaking && (
              <span>
                {currentQuestion.order}/{round?.total_questions}
              </span>
            )}
            <i className="fa-regular fa-circle-question lg:text-xl drop-shadow-lg ms-3"></i>
          </div>
        </div>
        <p className="font-semibold lg:text-3xl text-xl drop-shadow-md">
          {currentQuestion.title}
        </p>
      </div>
      <div className="bg-white/80 border border-slate-200 lg:rounded-md text-slate-800 grow place-items-center lg:p-8 p-4 flex gap-4 justify-between">
        {!currentQuestion.is_text_answer && (
          <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-4">
            {answers
              .filter((answer) => answer.question_id === currentQuestion.id)
              .map((answer, index) => (
                <AnswerOption
                  key={answer.id}
                  setSelectedAnswer={setSelectedAnswer}
                  selectedAnswer={
                    selectedAnswers?.get(currentQuestion.id) ?? ""
                  }
                  answerId={answer.id}
                  childNr={index + 1}
                  content={answer.text ?? ""}
                  isTest={false}
                />
              ))}
          </div>
        )}
        {!!currentQuestion.is_text_answer && (
          <OpenAnswer
            guidelines={currentQuestion.guidelines}
            selectedAnswer={text}
            showSubmitButton={true}
            onSubmit={handleSubmit}
            setSelectedAnswer={handleInputChange}
          />
        )}
      </div>

      {currentQuestion.image_url && (
        <button
          onClick={handleViewImage}
          className="bg-white/80 border border-slate-200 hover:bg-white transition-all lg:rounded-md text-slate-800 place-items-center justify-center h-20"
        >
          <div className="font-bold lg:text-2xl text-xl">
            {viewImage ? "Aizvērt attēlu" : "Skatīt attēlu"}
            <i className="fa-regular fa-image lg:text-xl ms-2"></i>
          </div>
        </button>
      )}
    </div>
  );
};
