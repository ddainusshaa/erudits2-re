import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router-dom";

export const AppRouteError = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = "Kaut kas nogāja greizi";
  let message = "Neizdevās ielādēt lapu. Pamēģiniet atjaunot vai atgriezties sākumā.";

  if (isRouteErrorResponse(error)) {
    title = `Kļūda ${error.status}`;
    message = typeof error.data === "string" ? error.data : error.statusText;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="app-theme-bg min-h-[100dvh] w-full flex items-center justify-center p-4">
      <div className="app-theme-content w-full max-w-xl bg-slate-900/95 border border-slate-700 rounded-xl p-6 text-slate-100 shadow-md">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-slate-300 mb-6 break-words">{message}</p>
        <div className="flex flex-wrap gap-3">
          <button
            className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 font-semibold"
            onClick={() => window.location.reload()}
          >
            Pārlādēt
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-700 hover:bg-blue-600 font-semibold"
            onClick={() => navigate("/")}
          >
            Uz sākumu
          </button>
        </div>
      </div>
    </div>
  );
};
