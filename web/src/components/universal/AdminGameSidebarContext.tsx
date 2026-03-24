import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { IGame } from "../admin/interface/IGame";
import { IRound } from "../admin/interface/IRound";
import { IQuestion } from "../admin/interface/IQuestion";
import { constants } from "../../constants";
import { AdminSessionStorage } from "../admin/enum/AdminSessionStorage";

type AdminSidebarContextType = {
  game: IGame | undefined;
  rounds: IRound[] | undefined;
  questions: IQuestion[] | undefined;
  setGame: (game: IGame) => void;
  setRounds: (rounds: IRound[]) => void;
  setQuestions: (questions: IQuestion[]) => void;
  clearSidebar: () => void;
  isChanged: boolean;
  setIsChanged: (isChanged: boolean) => void;
};

const AdminGameSidebarContext = createContext<
  AdminSidebarContextType | undefined
>(undefined);

export const useSidebar = () => {
  const context = useContext(AdminGameSidebarContext);
  if (!context) {
    throw new Error(
      "AdminGameSidebarContext must be used within a AdminGameSidebarProvider"
    );
  }
  return context;
};

export const AdminSidebarProvider = ({ children }: { children: ReactNode }) => {
  const [game, setGame] = useState<IGame | undefined>(undefined);
  const [rounds, setRounds] = useState<IRound[] | undefined>(undefined);
  const [questions, setQuestions] = useState<IQuestion[] | undefined>(
    undefined
  );
  const [isChanged, setIsChanged] = useState(false);

  const getGameData = async () => {
    const game = JSON.parse(
      sessionStorage.getItem(AdminSessionStorage.gameCreator) || "{}"
    ) as IGame;

    if (!game.id) return;

    const response = await fetch(
      `${constants.baseApiUrl}/full-game/${game.id}`,
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
      if (data.game) {
        sessionStorage.setItem(
          AdminSessionStorage.gameCreator,
          JSON.stringify(data.game)
        );
        setGame(data.game);
      }
      if (data.rounds) {
        sessionStorage.setItem(
          AdminSessionStorage.roundCreator,
          JSON.stringify(data.rounds)
        );
        setRounds(data.rounds);
      }
      if (data.questions) {
        sessionStorage.setItem(
          AdminSessionStorage.questionCreator,
          JSON.stringify(data.questions)
        );
        setQuestions(data.questions);
      }
    }
  };

  const clearSidebar = () => {
    setGame(undefined);
    setRounds(undefined);
    setQuestions(undefined);
  };

  useEffect(() => {
    getGameData();
  }, []);

  return (
    <AdminGameSidebarContext.Provider
      value={{
        game,
        rounds,
        questions,
        setGame,
        setRounds,
        setQuestions,
        clearSidebar,
        isChanged,
        setIsChanged,
      }}
    >
      {children}
    </AdminGameSidebarContext.Provider>
  );
};
