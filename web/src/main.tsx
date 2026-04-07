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
import { TimerDisplay } from "./components/admin/pages/panel/TimerDisplay.tsx";
import { PlayerLayout } from "./components/player/pages/layouts/PlayerLayout.tsx";
import { PanelLayout } from "./components/admin/pages/layouts/PanelLayout.tsx";
import { GameEnd } from "./components/player/pages/GameEnd.tsx";
import { Disqualified } from "./components/player/pages/Disqualified.tsx";
import { Buzzer } from "./components/admin/ui/panel/Buzzer.tsx";
import { AppRouteError } from "./components/universal/AppRouteError.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <AppRouteError />,
  },
  {
    path: "admin/login",
    element: <AdminLogin />,
    errorElement: <AppRouteError />,
  },
  {
    path: "admin/register",
    element: <AdminRegister />,
    errorElement: <AppRouteError />,
  },
  {
    path: "admin/games",
    element: <AdminGames />,
    errorElement: <AppRouteError />,
  },

  {
    path: "admin/games/creator",
    element: <CreatorLayout />,
    errorElement: <AppRouteError />,
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
    errorElement: <AppRouteError />,
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
    errorElement: <AppRouteError />,
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
    errorElement: <AppRouteError />,
    children: [
      {
        path: ":instanceId",
        element: <Panel />,
      },
      {
        path: ":instanceId/timer",
        element: <TimerDisplay />,
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
