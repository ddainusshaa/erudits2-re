import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import echo from "../../useEcho";
import { IPlayer } from "../admin/interface/IPlayer";
import { IQuestion } from "../admin/interface/IQuestion";
import { constants } from "../../constants";
import { IGame } from "../admin/interface/IGame";
import { IInstance } from "../admin/interface/IInstance";
import { IRound } from "../admin/interface/IRound";
import { useNavigate, useParams } from "react-router-dom";
import { ITitleId } from "../admin/interface/ITitleId";

export interface IPlayerAnswer {
  player_name: string;
  questions: IInstanceQuestion[];
  round_finished: boolean;
}

interface IInstanceQuestion {
  id: string;
  title: string;
  answer: string;
  is_correct: number;
}

interface IInstanceInfo {
  players: number;
  answered_players: number;
  current_question_id?: string | null;
  current_question: string;
  answer_time: number;
  current_round: string;
  started_at: string;
  server_now?: string;
  game_started: boolean;
  round_questions: IQuestion[];
  disqualify_amount: number;
  is_test: boolean;
}

export interface IGameController {
  instance_info: IInstanceInfo;
  player_answers: IPlayerAnswer[];
}

export interface TiebreakAnswer {
  player_id: string;
  player_name: string;
  question: string;
  answer: string;
  correct_answer: string;
  is_correct: boolean;
  timestamp: string;
}

export interface PlayerDevtoolsSignal {
  isOpen: boolean;
  detectedAt: string;
}

type AdminPanelContextType = {
  currentRound: ITitleId | undefined;
  setCurrentRound: (round: ITitleId) => void;
  currentQuestion: ITitleId | undefined;
  setCurrentQuestion: (question: ITitleId) => void;
  players: IPlayer[];
  gameController: IGameController | undefined;
  instanceId: string | undefined;
  fetchPlayers: () => void;
  fetchQuestionInfo: () => void;
  setPlayers: (players: IPlayer[]) => void;
  setGameController: (gameController: IGameController) => void;
  game: IGame | undefined;
  instance: IInstance | undefined;
  rounds: IRound[];
  questions: IQuestion[];
  setGame: (game: IGame) => void;
  setInstance: (instance: IInstance) => void;
  setRounds: (rounds: IRound[]) => void;
  setQuestions: (questions: IQuestion[]) => void;
  setGameInProgress: (gameInProgress: boolean) => void;
  gameInProgress: boolean;
  isBuzzerMode: boolean;
  setIsBuzzerMode: (isBuzzerMode: boolean) => void;
  tiebreakAnswers: TiebreakAnswer[];
  setTiebreakAnswers: (answers: TiebreakAnswer[]) => void;
  devtoolsSignals: Record<string, PlayerDevtoolsSignal>;
};

const AdminPanelContext = createContext<AdminPanelContextType | undefined>(
  undefined
);

export const useAdminPanel = () => {
  const context = useContext(AdminPanelContext);
  if (!context) {
    throw new Error(
      "AdminPanelContext must be used within a AdminPanelProvider"
    );
  }
  return context;
};

export const AdminPanelProvider = ({ children }: { children: ReactNode }) => {
  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [gameController, setGameController] = useState<IGameController>();
  const [currentRound, setCurrentRound] = useState<ITitleId>();
  const [currentQuestion, setCurrentQuestion] = useState<ITitleId>();
  const [game, setGame] = useState<IGame>();
  const [instance, setInstance] = useState<IInstance>();
  const [rounds, setRounds] = useState<IRound[]>([]);
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [gameInProgress, setGameInProgress] = useState(false);
  const [isBuzzerMode, setIsBuzzerMode] = useState(false);
  const [tiebreakAnswers, setTiebreakAnswers] = useState<TiebreakAnswer[]>([]);
  const [devtoolsSignals, setDevtoolsSignals] = useState<
    Record<string, PlayerDevtoolsSignal>
  >({});

  const { instanceId } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    fetchGame();
  }, []);

  useEffect(() => {
    if (!instanceId) return;
    fetchQuestionInfo();
    setDevtoolsSignals({});
  }, [instanceId]);

  useEffect(() => {
    if (!instanceId) return;
    const gameChannel = echo.channel(`game.${instanceId}`);
    const playerChannel = echo.channel(`refresh-players.${instanceId}`);
    const tiebreakAnswerChannel = echo.channel(`tiebreak-answer.${instanceId}`);

    gameChannel.listen(".game-control-event", () => {
      fetchQuestionInfo();
    });

    playerChannel.listen(".refresh-players-event", () => {
      fetchPlayers();
      fetchQuestionInfo();
    });

    playerChannel.listen(".player-devtools-event", (data: any) => {
      if (!data?.player_id) return;
      setDevtoolsSignals((prev) => ({
        ...prev,
        [data.player_id]: {
          isOpen: !!data.is_open,
          detectedAt: data.detected_at,
        },
      }));
    });

    tiebreakAnswerChannel.listen(
      ".tiebreak-answer-event",
      (data: TiebreakAnswer) => {
        setTiebreakAnswers((prevTiebreakAnswers) => {
          const filteredAnswers = prevTiebreakAnswers.filter(
            (answer) => answer.player_id !== data.player_id
          );
          return [...filteredAnswers, data];
        });
      }
    );

    return () => {
      gameChannel.stopListening(".game-control-event");
      gameChannel.stopListening(".tiebreak-answer-event");
      playerChannel.stopListening(".refresh-players-event");
      playerChannel.stopListening(".player-devtools-event");
    };
  }, [instanceId]);

  const fetchQuestionInfo = async () => {
    if (!instanceId) return;
    try {
      const response = await fetch(
        `${constants.baseApiUrl}/game-controller-info/${instanceId}`,
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
        setGameController(data);
      }
    } catch (error) {
      console.error("Failed to fetch question info", error);
    }
  };

  const fetchPlayers = async () => {
    if (!instanceId) return;
    try {
      const response = await fetch(
        `${constants.baseApiUrl}/players/${instanceId}`,
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
        setPlayers(data.players);
      }
    } catch (error) {
      console.error("Failed to fetch players", error);
    }
  };

  const fetchGame = async () => {
    if (!instanceId) return;
    try {
      const response = await fetch(
        `${constants.baseApiUrl}/instance-game/${instanceId}`,
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
        setInstance(data.instance);
        setIsBuzzerMode(data.instance.buzzers_mode);
        setGame(data.game.game);
        setRounds(data.game.rounds);
        setQuestions(data.game.questions);
        return;
      }
    } catch (error) {
      console.error("Failed to fetch game", error);
    }

    navigate("/");
  };

  return (
    <AdminPanelContext.Provider
      value={{
        players,
        gameController,
        instanceId,
        fetchPlayers,
        fetchQuestionInfo,
        setPlayers,
        setGameController,
        currentRound,
        setCurrentRound,
        currentQuestion,
        setCurrentQuestion,
        game,
        instance,
        rounds,
        questions,
        setGame,
        setInstance,
        setRounds,
        setQuestions,
        setGameInProgress,
        gameInProgress,
        isBuzzerMode,
        setIsBuzzerMode,
        tiebreakAnswers,
        setTiebreakAnswers,
        devtoolsSignals,
      }}
    >
      {children}
    </AdminPanelContext.Provider>
  );
};
