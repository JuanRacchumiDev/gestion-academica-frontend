import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Laptop, MapPin } from "lucide-react";
import { DetalleMatricula } from "@/interfaces/IDetalleMatricula";

interface DetalleMatriculaProps {
  detalle: DetalleMatricula;
}

export const VistaPrograma: React.FC<DetalleMatriculaProps> = ({ detalle }) => {
  const programa = detalle.programa;

  if (!programa) {
    return (
      <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-sm text-slate-400 italic">
        Información del programa no disponible
      </div>
    );
  }

  const getBadgeVariant = (tipo?: string) => {
    switch (tipo?.toUpperCase()) {
      case "DIPLOMADO":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "ESPECIALIZACIÓN":
      case "ESPECIALIZACION":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "CERTIFICACIÓN":
      case "CERTIFICACION":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="py-3 px-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between gap-2 transition-all hover:shadow-md">
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            className={`font-bold tracking-wide uppercase text-[10px] px-2 py-0 shadow-none ${getBadgeVariant(programa.tipo_programa?.nombre)}`}
          >
            {programa.tipo_programa?.nombre || "CURSO"}
          </Badge>

          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            {programa.modalidad?.toUpperCase() === "VIRTUAL" ? (
              <Laptop className="h-3.5 w-3.5 text-blue-500" />
            ) : (
              <MapPin className="h-3.5 w-3.5 text-orange-500" />
            )}
            {programa.modalidad || "Virtual"}
          </span>
        </div>

        <h4 className="text-sm font-bold text-slate-800 line-clamp-2 uppercase tracking-tight">
          {programa.titulo}
        </h4>
      </div>

      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>Duración: {programa.duracion || "---"}</span>
        </div>
        <div className="text-right text-slate-400 text-[11px]">
          Mod:{" "}
          <span className="text-slate-600 font-semibold">
            S/.{detalle.valor_modulo ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
};
