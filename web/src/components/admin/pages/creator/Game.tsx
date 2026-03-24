import { useEffect, useState } from "react";
import { AdminSessionStorage } from "../../enum/AdminSessionStorage";
import CreateGameModel from "../../models/CreateGameModel";
import useDebounce from "../../../universal/useDebounce";
import { constants } from "../../../../constants";
import { useNavigate } from "react-router-dom";
import { SubmitSaveButton } from "../../ui/SubmitSaveButton";
import { useToast } from "../../../universal/Toast";
import { localizeError, localizeSuccess } from "../../../../localization";
import { useBreadCrumbs } from "../../../universal/BreadCrumbContext";
import { IGame } from "../../interface/IGame";
import { useSidebar } from "../../../universal/AdminGameSidebarContext";

export const AdminGameCreator = () => {
  const [title, setTitle] = useState(CreateGameModel.title);
  const [description, setDescription] = useState(CreateGameModel.description);
  const [isLoaded, setIsLoaded] = useState(false); // for debounce
  const [isLoading, setIsLoading] = useState(false); // for spinner
  const { setBreadCrumbs, clearBreadCrumbs } = useBreadCrumbs();

  var formValues: IGame = CreateGameModel;

  const navigate = useNavigate();

  const debounceTitle = useDebounce(title, 300);
  const debounceDescription = useDebounce(description, 300);

  const showToast = useToast();
  const { setGame, clearSidebar, setIsChanged } = useSidebar();

  const saveToSessionStorage = () => {
    setIsChanged(true);
    var values = JSON.parse(
      sessionStorage.getItem(AdminSessionStorage.gameCreator) || "{}"
    );

    values = { ...values, title, description };
    sessionStorage.setItem(
      AdminSessionStorage.gameCreator,
      JSON.stringify(values)
    );
  };

  const loadFormValues = () => {
    return JSON.parse(
      sessionStorage.getItem(AdminSessionStorage.gameCreator) || "{}"
    ) as IGame;
  };

  useEffect(() => {
    if (isLoaded) {
      formValues.title = debounceTitle;
      saveToSessionStorage();
    }
  }, [debounceTitle]);

  useEffect(() => {
    if (isLoaded) {
      formValues.description = debounceDescription;
      saveToSessionStorage();
    }
  }, [debounceDescription]);

  useEffect(() => {
    clearSidebar();
    formValues = loadFormValues();
    setTitle(formValues.title);
    setDescription(formValues.description);
    clearBreadCrumbs();
    setBreadCrumbs("/admin/games", "Spēļu saraksts");
    setBreadCrumbs("", formValues.title);
    setIsLoaded(true);
  }, []);

  const onFormSubmit = async (e: { preventDefault: () => void }) => {
    setIsLoading(true);
    e.preventDefault();
    const values = JSON.parse(
      sessionStorage.getItem(AdminSessionStorage.gameCreator) || "{}"
    );

    if (!values) {
      return;
    }
    const response = await fetch(`${constants.baseApiUrl}/games`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem(
          constants.localStorage.TOKEN
        )}`,
      },
      body: JSON.stringify({
        id: values.id,
        title: values.title,
        description: values.description,
        user_id: values.user_id,
      }),
    });

    if (response.ok) {
      setGame(values);
      clearBreadCrumbs();
      setBreadCrumbs("/admin/games", "Spēļu saraksts");
      setBreadCrumbs("/admin/games/editor/game/" + values.id, values.title);
      setBreadCrumbs("", "Spēles kārta");
      setIsLoading(false);
      const data = await response.json();
      showToast(true, localizeSuccess(data.message));
      await createRound();
    } else {
      setIsLoading(false);
      const data = await response.json();
      Object.keys(data).map((key) =>
        showToast!(false, localizeError(data[key]))
      );
    }
  };

  const createRound = async () => {
    setIsLoading(true);
    const values = JSON.parse(
      sessionStorage.getItem(AdminSessionStorage.gameCreator) || "{}"
    );
    if (!values) {
      return;
    }
    sessionStorage.setItem(AdminSessionStorage.gameId, values.id);
    const response = await fetch(
      `${constants.baseApiUrl}/create-round/${values.id}`,
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
      sessionStorage.setItem(
        AdminSessionStorage.roundCreator,
        JSON.stringify({
          id: data.round.id,
          title: data.round.title,
          disqualify_amount: data.round.disqualify_amount,
          points: data.round.points,
          answer_time: data.round.answer_time,
          is_additional: data.round.is_additional,
          game_id: data.round.game_id,
          is_test: data.round.is_test,
        })
      );
      navigate(`/admin/games/creator/round/${data.round.id}`);
    } else {
      console.error("Failed to create game:", response.statusText);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex w-full p-4 rounded-md font-[Manrope] grow bg-white">
      <form
        onSubmit={(e) => onFormSubmit(e)}
        className="flex flex-col gap-2 w-full justify-between"
      >
        <div className="flex flex-col gap-2">
          <label className="text-lg font-semibold">Spēles nosaukums</label>
          <input
            onChange={(e) => setTitle(e.target.value)}
            type="text"
            className="p-2 px-4 shadow-sm rounded-sm bg-slate-100"
            value={title}
          />
          <label className="text-lg font-semibold">Apraksts</label>
          <textarea
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            className="p-2 px-4 shadow-sm h-40 rounded-sm bg-slate-100 resize-none"
          />
        </div>
        <div className="place-self-end">
          <SubmitSaveButton showSpinner={isLoading} hideSaveButton={true} />
        </div>
      </form>
    </div>
  );
};
