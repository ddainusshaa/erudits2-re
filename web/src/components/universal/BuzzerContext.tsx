import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import echo from "../../useEcho";
import { ITitleId } from "../admin/interface/ITitleId";
import { useAdminPanel } from "./AdminPanelContext";

type BuzzerContextType = {
  buzzedPlayer: ITitleId;
  setBuzzerEnabled: (buzzerEnabled: boolean) => void;
  buzzerEnabled: boolean;
};

const BuzzerContext = createContext<BuzzerContextType | undefined>(undefined);

export const useBuzzer = () => {
  const context = useContext(BuzzerContext);
  if (!context) {
    throw new Error(
      "BuzzerContext must be used within a AdminGameSidebarProvider"
    );
  }
  return context;
};

export const BuzzerProvider = ({ children }: { children: ReactNode }) => {
  const [buzzedPlayer, setBuzzedPlayer] = useState<ITitleId>({} as ITitleId);
  const [buzzerEnabled, setBuzzerEnabled] = useState(false);

  const { instanceId } = useParams();

  const { setPlayers } = useAdminPanel();

  useEffect(() => {
    const gameChannel = echo.channel(`buzzer.${instanceId}`);

    gameChannel.listen(".buzzer-event", (data: any) => {
      setBuzzedPlayer({
        id: data.playerId,
        title: data.playerName,
      });
      setTimeout(() => {
        setBuzzedPlayer({} as ITitleId);
      }, 5000);
      //@ts-ignore
      setPlayers((prevPlayers) =>
        prevPlayers.map((player: { id: string; buzzer_enabled: any }) =>
          player.id === data.playerId
            ? { ...player, buzzer_enabled: !player.buzzer_enabled }
            : player
        )
      );
    });

    return () => {
      gameChannel.stopListening(".buzzer-event");
    };
  }, [instanceId]);

  return (
    <BuzzerContext.Provider
      value={{ buzzedPlayer, setBuzzerEnabled, buzzerEnabled }}
    >
      {children}
    </BuzzerContext.Provider>
  );
};
