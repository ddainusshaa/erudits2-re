import {
  ReactNode,
  useContext,
  useState,
  createContext,
  useEffect,
} from "react";
import { PlayerLocalStorage } from "../player/enum/PlayerLocalStorage";
import { constants } from "../../constants";
import { IPlayer } from "../admin/interface/IPlayer";
import echo from "../../useEcho";
import { IGameSessionStorage } from "../player/interface/IGameSessionStorage";
import { useNavigate } from "react-router-dom";
import { IQuestion } from "../admin/interface/IQuestion";
import { IRound } from "../admin/interface/IRound";

type PlayerContextType = {
  playerId: string;
  setPlayerId: (playerId: string) => void;
  isDisqualified: boolean;
  setIsDisqualified: (isDisqualified: boolean) => void;
  playerName: string;
  setPlayerName: (playerName: string) => void;
  isReady: boolean;
  setIsReady: (isReady: boolean) => void;
  questions: IQuestion[];
  round: IRound | undefined;
  answers: IAnswerDto[];
  selectedAnswers: Map<string, string> | undefined;
  setSelectedAnswers: (answers: Map<string, string>) => void;
  postAnswers: (questionId: string) => void;
  roundFinished: boolean;
  setRoundFinished: (roundFinished: boolean) => void;
  currentQuestion: IQuestion | undefined;
  setCurrentQuestion: (currentQuestion: IQuestion) => void;
  setChangedAnswer: (changedAnswer: boolean) => void;
  countdownTime: string | undefined;
  selectedQuestionIndex: number;
  setSelectedQuestionIndex: (selectedQuestionIndex: number) => void;
  isTiebreaking: boolean;
  setIsTiebreaking: (isTiebreaking: boolean) => void;
  isBuzzerMode: boolean;
  setBuzzerEnabled: (buzzerEnabled: boolean) => void;
  buzzerEnabled: boolean;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};

interface IAnswerDto {
  id: string;
  text?: string;
  question_id: string;
}

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [playerId, setPlayerId] = useState<string>("");
  const [isDisqualified, setIsDisqualified] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>("");
  const [isReady, setIsReady] = useState<boolean>(false);
  const [roundFinished, setRoundFinished] = useState<boolean>(false);
  const [instanceId, setInstanceId] = useState<string>("");
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [answers, setAnswers] = useState<IAnswerDto[]>([]);
  const [round, setRound] = useState<IRound>();
  const [changedAnswer, setChangedAnswer] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<IQuestion>();
  const [selectedAnswers, setSelectedAnswers] = useState<Map<string, string>>(
    new Map()
  );
  const [countdownTime, setCountdownTime] = useState<string>();
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [isTiebreaking, setIsTiebreaking] = useState<boolean>(false);
  const [isBuzzerMode, setIsBuzzerMode] = useState<boolean>(false);
  const [buzzerEnabled, setBuzzerEnabled] = useState(false);

  useEffect(() => {
    const player = JSON.parse(
      localStorage.getItem(PlayerLocalStorage.currentPlayer) ?? "{}"
    ) as IPlayer;
    if (player?.id && player.id.length === 36) {
      setPlayerId(player.id);
      fetchPlayer(player.id);
    }

    const storedData = localStorage.getItem(PlayerLocalStorage.answers);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      const mapData = new Map<string, string>(
        Object.entries(parsedData).map(([key, value]) => [key, value as string])
      );
      setSelectedAnswers(mapData);
    }
  }, []);

  const fetchPlayer = async (id: string) => {
    const response = await fetch(`${constants.baseApiUrl}/player/${id}`);
    if (response.ok) {
      const data = await response.json();

      setPlayerId(data.player.id);
      setPlayerName(data.player.player_name);
      setIsDisqualified(data.player.is_disqualified);
      setRoundFinished(data.player.round_finished);
      setIsBuzzerMode(data.instance.buzzers_mode);
      setBuzzerEnabled(data.player.buzzer_enabled);
      setIsReady(true);
      if (data.instance.game_started) {
        navigate("/play/game");
      }
    }
  };

  useEffect(() => {
    const gameSessionStorage = JSON.parse(
      localStorage.getItem(PlayerLocalStorage.currentGame) ?? "{}"
    ) as IGameSessionStorage;

    if (
      gameSessionStorage?.id &&
      (!gameSessionStorage?.end_date ||
        new Date(gameSessionStorage.end_date) > new Date())
    ) {
      setInstanceId(gameSessionStorage.id);
      return;
    }

    localStorage.removeItem(PlayerLocalStorage.currentGame);
    window.location.assign("/");
  }, []);

  useEffect(() => {
    if (instanceId) {
      fetchInfo();
    }
  }, [instanceId]);

  useEffect(() => {
    if (!round?.is_test && !isTiebreaking && !currentQuestion) {
      //fucky wucky
      fetchCurrentQuestion();
    }
    if (round?.is_test) {
      fetchRoundQuestions();
    }
  }, [round]);

  const navigate = useNavigate();

  const fetchInfo = async () => {
    if (!instanceId) return;
    const response = await fetch(
      `${constants.baseApiUrl}/round-info/${instanceId}`
    );
    if (response.ok) {
      const data = await response.json();
      setAnswers(data.answers);
      setRound(data.round);
      setCountdownTime(data.round?.started_at);
      setSelectedQuestionIndex(0);
    }
  };

  const fetchRoundQuestions = async () => {
    if (!instanceId) return;
    const response = await fetch(
      `${constants.baseApiUrl}/round-questions/${instanceId}`
    );
    if (response.ok) {
      const data = await response.json();
      setQuestions(data.questions);
    }
  };

  const fetchCurrentQuestion = async () => {
    if (!instanceId) return;
    const response = await fetch(
      `${constants.baseApiUrl}/current-question/${instanceId}`
    );
    if (response.ok) {
      const data = await response.json();
      setCurrentQuestion(data.question);
      //fuck. this.
      setCountdownTime(
        new Date(
          new Date(data.started_at).getTime() -
            new Date().getTimezoneOffset() * 60000
        ).toISOString()
      );
    }
  };

  useEffect(() => {
    if (instanceId && playerId) {
      const gameChannel = echo.channel(`game.${instanceId}`);
      const playerChannel = echo.channel(`player.${playerId}`);

      gameChannel.listen(".game-control-event", (data: any) => {
        switch (data.command) {
          case "end":
            navigate("/play/end");
            break;
          case "start":
            if (isReady || playerId.length) {
              fetchInfo();
              navigate("/play/game");
            }
            if (!isReady && !playerId.length) navigate("/play/end");
            break;
          case "next-round":
          case "previous-round":
            setRoundFinished(false);
            fetchInfo();
            setRound(data.currentRound);
            break;
          case "previous-question":
          case "next-question":
            setRoundFinished(false);
            setRound(data.currentRound);
            setCurrentQuestion(data.currentQuestion);
            setAnswers(data.currentQuestion.answers);
            setCountdownTime(new Date(Date.now()).toISOString());
            break;
          case "buzzers-start":
            setIsBuzzerMode(true);
            break;
          case "buzzers-stop":
            setIsBuzzerMode(false);
            break;
          case "buzzers-enabled":
            setBuzzerEnabled(true);
            break;
        }
      });
      playerChannel.listen(".player-event", (data: any) => {
        switch (data.command) {
          case "disqualified":
            setIsDisqualified(true);
            break;
          case "requalified":
            setIsDisqualified(false);
            break;
          case "buzzer-enabled":
            setBuzzerEnabled(true);
            break;
          case "buzzer-disabled":
            setBuzzerEnabled(false);
            break;
        }
      });
      playerChannel.listen(".tiebreak-event", (data: any) => {
        switch (data.command) {
          case "tiebreak":
            setIsTiebreaking(true);
            setCountdownTime(new Date().toISOString());
            setRound(data.round);
            setRoundFinished(false);
            setCurrentQuestion(data.question);
            setAnswers(data.answers);
            break;
        }
      });
    }
    return () => {
      echo.leaveChannel(`game.${instanceId}`);
      echo.leaveChannel(`player.${playerId}`);
    };
  }, [instanceId, playerId]);

  useEffect(() => {
    if (changedAnswer) {
      setIsTiebreaking(false);
      postAnswers();
      setChangedAnswer(false);
    }
  }, [selectedQuestionIndex, roundFinished]);

  const getCurrentQuestionId = () => {
    if (isTiebreaking) {
      return currentQuestion?.id;
    }
    if (!round?.is_test) {
      return currentQuestion!.id;
    }
    return questions[selectedQuestionIndex - 1].id;
  };

  const postAnswers = async () => {
    const currentQuestionId = getCurrentQuestionId();

    if (!currentQuestionId) return;
    const answer = selectedAnswers.get(currentQuestionId);

    await fetch(`${constants.baseApiUrl}/player-answers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player_id: playerId,
        question_id: currentQuestionId,
        answer: answer,
        round_id: round?.id,
        is_tiebreak_answer: isTiebreaking,
      }),
    });

    if (isTiebreaking) {
      fetchInfo();
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        playerId,
        setPlayerId,
        isDisqualified,
        setIsDisqualified,
        playerName,
        setPlayerName,
        isReady,
        setIsReady,
        questions,
        round,
        answers,
        selectedAnswers,
        setSelectedAnswers,
        postAnswers,
        roundFinished,
        setRoundFinished,
        currentQuestion,
        setCurrentQuestion,
        setChangedAnswer,
        countdownTime,
        selectedQuestionIndex,
        setSelectedQuestionIndex,
        isTiebreaking,
        setIsTiebreaking,
        isBuzzerMode,
        setBuzzerEnabled,
        buzzerEnabled,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
