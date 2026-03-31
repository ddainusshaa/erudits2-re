import { useEffect, useState } from "react";
import { constants } from "../../../constants";
import { IGame } from "../interface/IGame";
import { useToast } from "../../universal/Toast";
import { SpinnerCircularFixed } from "spinners-react";
import { localizeError, localizeSuccess } from "../../../localization";

export const ActivationModal = ({
  game,
  onClose,
}: {
  game: IGame;
  onClose: (succeess?: boolean) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState("");
  const [privateGame, setPrivateGame] = useState(false);
  const [expiryDate, setExpiryDate] = useState(new Date());
  const showToast = useToast();

  const handleCancel = () => {
    onClose();
  };

  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  useEffect(() => {
    setExpiryDate(getTomorrow());
  }, []);

  const handleConfirm = async () => {
    setIsLoading(true);
    if (code.length < 3) {
      showToast(false, "Kods nedrīkst būt īsāks par 3 rakstzīmēm");
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(`${constants.baseApiUrl}/activate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            constants.localStorage.TOKEN
          )}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
          private: privateGame,
          game_id: game.id,
          end_date: expiryDate.toISOString().split("T")[0],
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        const message = localizeSuccess(data.message ?? "Spēle aktivizēta");
        console.log(message);
        showToast(true, message);
        onClose(true);
        return;
      }

      const errorMessage = localizeError(
        data.message ?? data.error ?? "Neizdevās aktivizēt spēli"
      );
      console.log(errorMessage);
      showToast(false, errorMessage);
    } catch {
      showToast(false, "Neizdevās sazināties ar serveri");
    } finally {
      setIsLoading(false);
    }
  };

  const setCodeValue = (e: {
    target: {
      value: string;
    };
  }) => {
    if (
      e.target.value === "" ||
      (/^[a-zA-Z0-9]+$/.test(e.target.value) && e.target.value.length <= 6)
    ) {
      setCode(e.target.value.toUpperCase());
    }
  };

  return (
    <div className="fixed inset-0 flex place-items-center justify-center z-40 bg-black/40 backdrop-blur-sm p-4">
      <div className="min-w-96 rounded-md bg-slate-900 border border-slate-700 text-slate-100 shadow-md">
        <div className="flex place-items-center py-2 px-4 justify-between border-b border-slate-700">
          <div className="flex place-items-center gap-2">
            <i className="fa-solid fa-circle-exclamation text-xl text-blue-400"></i>
            <h2 className="font-bold">Spēles aktivizēšana</h2>
          </div>
          <button disabled={isLoading} onClick={handleCancel} className="text-slate-300 hover:text-slate-100 transition-colors">
            <i className="fa-xmark fa-solid text-xl"></i>
          </button>
        </div>
        <div className="pb-4 pt-4 px-16 gap-4 flex flex-col place-items-center justify-center">
          <p className="font-semibold text-lg">Spēle "{game.title}"</p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="code" className="font-semibold">
                Pieslēgšanās kods
              </label>
              <input
                className="w-80 h-8 bg-slate-800 border border-slate-700 shadow-sm px-2 text-center text-xl font-bold text-slate-100"
                type="text"
                placeholder="123ABC"
                value={code}
                onChange={setCodeValue}
                min={3}
                id="code"
                max={6}
              />
            </div>
            <div className="flex gap-2 place-items-center">
              <input
                id="privateGame"
                className="h-6 w-6 bg-slate-800 border border-slate-700 shadow-sm px-1 text-xl font-bold accent-blue-600"
                type="checkbox"
                checked={privateGame}
                onChange={() => setPrivateGame(!privateGame)}
              />
              <label htmlFor="privateGame" className="font-semibold">
                Privāta spēle
              </label>
              <i
                title="Privātas spēles nav redzamas lokālajā tīklā un ir pieejamas tikai ar kodu."
                className="fa-solid fa-info-circle text-sm text-slate-400"
              ></i>
            </div>
            <div className="flex gap-2 place-items-center">
              <label htmlFor="expiryDate" className="font-semibold">
                Aktīvs līdz
              </label>
              <input
                id="expiryDate"
                className="bg-slate-800 text-slate-100 shadow-sm p-1 border border-slate-700"
                min={getTomorrow().toISOString().split("T")[0]}
                type="date"
                value={expiryDate.toISOString().split("T")[0]}
                onChange={(e) => {
                  if (e.target.valueAsDate) {
                    setExpiryDate(e.target.valueAsDate);
                  }
                }}
              />
            </div>
          </div>
          <div className="flex gap-8">
            <button
              className="px-6 py-1 w-36 bg-slate-700 text-slate-100 font-bold hover:bg-slate-600 rounded-md shadow-sm transition-all text-lg"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Atcelt
            </button>
            <button
              disabled={isLoading}
              className="px-6 py-1 text-white text-lg font-bold hover:bg-blue-600 w-36 shadow-sm transition-all disabled:bg-slate-600 bg-blue-700 rounded-md"
              onClick={handleConfirm}
            >
              {isLoading ? (
                <div className="mx-auto w-6">
                  <SpinnerCircularFixed
                    color="#fff"
                    size={24}
                    thickness={180}
                  />
                </div>
              ) : (
                "Aktivizēt"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
