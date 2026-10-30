import { Certificado } from "../../interfaces/ICertificado";
import { TableCell, TableRow } from "../ui/table";
import {
  AlertTriangle,
  CircleCheck,
  CircleX,
  Download,
  Edit,
  Loader2,
  MoreHorizontal,
  ToggleLeft,
  ToggleRight,
  Trash2,
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
import { padString } from "@/utils/stringUtils";
import { formatDate } from "@/utils/dateUtils";
import {
  downloadCertificado,
  deleteCertificado,
} from "@/services/certificadoService";

interface Props {
  certificado: Certificado;
  onStatusChange?: (CertificadoId: number) => void;
  onDelete?: (CertificadoGrid: number) => void;
}

export const CertificadoRow: React.FC<Props> = ({
  certificado,
  onStatusChange,
  onDelete,
}) => {
  const { showToast } = useToast();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Estado para modal de estado (Activar/Desactivar)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isProcessingStatus, setIsProcessingStatus] = useState(false);

  // Estado para modal de eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);

  const [isDownloading, setIsDownloading] = useState(false);

  const navigate = useNavigate();

  const nuevoEstado = !certificado.estado;
  const action = nuevoEstado ? "activar" : "desactivar";
  const modalStatusTitle = `${
    action.charAt(0).toUpperCase() + action.slice(1)
  } Certificado`;
  const modalStatusMessage = `¿Deseas <strong>${action}</strong> el certificado: <strong>${certificado.persona?.nombre_completo || ""}</strong>?`;

  const handleShowDetail = () => {
    navigate(`/certificado/editar/${certificado.id}`);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDownloading(true);
    setIsDropdownOpen(false);

    try {
      await downloadCertificado(certificado.id);
      showToast("success", "Certificado descargado con éxito.");
    } catch (error) {
      console.error("Error al descargar el certificado:", error);
      showToast("error", "No se pudo descargar el archivo del certificado.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenStatusModal = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsDropdownOpen(false);
    setIsStatusModalOpen(true);
  };

  const handleConfirmStatus = async () => {
    setIsProcessingStatus(true);
    try {
      if (onStatusChange) {
        await onStatusChange(certificado.id);
      }
      showToast("success", "Estado del certificado actualizado.");
    } catch (error) {
      console.error("Error en la actualización de estado:", error);
      showToast("error", "Error de conexión al intentar actualizar.");
    } finally {
      setIsProcessingStatus(false);
      setIsStatusModalOpen(false);
    }
  };

  // Manejadores para Eliminar
  const handleOpenDeleteModal = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsDropdownOpen(false);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsProcessingDelete(true);
    try {
      const response = await deleteCertificado(certificado.id);

      if (response.result) {
        showToast(
          "success",
          response.message || "Certificado eliminado correctamente.",
        );
        if (onDelete) {
          onDelete(certificado.id);
        }
      } else {
        showToast(
          "error",
          response.error ||
            response.message ||
            "No se pudo eliminar el certificado.",
        );
      }
    } catch (error) {
      console.error("Error al eliminar certificado:", error);
      showToast(
        "error",
        "Error de conexión al intentar eliminar el certificado.",
      );
    } finally {
      setIsProcessingDelete(false);
      setIsDeleteModalOpen(false);
    }
  };

  const actionText = certificado.estado ? "Desactivar" : "Activar";
  const ActionIcon = certificado.estado ? ToggleLeft : ToggleRight;
  const actionColor = certificado.estado ? "text-red-600" : "text-green-600";
  const hoverBgColor = certificado.estado
    ? "hover:bg-red-100"
    : "hover:bg-green-100";

  const nombreAlumno =
    certificado.persona?.nombre_completo ||
    `${certificado.persona?.nombres ?? ""} ${
      certificado.persona?.apellido_paterno ?? ""
    }`.trim();

  const tituloPrograma = certificado.programa?.titulo ?? "--";

  return (
    <>
      <TableRow
        key={certificado.id}
        className="hover:bg-slate-50/80 hover:cursor-pointer transition-colors duration-150 border-b border-slate-100"
      >
        {/* ID */}
        <TableCell className="py-2.5 px-2 text-xs font-medium text-slate-500 break-all align-top">
          #{padString(4, certificado.id, "left")}
        </TableCell>

        {/* Alumno: Muestra texto completo con múltiples líneas según necesite */}
        <TableCell className="py-2.5 px-2 text-xs font-medium text-slate-700 leading-tight whitespace-normal wrap-break-words align-top">
          {nombreAlumno}
        </TableCell>

        {/* Tipo Institución */}
        <TableCell className="py-2.5 px-2 text-xs font-medium text-slate-700 leading-tight whitespace-normal wrap-break-words align-top">
          {certificado.plantilla.institucion?.nombre ?? "----"}
        </TableCell>

        {/* Tipo Programa */}
        <TableCell className="py-2.5 px-2 text-xs font-medium text-slate-700 leading-tight whitespace-normal wrap-break-words align-top">
          {certificado.programa.tipo_programa?.nombre ?? "--"}
        </TableCell>

        {/* Programa: Muestra texto completo con múltiples líneas según necesite */}
        <TableCell className="py-2.5 px-2 text-xs font-medium text-slate-500 leading-tight whitespace-normal wrap-break-words align-top">
          {tituloPrograma}
        </TableCell>

        {/* Fecha */}
        <TableCell className="py-2.5 px-2 text-[11px] font-medium text-slate-500 whitespace-nowrap align-top">
          {formatDate(certificado.fecha_crea)}
        </TableCell>

        {/* Estado */}
        <TableCell className="py-2.5 px-1 text-center align-top">
          <div className="flex items-center justify-center">
            {certificado.estado ? (
              <CircleCheck className="text-emerald-500 w-4 h-4 stroke-[2.5]" />
            ) : (
              <CircleX className="text-rose-500 w-4 h-4 stroke-[2.5]" />
            )}
          </div>
        </TableCell>

        {/* Acciones */}
        <TableCell className="py-2.5 px-1 text-right align-top">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                disabled={isDownloading}
                className="h-7 w-7 p-0 focus-visible:ring-1 focus-visible:ring-slate-400 focus-visible:ring-offset-0"
              >
                <span className="sr-only">Abrir menú de acciones</span>
                {isDownloading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                ) : (
                  <MoreHorizontal className="h-3.5 w-3.5 text-slate-400" />
                )}
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
                onClick={handleDownload}
                className="cursor-pointer hover:bg-slate-50 rounded-sm py-1 px-2 flex items-center gap-2 text-slate-700 hover:text-blue-600"
              >
                <Download className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600" />
                <span>Descargar PDF</span>
              </DropdownMenuItem>

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
                <span>{actionText} Certificado</span>
              </DropdownMenuItem>

              {/* OPCIÓN DE ELIMINAR */}
              <DropdownMenuItem
                onClick={handleOpenDeleteModal}
                className="cursor-pointer rounded-sm py-1 px-2 flex items-center gap-2 font-medium text-red-600 hover:bg-red-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Eliminar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <ConfirmDialog
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={handleConfirmStatus}
        title={modalStatusTitle}
        message={
          <span dangerouslySetInnerHTML={{ __html: modalStatusMessage }} />
        }
        confirmText={actionText}
        isProcessing={isProcessingStatus}
        icon={
          <AlertTriangle
            className={certificado.estado ? "text-red-500" : "text-green-500"}
          />
        }
      />

      {/* MODAL ELIMINAR */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Certificado"
        message={
          <span>
            ¿Estás seguro de que deseas eliminar permanentemente el certificado{" "}
            <strong>#{padString(4, certificado.id, "left")}</strong>? Esta
            acción eliminará el registro y los archivos asociados en el
            servidor.
          </span>
        }
        confirmText="Eliminar"
        isProcessing={isProcessingDelete}
        icon={<AlertTriangle className="text-red-600" />}
      />
    </>
  );
};
