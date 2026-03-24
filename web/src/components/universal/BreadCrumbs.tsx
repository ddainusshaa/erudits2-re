import { useNavigate } from "react-router-dom";
import { useBreadCrumbs } from "./BreadCrumbContext";
import { formatText } from "./functions";

export const BreadCrumbs = () => {
  const navigate = useNavigate();
  const { breadCrumbs } = useBreadCrumbs();
  return (
    <div className="flex w-full p-4 rounded-md font-[Manrope] bg-white place-items-center">
      {breadCrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex place-items-center">
          <button
            onClick={() =>
              crumb.path.length > 0 ? navigate(crumb.path) : null
            }
            className="text-lg hover:underline"
          >
            {formatText(crumb.name, 20)}
          </button>
          {index < breadCrumbs.length - 1 && (
            <i className="fa-solid fa-chevron-right mx-3"></i>
          )}
        </div>
      ))}
    </div>
  );
};
