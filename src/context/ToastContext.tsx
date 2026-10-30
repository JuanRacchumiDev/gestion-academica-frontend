import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  ReactNode,
} from "react";
import { IToastProps } from "../interfaces/IToastProps";
import Toast from "../components/Common/Toast";

interface ToastContextType {
  showToast: (type: IToastProps["type"], message: string) => void;
}

interface ToastProviderProps {
  children: ReactNode;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<IToastProps | null>(null);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const showToast = useCallback(
    (type: IToastProps["type"], message: string) => {
      // Limpiar cualquier temporizador existente
      if (timer) {
        clearTimeout(timer);
      }

      setToast({ type, message });

      // Ocultar el toast después de 5 segundos
      const newTimer = setTimeout(() => {
        setToast(null);
        setTimer(null);
      }, 5000);
      setTimer(newTimer);
    },
    [timer]
  );

  const handleClose = useCallback(() => {
    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }
    setToast(null);
  }, [timer]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={handleClose}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
