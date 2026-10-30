import React from "react";
import { Modulo } from "../../interfaces/IModulo";
import { Matricula } from "../../interfaces/IMatricula";
import { obtenerEstadoModulo } from "../../utils/moduloUtils";
import { Award, Lock, ExternalLink, Clock, Download } from "lucide-react";

interface ModuloCardProps {
  modulo: Modulo;
  matricula: Matricula;
  onGenerarCertificado?: (modulo: Modulo) => void;
  onDescargarCertificado?: (modulo: Modulo) => void;
}

export const ModuloCard: React.FC<ModuloCardProps> = ({
  modulo,
  matricula,
  onGenerarCertificado,
  onDescargarCertificado,
}) => {
  const estado = obtenerEstadoModulo(modulo, matricula);
  const isHabilitado = estado === "HABILITADO";
  const isPagoPendiente = estado === "PAGO_PENDIENTE";

  return (
    <div
      className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 ${
        isHabilitado
          ? "border-emerald-200 bg-white shadow-sm hover:shadow-md"
          : "border-slate-200 bg-slate-50/80 opacity-90"
      }`}
    >
      <div>
        {/* Encabezado */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-lg ${
                isHabilitado
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {isHabilitado ? (
                <Award className="w-5 h-5" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>
            <span className="font-bold text-slate-800">
              Módulo {modulo.orden ?? "-"}
            </span>
          </div>

          {/* Badge de Estado */}
          {isHabilitado && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              ✓ Habilitado
            </span>
          )}
          {isPagoPendiente && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
              <Clock className="w-3 h-3" /> Pago pendiente
            </span>
          )}
          {!isHabilitado && !isPagoPendiente && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-600">
              Bloqueado
            </span>
          )}
        </div>

        {/* Info del Módulo */}
        <h4 className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">
          {modulo.titulo ?? "Sin título"}
        </h4>
        <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
          {modulo.descripcion ?? "Sin descripción disponible."}
        </p>
      </div>

      {/* Acciones */}
      <div className="pt-2">
        {isHabilitado ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onGenerarCertificado?.(modulo)}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-900 hover:bg-indigo-800 rounded-lg transition-colors shadow-sm active:scale-[0.98]"
            >
              Generar Certificado PDF
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            disabled
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-slate-400 bg-slate-200/80 rounded-lg cursor-not-allowed"
          >
            <Lock className="w-3.5 h-3.5" />
            Bloqueado ({isPagoPendiente ? "Req. Pago" : "Requisito"})
          </button>
        )}
      </div>
    </div>
  );
};
