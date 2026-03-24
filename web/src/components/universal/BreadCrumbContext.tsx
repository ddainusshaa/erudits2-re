import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { AdminSessionStorage } from "../admin/enum/AdminSessionStorage";

type BreadCrumb = { path: string; name: string };
type BreadCrumbContextType = {
  breadCrumbs: BreadCrumb[];
  setBreadCrumbs: (path: string, name: string) => void;
  clearBreadCrumbs: () => void;
  removeLastBreadCrumb: () => void;
};

// Create a context with an undefined default value
const BreadCrumbContext = createContext<BreadCrumbContextType | undefined>(
  undefined
);

// Hook to use breadcrumbs in other components
export const useBreadCrumbs = () => {
  const context = useContext(BreadCrumbContext);
  if (!context) {
    throw new Error("useBreadCrumbs must be used within a BreadCrumbProvider");
  }
  return context;
};

// Provider to manage breadcrumbs
export const BreadCrumbProvider = ({ children }: { children: ReactNode }) => {
  const [breadCrumbs, setBreadCrumbsState] = useState<BreadCrumb[]>([]);

  const setBreadCrumbs = (path: string, name: string) => {
    setBreadCrumbsState((prev) => [...prev, { path, name }]);
  };

  const clearBreadCrumbs = () => {
    setBreadCrumbsState([]);
  };

  const removeLastBreadCrumb = () => {
    setBreadCrumbsState((prev) => prev.slice(0, prev.length - 1));
  };

  useEffect(() => {
    if (breadCrumbs.length !== 0) {
      sessionStorage.setItem(
        AdminSessionStorage.breadCrumbs,
        JSON.stringify(breadCrumbs)
      );
    }
  }, [breadCrumbs]);

  useEffect(() => {
    const breadCrumbs = JSON.parse(
      sessionStorage.getItem(AdminSessionStorage.breadCrumbs) || "[]"
    ) as BreadCrumb[];

    if (breadCrumbs.length > 0) {
      setBreadCrumbsState(breadCrumbs);
    }
  }, []);

  return (
    <BreadCrumbContext.Provider
      value={{
        breadCrumbs,
        setBreadCrumbs,
        clearBreadCrumbs,
        removeLastBreadCrumb,
      }}
    >
      {children}
    </BreadCrumbContext.Provider>
  );
};
