import { useNavigate } from "react-router-dom";
import { constants } from "../../../constants";
import { AdminSessionStorage } from "../enum/AdminSessionStorage";
import { AdminGameTable } from "../ui/table/AdminGameTable";
import { useEffect, useState } from "react";
import { IGame } from "../interface/IGame";
import { SpinnerCircularFixed } from "spinners-react";
import { ActivationModal } from "../ui/ActivationModal";

export const AdminGames = () => {
  const [games, setGames] = useState<IGame[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<IGame | null>(null);
  const [authorized, setAuthorized] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    clearSessionStorage();
    fetchGames();
  }, []);

  const clearSessionStorage = () => {
    sessionStorage.removeItem(AdminSessionStorage.gameCreator);
    sessionStorage.removeItem(AdminSessionStorage.roundCreator);
    sessionStorage.removeItem(AdminSessionStorage.questionCreator);
    sessionStorage.removeItem(AdminSessionStorage.sidebarGame);
    sessionStorage.removeItem(AdminSessionStorage.sidebarQuestions);
    sessionStorage.removeItem(AdminSessionStorage.sidebarRounds);
    sessionStorage.removeItem(AdminSessionStorage.breadCrumbs);
    sessionStorage.removeItem(AdminSessionStorage.gameId);
  };

  const logout = async () => {
    setIsLoading(true);
    const response = await fetch(`${constants.baseApiUrl}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem(
          constants.localStorage.TOKEN
        )}`,
      },
    });

    if (response.ok) {
      localStorage.removeItem(constants.localStorage.TOKEN);
      navigate("/");
    }
    setIsLoading(false);
  };

  const createGame = async () => {
    clearSessionStorage();
    setIsLoading(true);
    try {
      const response = await fetch(`${constants.baseApiUrl}/create-game`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            constants.localStorage.TOKEN
          )}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem(
          AdminSessionStorage.gameCreator,
          JSON.stringify({
            id: data.game.id,
            title: data.game.title,
            description: data.game.description,
            user_id: data.game.user_id,
          })
        );
        navigate(`creator/game/${data.game.id}`);
      } else {
        console.error("Failed to create game:", response.statusText);
      }
    } catch (error) {
      console.error("Error during game creation:", error);
    }
    setIsLoading(false);
  };

  const fetchGames = async () => {
    const response = await fetch(`${constants.baseApiUrl}/games`, {
      method: "get",
      headers: {
        Authorization: `Bearer ${localStorage.getItem(
          constants.localStorage.TOKEN
        )}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setAuthorized(true);
      setGames(data.games);
      return;
    }

    navigate("/admin/login");
  };

  if (!authorized) {
    return (
      <div className="app-theme-bg flex flex-col min-h-[100dvh] overflow-x-hidden items-center justify-center">
        <SpinnerCircularFixed color="#0F9A09" size="48" thickness={150} />
      </div>
    );
  }

  const onModalClose = async (success?: boolean) => {
    setIsActivationModalOpen(false);
    if (success) {
      await fetchGames();
    }
  };

  const onActivationModalOpen = (game: IGame) => {
    setSelectedGame(game);
    setIsActivationModalOpen(true);
  };

  return (
    <>
      <div className="app-theme-bg flex flex-col min-h-[100dvh] w-full font-sans">
        <div className="app-theme-content w-full max-w-7xl mx-auto p-6 sm:p-10 flex flex-col gap-8 flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded border border-slate-200 shadow-sm">
            <div>
              <h1 className="font-bold text-2xl sm:text-3xl text-slate-800">
                Lietotāja Spēles
              </h1>
              <p className="text-slate-500 mt-1 text-sm">Pārvaldiet un veidojiet jaunas erudīcijas spēles.</p>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                disabled={isLoading}
                className={`flex-1 sm:flex-none ${
                  isLoading ? "bg-slate-100 text-slate-400" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm"
                } px-5 rounded py-2.5 flex items-center justify-center gap-2 transition-all font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#E812FF]/30`}
                onClick={logout}
              >
                Izrakstīties
                {!isLoading && <i className="fa-solid fa-right-from-bracket ml-1"></i>}
                {isLoading && (
                  <SpinnerCircularFixed
                    color="#94a3b8"
                    size={20}
                    thickness={150}
                  />
                )}
              </button>
              
              <button
                onClick={createGame}
                disabled={isLoading}
                className={`flex-1 sm:flex-none ${
                  isLoading
                    ? "bg-[#91FF00]/60 cursor-not-allowed"
                    : "bg-[#0F9A09] hover:brightness-95 shadow-sm text-white"
                } px-5 rounded py-2.5 flex items-center justify-center gap-2 transition-all font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#0F9A09]/40`}
              >
                Jauna spēle
                {!isLoading && <i className="fa-solid fa-plus ml-1"></i>}
                {isLoading && (
                  <SpinnerCircularFixed
                    color="#ffffff"
                    size={20}
                    thickness={150}
                  />
                )}
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-white rounded border border-slate-200 shadow-sm overflow-hidden p-6 flex flex-col">
            <AdminGameTable
              games={games}
              onActivationModalOpen={onActivationModalOpen}
            />
          </div>
        </div>
      </div>
      {isActivationModalOpen && selectedGame && (
        <ActivationModal game={selectedGame} onClose={onModalClose} />
      )}
    </>
  );
};
