import React from "react";
import { IToastProps } from "../../interfaces/IToastProps";
import { HiCheckCircle, HiExclamationCircle, HiXCircle } from "react-icons/hi";

const colors = {
  success: "bg-green-100 text-green-800 border-green-300",
  error: "bg-red-100 text-red-800 border-red-300",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
  info: "bg-blue-100 text-blue-800 border-blue-300",
};

const icons = {
  success: <HiCheckCircle className="w-5 h-5 mr-2" />,
  error: <HiXCircle className="w-5 h-5 mr-2" />,
  warning: <HiExclamationCircle className="w-5 h-5 mr-2" />,
};

const Toast: React.FC<IToastProps> = ({ type, message, onClose }) => {
  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center px-4 py-3 rounded-md shadow-lg border ${colors[type]}`}
    >
      {icons[type]}
      <span className="text-sm">{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-3 text-xl font-bold">
          &times;
        </button>
      )}
    </div>
  );
};

export default Toast;
