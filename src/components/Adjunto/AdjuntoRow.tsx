import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Adjunto } from "../../interfaces/IAdjunto";
import { TableCell, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ConfirmDialog } from "@/components/Common/ConfirmDialog";
import { useToast } from "../../context/ToastContext";
import {
  AlertTriangle,
  CircleCheck,
  CircleX,
  Edit,
  MoreHorizontal,
  ToggleLeft,
  ToggleRight,
  Download,
  Eye,
  EyeOff,
  FileText,
} from "lucide-react";

interface Props {
  adjunto: Adjunto;
  onStatusChange?: (adjuntoId: number) => void;
}

export const AdjuntoRow: React.FC<Props> = ({ adjunto }) => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const nuevoEstado = !adjunto.estado;
  const action = nuevoEstado ? "activar" : "desactivar";
  const modalTitle = `${action.charAt(0).toUpperCase() + action.slice(1)} Adjunto`;
  const modalMessage = `¿Deseas <strong>${action}</strong> el archivo adjunto: <strong>${adjunto.titulo}</strong>?`;

  const handleShowDetail = () => {
    navigate(`/adjunto/editar/${adjunto.id}`);
  };

  const handleDownloadFile = () => {
    // Implementación simulada de descarga usando la ruta guardada en bd
    if (adjunto.is_descargable) {
      window.open(`/storage/${adjunto.filepath}`, "_blank");
    } else {
      showToast("error", "Este archivo tiene las descargas restringidas.");
    }
  };

  const handleConfirmStatus = async () => {
    setIsProcessing(true);
    try {
      // Simulación de fetch al backend Laravel: /api/adjuntos/{id}/status
      showToast("success", `Archivo ${action}ado correctamente.`);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al actualizar el estado del adjunto:", error);
      showToast("error", "Error de conexión al intentar actualizar.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Conversor legible para bytes
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const ActionIcon = adjunto.estado ? ToggleLeft : ToggleRight;

  return (
    <>
      <TableRow className="hover:bg-blue-50 hover:cursor-pointer transition-colors duration-200">
        {/* Título y Descripción */}
        <TableCell className="py-3 px-4">
          <div className="flex flex-col">
            <span className="font-medium text-slate-900">{adjunto.titulo}</span>
            {adjunto.descripcion && (
              <span className="text-xs text-slate-400 line-clamp-1">
                {adjunto.descripcion}
              </span>
            )}
          </div>
        </TableCell>

        {/* Nombre Original del archivo físico */}
        <TableCell className="py-3 px-4 text-slate-600 text-xs font-mono break-all">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {adjunto.originalname}
          </div>
        </TableCell>

        {/* Peso en formato legible */}
        <TableCell className="py-3 px-4 text-slate-600 text-xs">
          {formatBytes(adjunto.size)}
        </TableCell>

        {/* Visibilidad y Propiedades */}
        <TableCell className="py-3 px-4 text-center">
          <div className="flex items-center justify-center gap-2">
            {adjunto.is_visible ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Eye className="w-3 h-3" /> Visible
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                <EyeOff className="w-3 h-3" /> Oculto
              </span>
            )}
            {adjunto.is_descargable && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                DL
              </span>
            )}
          </div>
        </TableCell>

        {/* Estado Operativo */}
        <TableCell className="py-3 text-center">
          <div className="flex justify-center">
            {adjunto.estado ? (
              <CircleCheck className="text-green-500 w-5 h-5" />
            ) : (
              <CircleX className="text-red-500 w-5 h-5" />
            )}
          </div>
        </TableCell>

        {/* Menú Dropdown de Acciones */}
        <TableCell className="py-3 px-4 text-right">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger
              asChild
              className="focus:outline-none focus:ring-2 focus:ring-gray-400 transition cursor-pointer"
            >
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="bg-white border shadow-lg w-48"
            >
              <DropdownMenuLabel className="font-semibold text-gray-700">
                Acciones
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleShowDetail}
                className="cursor-pointer hover:bg-gray-100 flex items-center space-x-2 text-blue-600"
              >
                <Edit className="h-4 w-4" />
                <span>Ver/Editar Detalle</span>
              </DropdownMenuItem>

              {adjunto.is_descargable && (
                <DropdownMenuItem
                  onClick={handleDownloadFile}
                  className="cursor-pointer hover:bg-gray-100 flex items-center space-x-2 text-slate-700"
                >
                  <Download className="h-4 w-4" />
                  <span>Descargar Archivo</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsModalOpen(true);
                }}
                className="cursor-pointer hover:bg-gray-100 flex items-center space-x-2 text-slate-600"
              >
                <ActionIcon className="h-4 w-4" />
                <span>{adjunto.estado ? "Desactivar" : "Activar"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {/* Modal de Confirmación de cambio de estado */}
      <ConfirmDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmStatus}
        title={modalTitle}
        message={<span dangerouslySetInnerHTML={{ __html: modalMessage }} />}
        confirmText={adjunto.estado ? "Desactivar" : "Activar"}
        isProcessing={isProcessing}
        icon={
          <AlertTriangle
            className={adjunto.estado ? "text-red-500" : "text-green-500"}
          />
        }
      />
    </>
  );
};
