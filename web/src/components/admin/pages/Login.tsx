import { useEffect, useState } from "react";
import { constants } from "../../../constants";
import { getCurrentUser } from "../../universal/functions";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../universal/Toast";
import { localizeError, localizeSuccess } from "../../../localization";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const showToast = useToast();

  const onFormSubmit = async (e: { preventDefault: () => void }) => {
    setIsLoading(true);
    e.preventDefault();
    await fetch(`${constants.baseApiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    }).then(async (response) => {
      const data = await response.json();
      if (response.ok) {
        showToast!(true, localizeSuccess(data.message));

        localStorage.setItem(constants.localStorage.TOKEN, data.token);
        navigate("/admin/games");
      } else {
        Object.keys(data).map((key) =>
          showToast!(false, localizeError(data[key]))
        );
      }
    });
    setIsLoading(false);
  };

  const redirectIfLoggedIn = async () => {
    if (await getCurrentUser()) {
      navigate("/admin/games");
    }
  };

  useEffect(() => {
    redirectIfLoggedIn();
  }, []);

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center p-4 bg-slate-950">
      <div className="app-theme-content w-full max-w-md bg-slate-900 rounded shadow-sm border border-slate-700 overflow-hidden flex flex-col text-slate-100">
        <div className="px-6 py-8 sm:p-10 flex-1">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded bg-blue-700 flex items-center justify-center text-white shadow-md border border-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-100">Sistēmas piekļuve</h1>
            <p className="text-slate-400 mt-2 text-sm">Ievadiet savus datus, lai pieslēgtos vadības panelim.</p>
          </div>

          <form onSubmit={onFormSubmit} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-slate-300">E-pasts</label>
              <input
                id="email"
                type="email"
                className="w-full px-4 py-3 rounded border border-slate-700 bg-slate-800 text-slate-100 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="lietotajs@epasts.lv"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-slate-300">Parole</label>
              <input
                id="password"
                type="password"
                className="w-full px-4 py-3 rounded border border-slate-700 bg-slate-800 text-slate-100 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-blue-700 text-white font-semibold py-3 rounded hover:bg-blue-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Pieslēgties"
              )}
            </button>
          </form>
        </div>

        <div className="bg-slate-800 p-4 border-t border-slate-700 text-center">
          <p className="text-sm text-slate-300">
            Nav profila?{" "}
            <button
              onClick={() => navigate("/admin/register")}
              className="font-semibold text-blue-400 hover:text-blue-300 focus:outline-none focus:underline"
            >
              Reģistrēties šeit
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
