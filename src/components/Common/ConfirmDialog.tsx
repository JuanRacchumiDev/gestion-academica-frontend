import React from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isProcessing?: boolean; // Para deshabilitar botones durante la carga
  icon?: React.ReactNode;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isProcessing = false,
  icon,
}) => {
  if (!isOpen) return null;

  const modalContent = (
    // Overlay (Fondo oscuro)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black opacity-90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Contenedor del Modal */}
      <div
        className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 m-4 transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()} // Previene cerrar al hacer clic dentro
      >
        {/* Encabezado */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            {icon && <span className="mr-3 text-current">{icon}</span>}
            {title}
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Mensaje */}
        <div className="mb-6 text-gray-600">
          <p>{message}</p>
        </div>

        {/* Acciones (Botones) */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 hover:cursor-pointer transition-colors disabled:opacity-50"
            disabled={isProcessing}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors shadow-md 
                ${
                  isProcessing
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:cursor-pointer"
                }
            `}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Procesando...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
