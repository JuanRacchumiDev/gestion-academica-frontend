import React, { useState } from "react";
import { Adjunto, TipoAdjunto } from "@/interfaces/IAdjunto";
import {
  FileText,
  FileSpreadsheet,
  FileUp,
  Image,
  FileCode,
  MoreVertical,
  Download,
  Trash2,
  Edit,
  GraduationCap,
  Bookmark,
  Loader2,
  AlertTriangle,
  Youtube,
  HardDrive,
  Link2,
  ExternalLink,
  Paperclip,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { downloadAdjunto, deleteAdjunto } from "../../services/adjuntoService";
import { useToast } from "@/context/ToastContext";
import { ConfirmDialog } from "@/components/Common/ConfirmDialog";

interface AdjuntoItemProps {
  adjunto: Adjunto;
  onDeleteSuccess?: () => void;
}

export const AdjuntoItem: React.FC<AdjuntoItemProps> = ({
  adjunto,
  onDeleteSuccess,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleShowDetail = () => {
    setIsDropdownOpen(false);
    navigate(`/adjunto/editar/${adjunto.id}`);
  };

  const handleDownload = async () => {
    if (!adjunto.id) return;
    setIsDropdownOpen(false);

    try {
      setIsDownloading(true);
      const filename = adjunto.originalname || `adjunto_${adjunto.id}`;
      await downloadAdjunto(adjunto.id, filename);
      showToast("success", "Archivo descargado correctamente");
    } catch (error) {
      console.error(error);
      showToast("error", "Error al intentar descargar el archivo");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenLink = () => {
    setIsDropdownOpen(false);
    if (adjunto.url) {
      window.open(adjunto.url, "_blank", "noopener,noreferrer");
    } else {
      showToast("error", "El adjunto no cuenta con una URL válida");
    }
  };

  const handleOpenDeleteModal = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsDropdownOpen(false);
    setIsConfirmOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsConfirmOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!adjunto.id) return;

    try {
      setIsDeleting(true);
      const response = await deleteAdjunto(adjunto.id);

      if (response.result) {
        showToast(
          "success",
          response.message || "Adjunto eliminado correctamente",
        );
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
      } else {
        showToast(
          "error",
          response.message || "No se pudo eliminar el adjunto",
        );
      }
    } catch (error) {
      console.error("Error al eliminar el adjunto:", error);
      showToast("error", "Ocurrió un error inesperado al eliminar el adjunto");
    } finally {
      setIsDeleting(false);
      handleCloseDeleteModal();
    }
  };

  /**
   * Configuración visual dinámica por Tipo de Adjunto
   */
  const getAdjuntoTypeConfig = (
    tipo?: TipoAdjunto,
    mimetype = "",
    originalname = "",
  ) => {
    switch (tipo) {
      case "YOUTUBE":
        return {
          icon: <Youtube className="w-6 h-6 text-red-600" />,
          bg: "bg-red-50/80 border-red-200/80",
          badgeText: "YouTube",
          badgeClass: "bg-red-50 text-red-700 border-red-200",
        };
      case "DRIVE":
        return {
          icon: <HardDrive className="w-6 h-6 text-emerald-600" />,
          bg: "bg-emerald-50/80 border-emerald-200/80",
          badgeText: "Google Drive",
          badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "URL":
        return {
          icon: <Link2 className="w-6 h-6 text-amber-600" />,
          bg: "bg-amber-50/80 border-amber-200/80",
          badgeText: "Enlace Web",
          badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case "FILE":
      default: {
        const ext = originalname.split(".").pop()?.toLowerCase() || "";

        if (mimetype.includes("pdf") || ext === "pdf") {
          return {
            icon: <FileText className="w-6 h-6 text-red-500" />,
            bg: "bg-red-50/80 border-red-100",
            badgeText: "Documento PDF",
            badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
          };
        }
        if (
          mimetype.includes("excel") ||
          mimetype.includes("spreadsheet") ||
          ["xlsx", "xls", "csv"].includes(ext)
        ) {
          return {
            icon: <FileSpreadsheet className="w-6 h-6 text-emerald-600" />,
            bg: "bg-emerald-50/80 border-emerald-100",
            badgeText: "Hoja de Cálculo",
            badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
          };
        }
        if (
          mimetype.includes("word") ||
          mimetype.includes("officedocument.wordprocessingml") ||
          ["docx", "doc"].includes(ext)
        ) {
          return {
            icon: <FileCode className="w-6 h-6 text-blue-500" />,
            bg: "bg-blue-50/80 border-blue-100",
            badgeText: "Documento Word",
            badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
          };
        }
        if (
          mimetype.includes("image") ||
          ["png", "jpg", "jpeg", "svg", "webp"].includes(ext)
        ) {
          return {
            icon: <Image className="w-6 h-6 text-purple-500" />,
            bg: "bg-purple-50/80 border-purple-100",
            badgeText: "Imagen",
            badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
          };
        }
        return {
          icon: <Paperclip className="w-6 h-6 text-indigo-500" />,
          bg: "bg-indigo-50/80 border-indigo-100",
          badgeText: "Archivo Local",
          badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
        };
      }
    }
  };

  const formatBytes = (bytes?: number, decimals = 2) => {
    if (!bytes || bytes === 0) return "—";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const typeConfig = getAdjuntoTypeConfig(
    adjunto.tipo,
    adjunto.mimetype || "",
    adjunto.originalname || "",
  );

  const nombrePrograma = adjunto.programa?.titulo || "Sin programa asignado";
  const tipoPrograma = adjunto.programa?.tipo_programa?.nombre || "General";
  const nombreArchivo =
    adjunto.titulo || adjunto.originalname || "este adjunto";

  const isFile = adjunto.tipo === "FILE" || !adjunto.tipo;

  return (
    <>
      <div
        className={`group relative bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between h-full ${
          isDeleting ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <div>
          {/* Cabecera: Icono, Badge Tipo Adjunto y Menú de Acciones */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`p-2 rounded-lg border ${typeConfig.bg} transition-transform group-hover:scale-105 shrink-0`}
              >
                {typeConfig.icon}
              </div>

              {/* Badge del Tipo de Adjunto */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border truncate shrink-0 ${typeConfig.badgeClass}`}
              >
                {typeConfig.badgeText}
              </span>
            </div>

            <DropdownMenu
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
            >
              <DropdownMenuTrigger
                disabled={isDownloading || isDeleting}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 disabled:opacity-50"
              >
                {isDownloading || isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <MoreVertical className="w-4 h-4" />
                )}
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-44 bg-white">
                <DropdownMenuItem
                  onClick={handleShowDetail}
                  className="gap-2 text-slate-600 cursor-pointer"
                >
                  <Edit className="w-4 h-4" /> Editar
                </DropdownMenuItem>

                {isFile ? (
                  <DropdownMenuItem
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="gap-2 text-slate-600 cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Descargar
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={handleOpenLink}
                    className="gap-2 text-blue-600 focus:text-blue-700 focus:bg-blue-50 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" /> Abrir Enlace
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={handleOpenDeleteModal}
                  disabled={isDeleting}
                  className="gap-2 text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Contenido Principal */}
          <div className="space-y-1.5 mb-3">
            {/* Título del Adjunto */}
            <h3 className="font-bold text-slate-800 text-sm leading-snug wrap-break-word group-hover:text-blue-600 transition-colors">
              {adjunto.titulo || "Sin título"}
            </h3>

            {/* Programa asignado */}
            <div className="flex items-start gap-1.5 text-xs text-slate-600 font-medium">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span
                className="line-clamp-2 leading-tight"
                title={nombrePrograma}
              >
                {nombrePrograma}
              </span>
            </div>

            {/* Subtítulo: Nombre original o URL externa */}
            <div className="pt-0.5">
              {isFile ? (
                <p
                  className="text-[11px] text-slate-400 font-normal truncate"
                  title={adjunto.originalname}
                >
                  {adjunto.originalname || "Sin archivo físico"}
                </p>
              ) : (
                <a
                  href={adjunto.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-normal truncate max-w-full"
                  title={adjunto.url}
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  <span className="truncate">{adjunto.url}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer de la Tarjeta */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium mt-auto">
          {/* Badge secundario de Tipo de Programa */}
          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-medium truncate max-w-[120px]">
            <Bookmark className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{tipoPrograma}</span>
          </span>

          <div className="flex items-center gap-2">
            {isFile && (
              <span className="text-[10px] font-mono text-slate-400">
                {formatBytes(adjunto.size)}
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                adjunto.estado
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {adjunto.estado ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>
      </div>

      {/* Diálogo de Confirmación para Eliminar */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Eliminar Adjunto"
        message={
          <span
            dangerouslySetInnerHTML={{
              __html: `¿Está seguro de eliminar el adjunto <strong>${nombreArchivo}</strong>? Esta acción no se puede deshacer.`,
            }}
          />
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        isProcessing={isDeleting}
        icon={<AlertTriangle className="text-rose-500 w-6 h-6" />}
      />
    </>
  );
};
