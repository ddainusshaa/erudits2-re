import { useEffect, useState } from "react";
import { constants } from "../../../constants";
import { getCurrentUser } from "../../universal/functions";
import { useNavigate } from "react-router-dom";
import { localizeError, localizeSuccess } from "../../../localization";
import { useToast } from "../../universal/Toast";

const AdminRegister = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const showToast = useToast();

  const onFormSubmit = async (e: { preventDefault: () => void }) => {
    setIsLoading(true);
    e.preventDefault();
    await fetch(`${constants.baseApiUrl}/auth/register`, {
      body: JSON.stringify({
        email: email,
        password: password,
        password_confirmation: passwordConfirmation,
      }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(async (response) => {
      const data = await response.json();
      if (response.ok) {
        Object.keys(data).map((key) =>
          showToast!(true, localizeSuccess(data[key]))
        );
        navigate("/admin/login");
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
      <div className="app-theme-content w-full max-w-md bg-white rounded shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="px-6 py-8 sm:p-10 flex-1">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded bg-[#0F9A09] flex items-center justify-center text-white shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Reģistrācija</h1>
            <p className="text-slate-500 mt-2 text-sm">Izveidojiet jaunu kontu, lai piekļūtu sistēmai.</p>
          </div>

          <form onSubmit={onFormSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-slate-700">E-pasts</label>
              <input
                id="email"
                type="email"
                className="w-full px-4 py-3 rounded border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E812FF] focus:border-transparent transition-colors"
                placeholder="janis.berzins@erudits.lv"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700">Parole</label>
              <input
                id="password"
                type="password"
                className="w-full px-4 py-3 rounded border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E812FF] focus:border-transparent transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="passwordConfirmation" className="text-sm font-semibold text-slate-700">Paroles apstiprinājums</label>
              <input
                id="passwordConfirmation"
                type="password"
                className="w-full px-4 py-3 rounded border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E812FF] focus:border-transparent transition-colors"
                placeholder="••••••••"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-[#0F9A09] text-white font-semibold py-3 rounded hover:brightness-95 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Reģistrēties"
              )}
            </button>
          </form>
        </div>

        <div className="bg-slate-50 p-4 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-600">
            Jau ir profils?{" "}
            <button
              onClick={() => navigate("/admin/login")}
              className="font-semibold text-[#E812FF] hover:brightness-90 focus:outline-none focus:underline"
            >
              Pieslēgties šeit
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
