import { Plantilla } from "../../interfaces/IPlantilla";
import { TableCell, TableRow } from "../ui/table";
import {
  AlertTriangle,
  CircleCheck,
  CircleX,
  Edit,
  MoreHorizontal,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useToast } from "../../context/ToastContext";
import { useState } from "react";
import { ConfirmDialog } from "@/components/Common/ConfirmDialog";

interface Props {
  plantilla: Plantilla;
}

export const PlantillaRow: React.FC<Props> = ({ plantilla }) => {
  const { showToast } = useToast();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const nuevoEstado = !plantilla.estado;
  const action = nuevoEstado ? "activar" : "desactivar";
  const modalTitle = `${action.charAt(0).toUpperCase() + action.slice(1)} Registro`;
  const modalMessage = `¿Deseas <strong>${action}</strong> la plantilla: <strong>${plantilla.nombre}</strong>?`;

  const handleShowDetail = () => {
    navigate(`/plantilla/editar/${plantilla.id}`);
  };

  const handleOpenStatusModal = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsDropdownOpen(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirmStatus = async () => {
    setIsProcessing(true);
    try {
      showToast("error", "Error de conexión al intentar actualizar.");
    } catch (error) {
      console.error("Error en la actualización de estado:", error);
      showToast("error", "Error de conexión al intentar actualizar.");
    } finally {
      setIsProcessing(false);
      handleCloseModal();
    }
  };

  const actionText = plantilla.estado ? "Desactivar" : "Activar";
  const ActionIcon = plantilla.estado ? ToggleLeft : ToggleRight;
  const actionColor = plantilla.estado ? "text-rose-600" : "text-emerald-600";
  const hoverBgColor = plantilla.estado
    ? "hover:bg-rose-50"
    : "hover:bg-emerald-50";

  return (
    <>
      <TableRow
        key={plantilla.id}
        className="hover:bg-slate-50/80 hover:cursor-pointer transition-colors duration-150 border-b border-slate-100"
      >
        {/* Se removió max-w-[200px] y se añadió whitespace-normal */}
        <TableCell className="py-2 px-3 text-xs font-medium text-slate-700 whitespace-normal">
          {plantilla.sucursal?.nombre || "-"}
        </TableCell>
        <TableCell className="py-2 px-3 text-xs font-medium text-slate-700 whitespace-normal">
          {plantilla.institucion?.nombre || "Sin institución"}
        </TableCell>
        <TableCell className="py-2 px-3 text-xs text-slate-500 whitespace-normal">
          {plantilla.tipo_programa?.nombre || "-"}
        </TableCell>
        <TableCell className="py-2 px-3 text-xs text-slate-600 font-mono whitespace-normal">
          {plantilla.nombre}
        </TableCell>
        <TableCell className="py-2 px-3 text-center">
          <div className="flex items-center justify-center">
            {plantilla.estado ? (
              <CircleCheck className="text-emerald-500 w-4 h-4 stroke-[2.5]" />
            ) : (
              <CircleX className="text-rose-500 w-4 h-4 stroke-[2.5]" />
            )}
          </div>
        </TableCell>
        <TableCell className="py-2 px-3 text-right">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-7 w-7 p-0 focus-visible:ring-1 focus-visible:ring-slate-400 focus-visible:ring-offset-0"
              >
                <span className="sr-only">Abrir menú de acciones</span>
                <MoreHorizontal className="h-3.5 w-3.5 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="bg-white border border-slate-200 shadow-md min-w-[140px] text-xs p-1 rounded-md"
            >
              <DropdownMenuLabel className="font-medium text-slate-400 px-2 py-1 text-[10px] uppercase tracking-wider">
                Acciones
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100" />

              <DropdownMenuItem
                onClick={handleShowDetail}
                className="cursor-pointer hover:bg-slate-50 rounded-sm py-1 px-2 flex items-center gap-2 text-slate-700"
              >
                <Edit className="h-3.5 w-3.5 text-slate-400" />
                <span>Ver/Editar detalle</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100" />

              <DropdownMenuItem
                onClick={handleOpenStatusModal}
                className={`cursor-pointer rounded-sm py-1 px-2 flex items-center gap-2 font-medium ${actionColor} ${hoverBgColor}`}
              >
                <ActionIcon className="h-3.5 w-3.5" />
                <span>{actionText}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <ConfirmDialog
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmStatus}
        title={modalTitle}
        message={<span dangerouslySetInnerHTML={{ __html: modalMessage }} />}
        confirmText={actionText}
        isProcessing={isProcessing}
        icon={
          <AlertTriangle
            className={plantilla.estado ? "text-rose-500" : "text-emerald-500"}
          />
        }
      />
    </>
  );
};
