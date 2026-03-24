import { useState } from "react";
import { IRound } from "../../interface/IRound";
import { formatText } from "../../../universal/functions";
import { useSidebar } from "../../../universal/AdminGameSidebarContext";
import { AdminSessionStorage } from "../../enum/AdminSessionStorage";
import { constants } from "../../../../constants";
import { useBreadCrumbs } from "../../../universal/BreadCrumbContext";
import { useNavigate, useParams } from "react-router-dom";
import { SpinnerCircularFixed } from "spinners-react";
import { IQuestion } from "../../interface/IQuestion";
import { useConfirmation } from "../../../universal/ConfirmationWindowContext";
import { useToast } from "../../../universal/Toast";

export const SidebarRound = ({ round }: { round: IRound }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { game, questions, setQuestions, setRounds, rounds } = useSidebar();
  const navigate = useNavigate();
  const { setBreadCrumbs, clearBreadCrumbs } = useBreadCrumbs();
  const showToast = useToast();

  const roundQuestions = questions?.filter(
    (question) => question.round_id === round.id
  );

  const confirm = useConfirmation();

  const { roundId, questionId } = useParams();

  const createQuestion = async () => {
    setIsLoading(true);
    const response = await fetch(
      `${constants.baseApiUrl}/create-question/${round.id}`,
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
      setBreadCrumbs("/admin/games/editor/round/" + round.id, round.title);
      setBreadCrumbs("", "Spēles jautājums");
      sessionStorage.setItem(
        AdminSessionStorage.questionCreator,
        JSON.stringify({
          id: data.question.id,
          title: data.question.title,
          is_text_answer: data.question.is_text_answer,
          guidelines: data.question.guidelines,
          image_url: data.question.image_url,
          round_id: data.question.round_id,
          answers: data.question.answers,
        })
      );
      navigate(`/admin/games/creator/question/${data.question.id}`);
    } else {
      console.error("Failed to create question:", response.statusText);
    }
    setIsLoading(false);
  };

  const openRoundEditor = () => {
    sessionStorage.setItem(
      AdminSessionStorage.roundCreator,
      JSON.stringify({
        id: round.id,
        title: round.title,
        disqualify_amount: round.disqualify_amount,
        points: round.points,
        answer_time: round.answer_time,
        is_additional: round.is_additional,
        game_id: round.game_id,
        is_test: round.is_test,
      })
    );
    navigate(`/admin/games/editor/round/${round.id}`);
  };

  const openQuestionEditor = (question: IQuestion) => {
    sessionStorage.setItem(
      AdminSessionStorage.questionCreator,
      JSON.stringify({
        id: question.id,
        title: question.title,
        is_text_answer: question.is_text_answer,
        guidelines: question.guidelines,
        image_url: question.image_url,
        round_id: question.round_id,
        answers: question.answers,
      })
    );
    navigate(`/admin/games/editor/question/${question.id}`);
  };

  const deleteQuestion = async (question: IQuestion) => {
    if (await confirm("Vai tiešām dzēst šo jautājumu?")) {
      const response = await fetch(
        `${constants.baseApiUrl}/questions/${question.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              constants.localStorage.TOKEN
            )}`,
          },
        }
      );

      if (response.ok) {
        showToast(true, "Jautājums veikmīgi dzēsts");

        const updatedQuestions = questions?.filter((q) => q.id !== question.id);
        setQuestions(updatedQuestions!);
        if (questionId === question.id) {
          navigate(`/admin/games/editor/round/${round.id}`);
        }
      } else {
        showToast(false, "Kļūda jautājuma dzēšanā");
      }
    }
  };

  const deleteRound = async () => {
    if (await confirm("Vai tiešām dzēst šo kārtu?")) {
      const response = await fetch(
        `${constants.baseApiUrl}/rounds/${round.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              constants.localStorage.TOKEN
            )}`,
          },
        }
      );

      if (response.ok) {
        showToast(true, "Kārta veiksmīgi dzēsta");
        const updatedRounds = rounds?.filter((q) => q.id !== round.id);
        setRounds(updatedRounds!);

        if (roundId === round.id) {
          navigate(`/admin/games/editor/game/${game!.id}`);
        }
      } else {
        showToast(false, "Kļūda kārtas dzēšanā");
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="bg-slate-200 font-semibold w-10 h-10 rounded-md hover:bg-slate-100 disabled:pointer disabled:hover:bg-slate-200 disabled:opacity-90"
        >
          <i
            className={`fa-solid fa-caret-${isCollapsed ? "down" : "right"}`}
          ></i>
        </button>
        <button
          onClick={openRoundEditor}
          className="bg-slate-200 font-semibold grow h-10 rounded-md hover:bg-slate-100 px-2"
        >
          {formatText(round.title, 20)} - {roundQuestions?.length ?? 0}{" "}
          <i className="fa-regular fa-circle-question"></i>
        </button>
        <button
          onClick={deleteRound}
          className="px-3 hover:bg-red-100 bg-slate-200 rounded-md h-10"
        >
          <i className="fa-regular fa-trash-can"></i>
        </button>
      </div>
      {isCollapsed && (
        <div className="flex flex-col gap-2">
          {roundQuestions &&
            roundQuestions.map((question, index) => (
              <div key={index} className="w-full gap-[1px] flex">
                <button
                  className="grow bg-slate-100 rounded-s-md h-8"
                  onClick={() => openQuestionEditor(question)}
                >
                  {formatText(question.title, 20)}
                </button>
                <button
                  onClick={() => deleteQuestion(question)}
                  className="px-2 hover:bg-red-100 bg-slate-100 rounded-e-md h-8"
                >
                  <i className="fa-regular fa-trash-can"></i>
                </button>
              </div>
            ))}

          <button
            onClick={createQuestion}
            className="bg-slate-100 w-full h-8 rounded-md p-1 hover:bg-slate-50"
          >
            {!isLoading && <i className="fa-solid fa-plus"></i>}
            {isLoading && (
              <div className="mx-auto w-4">
                <SpinnerCircularFixed
                  color="#ffffff"
                  size={16}
                  thickness={180}
                />
              </div>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
