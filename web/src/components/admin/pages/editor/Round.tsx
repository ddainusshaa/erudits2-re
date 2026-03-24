import { useEffect, useState } from "react";
import { AdminSessionStorage } from "../../enum/AdminSessionStorage";
import CreateRoundModel from "../../models/CreateRoundModel";
import useDebounce from "../../../universal/useDebounce";
import { constants } from "../../../../constants";
import { localizeError, localizeSuccess } from "../../../../localization";
import { useToast } from "../../../universal/Toast";
import { SubmitSaveButton } from "../../ui/SubmitSaveButton";
import { useBreadCrumbs } from "../../../universal/BreadCrumbContext";
import { IRound } from "../../interface/IRound";
import { useSidebar } from "../../../universal/AdminGameSidebarContext";
import { useParams } from "react-router-dom";

export const GameEditorQuestionRound = () => {
  const [title, setTitle] = useState(CreateRoundModel.title);
  const [disqualifyAmount, setDisqualifyAmount] = useState(
    CreateRoundModel.disqualify_amount
  );
  const [answerTime, setAnswerTime] = useState(CreateRoundModel.answer_time);
  const [points, setPoints] = useState(CreateRoundModel.points);
  const [isAdditional, setIsAdditional] = useState(
    CreateRoundModel.is_additional
  );
  const [isTest, setIsTest] = useState(CreateRoundModel.is_test);

  const [isLoading, setIsLoading] = useState(false); // for spinner

  const [isLoaded, setIsLoaded] = useState(false); // for debounce

  let formValues: IRound = CreateRoundModel;

  const { rounds, game } = useSidebar();

  const { roundId } = useParams();

  const debounceTitle = useDebounce(title, 300);
  const debounceDisqualifyAmount = useDebounce(disqualifyAmount, 300);
  const debounceAnswerTime = useDebounce(answerTime, 300);
  const debouncePoints = useDebounce(points, 300);
  const debounceIsAdditional = useDebounce(isAdditional, 300);
  const debounceIsTest = useDebounce(isTest, 300);

  const showToast = useToast();

  const saveToSessionStorage = () => {
    var values = JSON.parse(
      sessionStorage.getItem(AdminSessionStorage.roundCreator) || "{}"
    );

    values = {
      ...values,
      title: formValues.title,
      disqualify_amount: formValues.disqualify_amount,
      answer_time: formValues.answer_time,
      points: formValues.points,
      is_additional: formValues.is_additional,
      is_test: formValues.is_test,
    };
    sessionStorage.setItem(
      AdminSessionStorage.roundCreator,
      JSON.stringify(values)
    );
  };

  const loadFormValues = () => {
    return JSON.parse(
      sessionStorage.getItem(AdminSessionStorage.roundCreator) || "{}"
    ) as IRound;
  };

  useEffect(() => {
    if (isLoaded) {
      formValues.title = debounceTitle;
      saveToSessionStorage();
    }
  }, [debounceTitle]);

  useEffect(() => {
    if (isLoaded) {
      formValues.disqualify_amount = debounceDisqualifyAmount;
      saveToSessionStorage();
    }
  }, [debounceDisqualifyAmount]);

  useEffect(() => {
    if (isLoaded) {
      formValues.answer_time = debounceAnswerTime;
      saveToSessionStorage();
    }
  }, [debounceAnswerTime]);

  useEffect(() => {
    if (isLoaded) {
      formValues.points = debouncePoints;
      saveToSessionStorage();
    }
  }, [debouncePoints]);

  useEffect(() => {
    if (isLoaded) {
      formValues.is_additional = debounceIsAdditional;
      saveToSessionStorage();
    }
  }, [debounceIsAdditional]);

  useEffect(() => {
    if (isLoaded) {
      formValues.is_test = debounceIsTest;
      saveToSessionStorage();
    }
  }, [debounceIsTest]);

  const { setBreadCrumbs, clearBreadCrumbs, removeLastBreadCrumb } =
    useBreadCrumbs();

  useEffect(() => {
    formValues = loadFormValues();
    setTitle(formValues.title);
    setDisqualifyAmount(formValues.disqualify_amount);
    setAnswerTime(formValues.answer_time);
    setPoints(formValues.points);
    setIsAdditional(formValues.is_additional);
    setIsTest(formValues.is_test);

    clearBreadCrumbs();
    setBreadCrumbs("/admin/games", "Spēļu saraksts");
    setBreadCrumbs(
      "/admin/games/editor/game/" + game?.id,
      game?.title ?? "Spēle"
    );
    setBreadCrumbs(
      "/admin/games/editor/round/" + formValues.id,
      formValues.title
    );

    setIsLoaded(true);
  }, [roundId]);

  const onFormSubmit = async (e: { preventDefault: () => void }) => {
    setIsLoading(true);
    e.preventDefault();
    const values = JSON.parse(
      sessionStorage.getItem(AdminSessionStorage.roundCreator) || "{}"
    );
    if (!values) {
      return;
    }
    const response = await fetch(
      `${constants.baseApiUrl}/rounds/${values.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(
            constants.localStorage.TOKEN
          )}`,
        },
        body: JSON.stringify({
          id: values.id,
          title: values.title,
          disqualify_amount: values.disqualify_amount,
          answer_time: values.answer_time,
          points: values.points,
          is_additional: values.is_additional,
          game_id: values.game_id,
          is_test: values.is_test,
        }),
      }
    );
    if (response.ok) {
      const data = await response.json();
      const updatedRounds = rounds?.findIndex(
        (round) => round.id === values.id
      );
      rounds![updatedRounds!] = data.round;

      removeLastBreadCrumb();
      setBreadCrumbs("", formValues.title);

      showToast(true, localizeSuccess(data.message));
      setIsLoading(false);
    } else {
      setIsLoading(false);
      const data = await response.json();
      Object.keys(data).map((key) =>
        showToast!(false, localizeError(data[key]))
      );
    }
  };

  return (
    <div className="flex w-full p-4 rounded-md font-[Manrope] grow bg-white">
      <form
        onSubmit={onFormSubmit}
        className="flex flex-col gap-2 w-full justify-between"
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-lg font-semibold">Kārtas nosaukums</label>
            <input
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              className="p-2 px-4 shadow-sm rounded-sm bg-slate-100"
              value={title}
            />
          </div>
          <div className="flex justify-between px-16">
            <div className="flex flex-col gap-2 place-items-center">
              <label className="text-lg font-semibold">
                Diskvalificēto skaits
              </label>
              <div className="flex place-items-center gap-6 justify-center w-full">
                <i className="fa-solid fa-person-circle-minus text-2xl text-slate-600"></i>
                <input
                  onChange={(e) =>
                    setDisqualifyAmount(parseInt(e.target.value))
                  }
                  min={0}
                  type="number"
                  className="w-24 p-2 bg-slate-100 rounded-md text-center"
                  value={disqualifyAmount}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 place-items-center">
              <label className="text-lg font-semibold">
                Laiks atbildei (sek.)
              </label>
              <div className="flex place-items-center gap-6 justify-center w-full">
                <i className="fa-solid fa-stopwatch text-2xl text-slate-600"></i>
                <input
                  onChange={(e) => setAnswerTime(parseInt(e.target.value))}
                  type="number"
                  min={0}
                  className="w-24 p-2 bg-slate-100 rounded-md text-center"
                  value={answerTime}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 place-items-center">
              <label className="text-lg font-semibold">
                Punktu skaits par pareizu atbildi
              </label>
              <div className="flex place-items-center gap-6 justify-center w-full">
                <i className="fa-solid fa-bullseye text-2xl text-slate-600"></i>
                <input
                  onChange={(e) => setPoints(parseInt(e.target.value))}
                  type="number"
                  min={0}
                  className="w-24 p-2 bg-slate-100 rounded-md text-center"
                  value={points}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 place-items-center justify-between">
              <label className="text-lg font-semibold">
                Šie ir papildjautājumi
              </label>
              <input
                onChange={() => setIsAdditional(!isAdditional)}
                type="checkbox"
                className={`w-10 h-10 p-2 rounded-md text-center accent-[#E63946] ${
                  isTest ? "cursor-not-allowed" : ""
                }`}
                checked={isAdditional}
                disabled={isTest}
              />
            </div>
            <div className="flex flex-col gap-2 place-items-center justify-between">
              <label className="text-lg font-semibold">Testa veida</label>
              <input
                onChange={() => setIsTest(!isTest)}
                type="checkbox"
                disabled={isAdditional}
                className={`w-10 h-10 p-2 rounded-md text-center accent-[#E63946] ${
                  isAdditional ? "cursor-not-allowed" : ""
                }`}
                checked={isTest}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-6 place-self-end">
          <SubmitSaveButton
            showSpinner={isLoading}
            hideSaveButton={false}
            hideContinueButton={true}
          />
        </div>
      </form>
    </div>
  );
};
