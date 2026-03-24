import React from "react";
import ReactDOM from "react-dom/client";
import { LandingPage } from "./components/player/pages/LandingPage.tsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AdminLogin from "./components/admin/pages/Login.tsx";
import AdminRegister from "./components/admin/pages/Register.tsx";
import { AdminGames } from "./components/admin/pages/Games.tsx";
import { AdminGameCreator } from "./components/admin/pages/creator/Game.tsx";
import { GameCreatorQuestionRound } from "./components/admin/pages/creator/Round.tsx";
import { GameCreatorQuestion } from "./components/admin/pages/creator/Question.tsx";
import { ToastProvider } from "./components/universal/Toast.tsx";
import { CreatorLayout } from "./components/admin/pages/layouts/CreatorLayout.tsx";
import { BreadCrumbProvider } from "./components/universal/BreadCrumbContext.tsx";
import { AdminGameEditor } from "./components/admin/pages/editor/Game.tsx";
import { GameEditorQuestionRound } from "./components/admin/pages/editor/Round.tsx";
import { GameEditorQuestion } from "./components/admin/pages/editor/Question.tsx";
import { ConfirmationProvider } from "./components/universal/ConfirmationWindowContext.tsx";
import { Lobby } from "./components/player/pages/Lobby.tsx";
import { Game } from "./components/player/pages/Game.tsx";
import { Panel } from "./components/admin/pages/panel/Panel.tsx";
import { PlayerLayout } from "./components/player/pages/layouts/PlayerLayout.tsx";
import { PanelLayout } from "./components/admin/pages/layouts/PanelLayout.tsx";
import { GameEnd } from "./components/player/pages/GameEnd.tsx";
import { Disqualified } from "./components/player/pages/Disqualified.tsx";
import { Buzzer } from "./components/admin/ui/panel/Buzzer.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "admin/login",
    element: <AdminLogin />,
  },
  {
    path: "admin/register",
    element: <AdminRegister />,
  },
  {
    path: "admin/games",
    element: <AdminGames />,
  },

  {
    path: "admin/games/creator",
    element: <CreatorLayout />,
    children: [
      {
        path: "game/:gameId",
        element: <AdminGameCreator />,
      },
      {
        path: "round/:roundId",
        element: <GameCreatorQuestionRound />,
      },
      {
        path: "question/:questionId",
        element: <GameCreatorQuestion />,
      },
    ],
  },
  {
    path: "admin/games/editor",
    element: <CreatorLayout />,
    children: [
      {
        path: "game/:gameId",
        element: <AdminGameEditor />,
      },
      {
        path: "round/:roundId",
        element: <GameEditorQuestionRound />,
      },
      {
        path: "question/:questionId",
        element: <GameEditorQuestion />,
      },
    ],
  },
  {
    path: "play",
    element: <PlayerLayout />,
    children: [
      {
        path: "lobby",
        element: <Lobby />,
      },
      {
        path: "game",
        element: <Game />,
      },
      {
        path: "end",
        element: <GameEnd />,
      },
      {
        path: "disqualified",
        element: <Disqualified />,
      },
    ],
  },
  {
    path: "admin/panel",
    element: <PanelLayout />,
    children: [
      {
        path: ":instanceId",
        element: <Panel />,
      },
      {
        path: "buzzer/:instanceId",
        element: <Buzzer />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <ConfirmationProvider>
        <BreadCrumbProvider>
          <RouterProvider router={router} />
        </BreadCrumbProvider>
      </ConfirmationProvider>
    </ToastProvider>
  </React.StrictMode>
);
