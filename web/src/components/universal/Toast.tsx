import { createContext, ReactNode, useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";

type Toast = { success: boolean; text: string; id: string };
type ToastContextType = (success: boolean, text: string) => void;

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("toast must be used within a toastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast: ToastContextType = (success, text) => {
    const id = uuidv4(); // unique ID for each toast
    setToasts((prevToasts) => [...prevToasts, { success, text, id }]);

    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed z-50 top-10 right-0 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="toast-slide bg-white border-x border-t flex flex-col min-w-[300px] max-w-[300px] border-gray-400 shadow-md h-[70px] hover:cursor-pointer"
          >
            <div
              onClick={() => removeToast(toast.id)}
              className="gap-4 flex place-items-center px-6 h-[62px]"
            >
              {toast.success ? (
                <div className="rounded-full text-green-600 min-w-8 h-8 text-center border-green-600 border-2">
                  <i className="fa-solid fa-check text-lg"></i>
                </div>
              ) : (
                <div className="rounded-full text-red-600 min-w-8 h-8 text-center border-red-600 border-2">
                  <i className="fa-solid fa-xmark text-lg"></i>
                </div>
              )}
              <div className="flex grow place-items-center justify-center">
                <p
                  className={`font-[Manrope] font-semibold ${
                    toast.success ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {toast.text}
                </p>
              </div>
            </div>
            <div
              className={`${
                toast.success ? "bg-green-600" : "bg-red-600"
              } timer-left h-2 bottom-0`}
            ></div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
