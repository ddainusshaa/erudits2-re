import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// Create a context for the confirmation dialog
interface ConfirmationContextType {
  confirm: (message: string) => Promise<boolean>;
  setIsOpen: (isOpen: boolean) => void;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(
  undefined
);

export const ConfirmationProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [resolvePromise, setResolvePromise] =
    useState<(value: boolean) => void | null>();

  // Function to open the confirmation dialog
  const confirm = useCallback((message: string) => {
    setMessage(message);
    setIsOpen(true);

    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve);
    });
  }, []);

  // Functions to handle user response
  const handleConfirm = () => {
    setIsOpen(false);
    if (resolvePromise) resolvePromise(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolvePromise) resolvePromise(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        handleCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleCancel]);

  const ConfirmationDialog = () =>
    isOpen && (
      <div className="fixed inset-0 flex place-items-center justify-center z-40 bg-black/40 overflow-hidden backdrop-blur-sm px-4">
        <div className="min-w-96 rounded-md bg-slate-900 border border-slate-700 text-slate-100 shadow-md">
          <div className="flex place-items-center py-2 px-4 justify-between border-b border-slate-700">
            <div className="flex place-items-center gap-2">
              <i className="fa-solid fa-circle-exclamation text-xl text-blue-400"></i>
              <h2 className="font-bold">Uzmanību!</h2>
            </div>
            <button onClick={handleCancel} className="text-slate-300 hover:text-slate-100 transition-colors">
              <i className="fa-xmark fa-solid text-xl"></i>
            </button>
          </div>
          <div className="pb-4 pt-4 px-16 gap-8 flex flex-col place-items-center justify-center">
            <p className="font-semibold text-xl">{message}</p>
            <div className="flex gap-8">
              <button
                className="px-6 py-1 w-36 bg-slate-700 text-slate-100 font-bold hover:bg-slate-600 rounded-md shadow-sm transition-all text-lg"
                onClick={handleConfirm}
              >
                Jā
              </button>
              <button
                className="px-6 py-1 text-white text-lg font-bold hover:bg-red-600 w-36 shadow-sm transition-all bg-red-500 rounded-md"
                onClick={handleCancel}
              >
                Nē
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <ConfirmationContext.Provider value={{ confirm, setIsOpen }}>
      {children}
      <ConfirmationDialog />
    </ConfirmationContext.Provider>
  );
};

// Custom hook to access the confirmation function
export const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error(
      "useConfirmation must be used within a ConfirmationProvider"
    );
  }
  return context.confirm;
};
