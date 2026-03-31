import { useNavigate } from "react-router-dom";
import { useBreadCrumbs } from "./BreadCrumbContext";
import { formatText } from "./functions";

export const BreadCrumbs = () => {
  const navigate = useNavigate();
  const { breadCrumbs } = useBreadCrumbs();
  return (
    <div className="flex w-full p-1 rounded-md font-[Manrope] place-items-center text-slate-100">
      {breadCrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex place-items-center">
          <button
            onClick={() =>
              crumb.path.length > 0 ? navigate(crumb.path) : null
            }
            className="text-lg hover:underline text-slate-100"
          >
            {formatText(crumb.name, 20)}
          </button>
          {index < breadCrumbs.length - 1 && <i className="fa-solid fa-chevron-right mx-3 text-slate-400"></i>}
        </div>
      ))}
    </div>
  );
};
