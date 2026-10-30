import { Programa } from "../../interfaces/IPrograma";
import { TableCell, TableRow } from "../ui/table";
import {
  AlertTriangle,
  CircleCheck,
  CircleX,
  Edit,
  MoreHorizontal,
  ToggleLeft,
  ToggleRight,
  Download,
  Layers,
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
import { ModuloSheetForm } from "../Modulo/ModuloSheetForm";
// import { downloadProgramaPlan } from "@/services/programaService";
import { formatDate } from "../../utils/dateUtils";

interface Props {
  programa: Programa;
  onStatusChange?: (programaId: number) => void;
  onRefresh?: () => void;
}

export const ProgramaRow: React.FC<Props> = ({ programa, onRefresh }) => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModuloSheetOpen, setIsModuloSheetOpen] = useState(false);

  const nuevoEstado = !programa.estado;
  const action = nuevoEstado ? "activar" : "desactivar";
  const modalTitle = `${action.charAt(0).toUpperCase() + action.slice(1)} Programa`;

  // CORREGIDO: Se cambia el template literal de ${programa} a ${programa.titulo}
  const modalMessage = `¿Deseas <strong>${action}</strong> el programa: <strong>${programa.titulo ?? "Sin título"}</strong>?`;

  const handleShowDetail = () => {
    navigate(`/programa-academico/editar/${programa.id}`);
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

  const actionText = programa.estado ? "Desactivar" : "Activar";
  const ActionIcon = programa.estado ? ToggleLeft : ToggleRight;
  const actionColor = programa.estado
    ? "text-red-600 hover:text-red-700"
    : "text-green-600 hover:text-green-700";
  const hoverBgColor = programa.estado
    ? "hover:bg-red-50/70"
    : "hover:bg-green-50/70";

  // Verificación de cantidad de módulos mayor que 0
  const tieneModulos = (programa.numero_modulos ?? 0) > 0;

  return (
    <>
      <TableRow
        key={programa.id}
        onClick={handleShowDetail}
        className="hover:bg-slate-50/80 hover:cursor-pointer transition-colors duration-150 border-b border-slate-100"
      >
        <TableCell className="py-2 px-3 text-xs font-medium text-slate-700">
          {programa.segmento?.nombre ?? "--"}
        </TableCell>

        <TableCell className="py-2 px-3 text-xs text-slate-600">
          {programa.tipo_programa?.nombre ?? "--"}
        </TableCell>

        <TableCell
          className="py-2 px-3 text-xs text-slate-900 whitespace-normal wrap-break-word min-w-[200px]"
          title={programa.titulo}
        >
          {programa.titulo ?? "--"}
        </TableCell>

        <TableCell className="py-2 px-3 text-xs text-slate-600 text-center tabular-nums font-medium">
          {formatDate(programa.fecha_inicio)}
        </TableCell>

        <TableCell className="py-2 px-3 text-xs text-slate-600 text-center tabular-nums font-medium">
          {formatDate(programa.fecha_final)}
        </TableCell>

        <TableCell className="py-2 px-3 text-xs text-slate-600 text-center font-medium">
          {/* {programa.duracion ?? "--"} */}
          {programa.duracion
            ? programa.duracion
            : `${programa.horas_academicas} horas`}
        </TableCell>

        <TableCell className="py-2 px-3 text-xs text-slate-700 text-center font-bold">
          {programa.numero_modulos ?? 0}
        </TableCell>

        <TableCell
          className="py-2 px-3 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-center">
            {programa.estado ? (
              <CircleCheck className="text-emerald-500 w-4 h-4 stroke-[2.5]" />
            ) : (
              <CircleX className="text-rose-500 w-4 h-4 stroke-[2.5]" />
            )}
          </div>
        </TableCell>

        <TableCell
          className="py-2 px-3 text-right"
          onClick={(e) => e.stopPropagation()}
        >
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

              {tieneModulos && (
                <>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsModuloSheetOpen(true);
                    }}
                    className="cursor-pointer hover:bg-slate-50 rounded-sm py-1 px-2 flex items-center gap-2 text-slate-700"
                  >
                    <Layers className="h-3.5 w-3.5 text-slate-400" />
                    <span>Configurar módulos</span>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator className="bg-slate-100" />

              <DropdownMenuItem
                onClick={handleOpenStatusModal}
                className={`cursor-pointer rounded-sm py-1 px-2 flex items-center gap-2 font-medium ${hoverBgColor} ${actionColor}`}
              >
                <ActionIcon className="h-3.5 w-3.5" />
                <span>{actionText} Programa</span>
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
            className={programa.estado ? "text-red-500" : "text-green-500"}
          />
        }
      />

      {tieneModulos && (
        <ModuloSheetForm
          programa={programa}
          isOpen={isModuloSheetOpen}
          onClose={() => setIsModuloSheetOpen(false)}
          onSuccess={() => {
            if (onRefresh) {
              onRefresh();
            }
          }}
        />
      )}
    </>
  );
};
