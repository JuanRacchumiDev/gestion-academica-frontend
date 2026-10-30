import { Pago } from "../../interfaces/IPago";
import { TableCell, TableRow } from "../ui/table";
import {
  AlertTriangle,
  CircleCheck,
  CircleX,
  MoreHorizontal,
  FileDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useToast } from "../../context/ToastContext";
import { useState } from "react";
import { ConfirmDialog } from "@/components/Common/ConfirmDialog";
import { downloadFile } from "../../utils/fileUtils";
import { formatDate } from "@/utils/dateUtils";
import { padString } from "@/utils/stringUtils";
import { getConstanciaPagoByParams } from "@/services/pagoService";

interface Props {
  pago: Pago;
  onStatusChange?: (pagoId: number) => void;
}

export const PagoRow: React.FC<Props> = ({ pago }) => {
  const { showToast } = useToast();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // ⬅️ Estado para el modal
  const [isProcessing, setIsProcessing] = useState(false); // ⬅️ Estado para el loading

  const nuevoEstado = !pago.estado;
  const action = nuevoEstado ? "activar" : "desactivar";
  const modalTitle = `${action.charAt(0).toUpperCase() + action.slice(1)} Pago`;
  const modalMessage = `¿Deseas <strong>${action}</strong> el pago: <strong>${pago.id}</strong>?`;

  // console.log({ pago });

  const handleDownloadConstanciaPago = async () => {
    setIsDropdownOpen(false); // Cierra el menú

    showToast("info", "Preparando constancia de pago...");

    try {
      const response = await getConstanciaPagoByParams(pago.id!);

      const { result, data } = response;

      if (result && data) {
        downloadFile(data as Blob, response.filename);
        showToast("success", "Constancia de pago descargado exitosamente");
      } else {
        showToast(
          "error",
          response.error || "Error al descargar la constancia de pago",
        );
      }
    } catch (error) {
      console.error("Error al descargar la constancia de pago:", error);
      showToast(
        "error",
        "Error de conexión al intentar descargar la constancia de pago.",
      );
    }
  };

  // Cierra el modal
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
      setIsProcessing(false); // Desactiva el loading
      handleCloseModal(); // Cierra el modal
    }
  };

  // Determinar texto y color de acción
  const actionText = pago.estado ? "Desactivar" : "Activar";

  return (
    <>
      <TableRow
        key={pago.id}
        className="hover:bg-slate-50/80 hover:cursor-pointer transition-colors duration-150 border-b border-slate-100"
      >
        <TableCell className="py-2 px-3 text-xs font-medium text-slate-500">
          #{padString(4, pago.matricula.id, "left")}
        </TableCell>
        <TableCell className="py-2 px-3 text-xs font-medium text-slate-500">
          {formatDate(pago.matricula.fecha_matricula)}
        </TableCell>
        <TableCell className="py-2 px-3 text-xs font-medium text-slate-500">
          {pago.matricula.persona.nombre_completo}
        </TableCell>
        <TableCell className="py-2 px-3 text-xs font-medium text-slate-500">
          {pago.concepto}
        </TableCell>
        <TableCell className="py-2 px-3 text-xs font-medium text-slate-500">
          {pago.forma_pago.nombre}
        </TableCell>
        <TableCell className="py-2 px-3 text-xs font-medium text-slate-500">
          {formatDate(pago.fecha_pago)}
        </TableCell>
        <TableCell className="py-2 px-3 text-center">
          <div className="flex items-center justify-center">
            {pago.estado ? (
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
                onClick={handleDownloadConstanciaPago}
                className="cursor-pointer rounded-sm py-1 px-2 flex items-center gap-2 font-medium"
              >
                <FileDown className="h-3.5 w-3.5" />
                <span>Descargar Constancia Pago</span>
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
            className={pago.estado ? "text-red-500" : "text-green-500"}
          />
        }
      />
    </>
  );
};
