import { useEffect, useState } from "react";
import { AdminSessionStorage } from "../../enum/AdminSessionStorage";
import useDebounce from "../../../universal/useDebounce";
import CreateQuestionModel from "../../models/CreateQuestionModel";
import { Answer } from "../../ui/Answer";
import { SubmitSaveButton } from "../../ui/SubmitSaveButton";
import { useBreadCrumbs } from "../../../universal/BreadCrumbContext";
import { IQuestion } from "../../interface/IQuestion";
import { useSidebar } from "../../../universal/AdminGameSidebarContext";
import { constants } from "../../../../constants";
import { useToast } from "../../../universal/Toast";
import { localizeError, localizeSuccess } from "../../../../localization";
import { useNavigate } from "react-router-dom";
import { AnswerType } from "../../../universal/AnswerType";
import { useConfirmation } from "../../../universal/ConfirmationWindowContext";

export const GameCreatorQuestion = () => {
  const [question, setQuestion] = useState(CreateQuestionModel.title);
  const [image, setImage] = useState<File>();
  const [imageSourceType, setImageSourceType] = useState<"upload" | "link" | "none">(
    "upload"
  );
  const [isOpenAnswer, setIsOpenAnswer] = useState(
    CreateQuestionModel.is_text_answer
  );
  const [answers, setAnswers] = useState(CreateQuestionModel.answers);
  const [openAnswers, setOpenAnswers] = useState(
    CreateQuestionModel.open_answers
  );
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [imageUrl, setImageUrl] = useState(CreateQuestionModel.image_url);
  const [guidelines, setGuidelines] = useState(CreateQuestionModel.guidelines);

  let formValues: IQuestion = CreateQuestionModel;

  const resolveImagePreviewSrc = (url?: string) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) {
      return url;
    }
    return constants.baseImgUrl + url;
  };

  const { questions, setQuestions, setIsChanged } = useSidebar();

  const [isLoading, setIsLoading] = useState(false); // for spinner

  const [isLoaded, setIsLoaded] = useState(false); // for debounce

  const debounceQuestion = useDebounce(question, 300);
  const debounceIsOpenAnswer = useDebounce(isOpenAnswer, 300);
  const debounceAnswers = useDebounce(answers, 300);
  const debounceOpenAnswers = useDebounce(openAnswers, 300);
  const debounceGuidelines = useDebounce(guidelines, 300);

  const navigate = useNavigate();

  const saveToSessionStorage = () => {
    setIsChanged(true);
    var values = JSON.parse(
      sessionStorage.getItem(AdminSessionStorage.questionCreator) || "{}"
    );

    values = {
      ...values,
      title: formValues.title,
      is_text_answer: formValues.is_text_answer,
      guidelines: formValues.guidelines,
      image_url: formValues.image_url,
      answers: formValues.answers,
    };
    sessionStorage.setItem(
      AdminSessionStorage.questionCreator,
      JSON.stringify(values)
    );
  };

  const loadFormValues = () => {
    return JSON.parse(
      sessionStorage.getItem(AdminSessionStorage.questionCreator) || "{}"
    ) as IQuestion;
  };

  useEffect(() => {
    if (isLoaded) {
      formValues.title = debounceQuestion;
      saveToSessionStorage();
    }
  }, [debounceQuestion]);

  useEffect(() => {
    if (isLoaded) {
      formValues.is_text_answer = debounceIsOpenAnswer;
      saveToSessionStorage();
    }
  }, [debounceIsOpenAnswer]);

  useEffect(() => {
    if (isLoaded) {
      formValues.answers = debounceAnswers;
      saveToSessionStorage();
    }
  }, [debounceAnswers]);

  useEffect(() => {
    if (isLoaded) {
      formValues.open_answers = debounceOpenAnswers;
      saveToSessionStorage();
    }
  }, [debounceOpenAnswers]);

  useEffect(() => {
    if (isLoaded) {
      formValues.guidelines = debounceGuidelines;
      saveToSessionStorage();
    }
  }, [debounceGuidelines]);

  useEffect(() => {
    if (isLoaded) {
      formValues.image_url = imageUrl;
      saveToSessionStorage();
    }
  }, [imageUrl]);

  useEffect(() => {
    const loadedValues = loadFormValues();
    formValues = { ...formValues, ...loadedValues };
    setQuestion(formValues.title);
    setIsOpenAnswer(formValues.is_text_answer);
    setAnswers(formValues.answers);
    setOpenAnswers(formValues.open_answers);
    setImageUrl(formValues.image_url);
    if (!formValues.image_url) {
      setImageSourceType("none");
    } else {
      setImageSourceType(
        /^https?:\/\//i.test(formValues.image_url) ? "link" : "upload"
      );
    }
    setGuidelines(formValues.guidelines);

    setIsLoaded(true);
  }, []);

  const addNewAnswer = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (answers.length < 4) {
      setAnswers([
        ...answers,
        { id: "", text: "", is_correct: false } as AnswerType,
      ]);
    }
  };

  const { setBreadCrumbs, removeLastBreadCrumb } = useBreadCrumbs();

  const showToast = useToast();

  const onFormSubmit = async (e: { preventDefault: () => void }) => {
    setIsLoading(true);
    e.preventDefault();
    const values = JSON.parse(
      sessionStorage.getItem(AdminSessionStorage.questionCreator) || "{}"
    );
    if (!values) {
      return;
    }
    const imageUrlToSubmit =
      imageSourceType === "none"
        ? null
        : imageSourceType === "link"
        ? (imageUrl ?? "").trim() || null
        : values.image_url ?? null;

    const response = await fetch(`${constants.baseApiUrl}/questions`, {
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
        is_text_answer: values.is_text_answer,
        guidelines: values.guidelines,
        image_url: imageUrlToSubmit,
        round_id: values.round_id,
        answers: values.answers,
      }),
    });
    if (response.ok) {
      try {
        if (image) {
          const formData = new FormData();
          formData.append("image", image);
          const response = await fetch(
            `${constants.baseApiUrl}/question-image/${values.id}`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${localStorage.getItem(
                  constants.localStorage.TOKEN
                )}`,
              },
              body: formData,
            }
          );
          if (response.ok) {
            const data = await response.json();
            setImageUrl(data.image_url);
          }
        }
      } catch (error) {
        showToast(false, "Kļūda augšupielādējot attēlu " + error);
      }
      const data = await response.json();
      setIsLoading(false);
      setQuestions([...(questions || []), values]);
      removeLastBreadCrumb();
      setBreadCrumbs("/admin/games/editor/question/" + values.id, values.title);
      showToast(true, localizeSuccess(data.message));

      navigate(`/admin/games/editor/question/${values.id}`);
    } else {
      setIsLoading(false);
      const data = await response.json();
      Object.keys(data).map((key) =>
        showToast!(false, localizeError(data[key]))
      );
    }
    setIsLoading(false);
  };

  const deleteOpenAnswer = async (
    e: { preventDefault: () => void },
    index: number
  ) => {
    e.preventDefault();

    const updatedAnswers = answers.filter((_, i) => i !== index);

    setAnswers(updatedAnswers);
  };

  const confirm = useConfirmation();

  const toggleOpenAnswer = async () => {
    if (answers.length > 0) {
      if (
        await confirm(
          "Vai tiešām mainīt jautājuma veidu? Pašlaik ierakstītās atbildes tiks dzēstas."
        )
      ) {
        setAnswers([]);
        setIsOpenAnswer(!isOpenAnswer);
        return;
      }
      return;
    }
    setIsOpenAnswer(!isOpenAnswer);
  };

  const addOpenAnswer = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setAnswers([
      ...answers,
      { id: "", text: "", is_correct: true } as AnswerType,
    ]);
  };

  return (
    <div className="flex w-full p-4 rounded-md font-[Manrope] grow bg-slate-900 text-slate-100">
      <form
        onSubmit={onFormSubmit}
        className="flex flex-col gap-2 w-full justify-between"
      >
        <div className="flex grow flex-col gap-6">
          <div className="flex gap-6">
            <div className="flex flex-col gap-2 grow">
              <label className="text-lg font-semibold">Jautājums</label>
              <div className="flex">
                <input
                  onChange={(e) => setQuestion(e.target.value)}
                  type="text"
                  placeholder="Kā sauc Latvijas pirmo prezidentu?"
                  className="p-2 px-4 shadow-sm rounded-s-sm grow bg-slate-800 border border-slate-700 text-slate-100"
                  value={question}
                />
                <label
                  htmlFor="imageUpload"
                  onMouseEnter={() => setShowImagePreview(true)}
                  onMouseLeave={() => setShowImagePreview(false)}
                  className={`p-2 rounded-e-sm px-4 ${
                    ((image?.size ?? 0) > 0) || ((imageUrl?.length ?? 0) > 0)
                      ? "bg-[#E63946] hover:bg-opacity-90 text-white"
                      : "bg-slate-700 hover:bg-slate-600 text-slate-100"
                  }`}
                >
                  <i className="fa-solid fa-image"></i>
                  {showImagePreview && (image || imageUrl) && (
                    <div className="w-48 h-48 absolute bg-slate-900 border border-slate-700 shadow-md p-2 rounded-md z-20">
                      <img
                        src={
                          image
                            ? URL.createObjectURL(image)
                            : resolveImagePreviewSrc(imageUrl)
                        }
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </label>
                <input
                  onChange={(e) => {
                    if (e.target.files) {
                      setImage(e.target.files[0]);
                      setImageSourceType("upload");
                      setImageUrl("");
                    }
                  }}
                  id="imageUpload"
                  className="hidden"
                  type="file"
                ></input>
              </div>
              <div className="mt-2 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setImageSourceType("upload")}
                    className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                      imageSourceType === "upload"
                        ? "bg-blue-700 text-white border-blue-600"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    Augšupielādēt attēlu
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageSourceType("link");
                      setImage(undefined);
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                      imageSourceType === "link"
                        ? "bg-blue-700 text-white border-blue-600"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    Ielikt attēla saiti
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageSourceType("none");
                      setImage(undefined);
                      setImageUrl("");
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                      imageSourceType === "none"
                        ? "bg-blue-700 text-white border-blue-600"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    Bez attēla
                  </button>
                </div>
                {imageSourceType === "link" && (
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl ?? ""}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="p-2 px-3 shadow-sm rounded-md bg-slate-800 border border-slate-700 text-slate-100"
                  />
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 place-items-center justify-between">
              <label className="text-lg font-semibold">
                Atvērtais jautājums
              </label>
              <input
                onChange={toggleOpenAnswer}
                type="checkbox"
                className="w-8 h-8 p-2 rounded-md text-center accent-[#E63946]"
                checked={isOpenAnswer}
              />
            </div>
          </div>
          {!isOpenAnswer && (
            <div className="h-full flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div>
                  <label className="text-lg font-semibold">
                    Atbildes ({answers ? answers.length : 0}/4)
                  </label>
                  <button
                    onClick={(e) => addNewAnswer(e)}
                    className="mx-2 px-4 rounded-md shadow-md bg-[#E63946] hover:bg-opacity-80"
                  >
                    <i className="fa-solid text-sm text-white fa-plus"></i>
                  </button>
                </div>
              </div>
              <div className="flex justify-evenly h-full">
                {answers &&
                  answers.map((answer, index) => (
                    <Answer
                      key={index}
                      answer={answer}
                      index={index}
                      onInput={(newPrompt: string) => {
                        const updatedAnswers = [...answers];
                        updatedAnswers[index] = {
                          ...updatedAnswers[index],
                          text: newPrompt,
                        };
                        setAnswers(updatedAnswers);
                      }}
                      onChecked={(isCorrect: boolean) => {
                        const updatedAnswers = [...answers];
                        updatedAnswers[index] = {
                          ...updatedAnswers[index],
                          is_correct: isCorrect,
                        };
                        setAnswers(updatedAnswers);
                      }}
                      onDelete={() => {
                        const updatedAnswers = [...answers];
                        if (answers.length > 1) {
                          setAnswers(
                            updatedAnswers.filter(
                              (item) => item !== updatedAnswers[index]
                            )
                          );
                        }
                      }}
                    />
                  ))}
              </div>
            </div>
          )}
          {isOpenAnswer && (
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-lg">
                Spēlētājs uz šo jautājumu atbildi sniegs rakstiski.
              </span>
              <label className="" htmlFor="guidelines">
                Ievades instrukcijas spēlētājam:
              </label>
              <input
                id="guidelines"
                type="text"
                className="w-full h-10 px-2 rounded-md shadow-sm bg-slate-800 border border-slate-700 text-slate-100"
                value={guidelines}
                onChange={(e) => setGuidelines(e.target.value)}
              />
              <label>Pareizās atbildes:</label>
              <ul>
                {answers.map((answer, index) => (
                  <li className="mb-2 flex gap-1" key={index}>
                    <input
                      type="text"
                      className="w-72 h-10 px-2 rounded-s-md shadow-sm bg-slate-800 border border-slate-700 text-slate-100"
                      placeholder="j.čakste"
                      value={answer.text}
                      onChange={(e) => {
                        const updatedAnswers = [...answers];
                        updatedAnswers[index] = {
                          ...updatedAnswers[index],
                          text: e.target.value,
                        };
                        setAnswers(updatedAnswers);
                      }}
                    />
                    <button
                      onClick={(e) => deleteOpenAnswer(e, index)}
                      className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-e-md shadow-sm hover:bg-red-900/40"
                    >
                      <i className="fa-regular  fa-trash-can"></i>
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={addOpenAnswer}
                    className="w-[332px] h-10 rounded-md text-white text-lg shadow-sm hover:opacity-70 bg-[#E63946]"
                  >
                    <i className="fa-plus fa-solid"></i>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
        <div className="flex gap-6 justify-end">
          <SubmitSaveButton showSpinner={isLoading} hideSaveButton={true} />
        </div>
      </form>
    </div>
  );
};
