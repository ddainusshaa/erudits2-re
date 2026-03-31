import {
  ReactNode,
  useContext,
  useState,
  createContext,
  useEffect,
  useRef,
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
  isRealtimeConnected: boolean;
  reconnectRealtime: () => void;
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
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(true);
  const devtoolsStateRef = useRef({ isOpen: false, lastSentAt: 0 });

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
      setGameStarted(!!data.instance.game_started);
      if (data.instance.game_started) {
        navigate("/play/game");
      }
      return;
    }

    // Player no longer exists in this instance (e.g. removed by admin).
    if (response.status === 404) {
      localStorage.removeItem(PlayerLocalStorage.currentPlayer);
      setPlayerId("");
      setIsReady(false);
      setGameStarted(false);
      navigate("/play/end");
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
    if (!playerId || !instanceId || !isReady || gameStarted) return;

    const interval = setInterval(() => {
      fetchPlayer(playerId);
    }, 3000);

    return () => clearInterval(interval);
  }, [playerId, instanceId, isReady, gameStarted]);

  useEffect(() => {
    if (!playerId || !instanceId || !isReady) return;

    const interval = setInterval(() => {
      fetch(`${constants.baseApiUrl}/player-ping`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player_id: playerId,
        }),
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [playerId, instanceId, isReady]);

  useEffect(() => {
    if (!playerId || typeof window === "undefined") return;

    const threshold = 160;
    const resendInterval = 15000;

    const sendStatus = (isOpen: boolean) => {
      fetch(`${constants.baseApiUrl}/player-devtools`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player_id: playerId,
          is_open: isOpen,
        }),
      }).catch(() => undefined);
    };

    const check = () => {
      if (window.innerWidth < 900 || window.innerHeight < 600) {
        if (devtoolsStateRef.current.isOpen) {
          devtoolsStateRef.current.isOpen = false;
          devtoolsStateRef.current.lastSentAt = Date.now();
          sendStatus(false);
        }
        return;
      }

      const widthDiff = Math.abs(window.outerWidth - window.innerWidth);
      const heightDiff = Math.abs(window.outerHeight - window.innerHeight);
      const isOpen = widthDiff > threshold || heightDiff > threshold;

      const now = Date.now();
      const shouldResend =
        isOpen && now - devtoolsStateRef.current.lastSentAt > resendInterval;

      if (isOpen !== devtoolsStateRef.current.isOpen || shouldResend) {
        devtoolsStateRef.current.isOpen = isOpen;
        devtoolsStateRef.current.lastSentAt = now;
        sendStatus(isOpen);
      }
    };

    check();
    const interval = setInterval(check, 2000);
    window.addEventListener("resize", check);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", check);
    };
  }, [playerId]);

  useEffect(() => {
    if (!instanceId || !gameStarted || round || isBuzzerMode) return;

    const interval = setInterval(() => {
      fetchInfo();
    }, 3000);

    return () => clearInterval(interval);
  }, [instanceId, gameStarted, round, isBuzzerMode]);

  useEffect(() => {
    const pusher = (echo as any)?.connector?.pusher;
    if (!pusher?.connection) return;

    const connection = pusher.connection;
    const handleConnected = () => setIsRealtimeConnected(true);
    const handleDisconnected = () => setIsRealtimeConnected(false);

    setIsRealtimeConnected(connection.state === "connected");
    connection.bind("connected", handleConnected);
    connection.bind("disconnected", handleDisconnected);
    connection.bind("unavailable", handleDisconnected);
    connection.bind("failed", handleDisconnected);

    return () => {
      connection.unbind("connected", handleConnected);
      connection.unbind("disconnected", handleDisconnected);
      connection.unbind("unavailable", handleDisconnected);
      connection.unbind("failed", handleDisconnected);
    };
  }, []);

  const reconnectRealtime = () => {
    const pusher = (echo as any)?.connector?.pusher;
    if (pusher) {
      pusher.connect();
    }
  };

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
            setGameStarted(false);
            navigate("/play/end");
            break;
          case "start":
            if (isReady || playerId.length) {
              fetchInfo();
              setGameStarted(true);
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
          case "ended":
            localStorage.removeItem(PlayerLocalStorage.currentPlayer);
            setPlayerId("");
            setIsReady(false);
            setGameStarted(false);
            navigate("/play/end");
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
        isRealtimeConnected,
        reconnectRealtime,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
