import React from "react";
import { Certificado } from "@/interfaces/ICertificado";
import {
  Award,
  Download,
  Eye,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  Building2,
  GraduationCap,
  FileCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface CertificadoCardProps {
  certificado: Certificado;
  onView?: (certificado: Certificado) => void;
  onDownload?: (certificado: Certificado) => void;
  onEdit?: (certificado: Certificado) => void;
  onDelete?: (certificado: Certificado) => void;
}

export const CertificadoCard: React.FC<CertificadoCardProps> = ({
  certificado,
  onView,
  onDownload,
  onEdit,
  onDelete,
}) => {
  const nombrePersona = certificado.persona
    ? `${certificado.persona.nombres || ""} ${
        certificado.persona.apellido_paterno || ""
      } ${certificado.persona.apellido_materno || ""}`.trim()
    : certificado.nombre_impresion || "Sin asignar";

  return (
    <div className="group relative bg-white border border-slate-200 hover:border-indigo-200 rounded-xl p-4 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      {/* Cabecera de la tarjeta */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50/70 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Award className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                <FileCheck className="w-3 h-3" />
                {certificado.tipo_certificado?.nombre || "Certificado"}
              </span>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                {certificado.codigo_verificacion || "S/N"}
              </p>
            </div>
          </div>

          {/* Menú de Opciones */}
          <DropdownMenu>
            <DropdownMenuTrigger className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors outline-none">
              <MoreVertical className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 text-xs">
              {onView && (
                <DropdownMenuItem
                  onClick={() => onView(certificado)}
                  className="gap-2 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" /> Ver detalle
                </DropdownMenuItem>
              )}
              {onDownload && (
                <DropdownMenuItem
                  onClick={() => onDownload(certificado)}
                  className="gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" /> Descargar
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem
                  onClick={() => onEdit(certificado)}
                  className="gap-2 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-500" /> Editar
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(certificado)}
                  className="gap-2 text-rose-600 focus:text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Información del Titular y Programa */}
        <div className="space-y-2 mb-4">
          <h4
            className="font-semibold text-sm text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors"
            title={nombrePersona}
          >
            {nombrePersona}
          </h4>

          {certificado.programa && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate" title={certificado.programa.titulo}>
                {certificado.programa.titulo}
              </span>
            </div>
          )}

          {certificado.sucursal && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate" title={certificado.sucursal.nombre}>
                {certificado.sucursal.nombre}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Botón Descarga directa */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span className="text-[11px] font-medium text-slate-500 truncate max-w-[150px]">
          {certificado.filename || "Archivo sin nombre"}
        </span>

        {onDownload && (
          <button
            onClick={() => onDownload(certificado)}
            className="p-1.5 rounded-md border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-all"
            title="Descargar archivo"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
