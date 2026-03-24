import { PlayerLocalStorage } from "../player/enum/PlayerLocalStorage";

interface IInstanceProps {
  code: string;
  description: string;
  title: string;
  postJoin: (code: string) => void;
}

const InstanceCard = ({
  code,
  description,
  title,
  postJoin,
}: IInstanceProps) => {
  const handleJoin = () => {
    localStorage.removeItem(PlayerLocalStorage.currentGame);
    localStorage.removeItem(PlayerLocalStorage.currentPlayer);
    localStorage.removeItem(PlayerLocalStorage.answers);

    postJoin(code);
  };

  return (
    <div className="bg-black bg-opacity-25 h-72 p-6 rounded-md justify-between flex flex-col shadow-lg">
      <div className="flex flex-col gap-2">
        <h1 className="text-white text-3xl font-semibold">{title}</h1>
        <hr className="opacity-50" />
        <p className="text-white">{description}</p>
      </div>
      <button
        onClick={handleJoin}
        className="place-self-end px-8 py-1 bg-[#E63946] rounded-md shadow-lg text-white text-xl font-semibold hover:bg-opacity-50 transition-all hover:cursor-pointer"
      >
        Spēlēt
      </button>
    </div>
  );
};

export default InstanceCard;
