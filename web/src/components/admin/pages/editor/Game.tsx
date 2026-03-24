import { useEffect, useState } from "react";
import { AdminSessionStorage } from "../../enum/AdminSessionStorage";
import CreateGameModel from "../../models/CreateGameModel";
import useDebounce from "../../../universal/useDebounce";
import { constants } from "../../../../constants";
import { SubmitSaveButton } from "../../ui/SubmitSaveButton";
import { useToast } from "../../../universal/Toast";
import { localizeError, localizeSuccess } from "../../../../localization";
import { useBreadCrumbs } from "../../../universal/BreadCrumbContext";
import { IGame } from "../../interface/IGame";
import { useSidebar } from "../../../universal/AdminGameSidebarContext";

export const AdminGameEditor = () => {
  const [title, setTitle] = useState(CreateGameModel.title);
  const [description, setDescription] = useState(CreateGameModel.description);
  const [isLoaded, setIsLoaded] = useState(false); // for debounce
  const [isLoading, setIsLoading] = useState(false); // for spinner

  const { setBreadCrumbs, clearBreadCrumbs, removeLastBreadCrumb } =
    useBreadCrumbs();

  var formValues: IGame = CreateGameModel;

  const debounceTitle = useDebounce(title, 300);
  const debounceDescription = useDebounce(description, 300);

  const showToast = useToast();
  const { setGame } = useSidebar();

  const saveToSessionStorage = () => {
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
    const response = await fetch(`${constants.baseApiUrl}/games/${values.id}`, {
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
        description: values.description,
        user_id: values.user_id,
      }),
    });

    if (response.ok) {
      setGame(values);
      removeLastBreadCrumb();
      setBreadCrumbs("", formValues.title);
      setIsLoading(false);
      const data = await response.json();
      showToast(true, localizeSuccess(data.message));
    } else {
      setIsLoading(false);
      const data = await response.json();
      Object.keys(data).map((key) =>
        showToast(false, localizeError(data[key]))
      );
    }
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
          <SubmitSaveButton
            hideContinueButton={true}
            showSpinner={isLoading}
            onSave={onFormSubmit}
          />
        </div>
      </form>
    </div>
  );
};
