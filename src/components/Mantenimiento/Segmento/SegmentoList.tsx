import { Link } from "react-router-dom";
import { Card, CardContent } from "../../ui/card";
import { SegmentoTable } from "./SegmentoTable";
import { Plus, Users, ArrowLeft } from "lucide-react";
import { buttonVariants } from "../../ui/button";
import { cn } from "@/lib/utils";

export const SegmentoList = () => {
  const newRoute = `/mantenimiento/segmento/nuevo`;

  return (
    <div className="animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Users className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Gestión Académica
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Listado de <span className="text-indigo-600">segmentos</span>
          </h1>
          <p className="text-xs text-slate-500">
            Administra, visualiza y gestiona la información de todos los
            segmentos registrados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "hidden sm:flex gap-1.5 border-slate-200 text-slate-600 hover:bg-slate-50 text-xs px-3 h-8",
            )}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Panel Principal
          </Link>

          <Link
            to={newRoute}
            className={cn(
              buttonVariants({ size: "sm" }), // Tamaño ajustado a 'sm' para entorno compacto
              "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs gap-1.5 px-3 h-8 text-xs font-medium transition-colors",
            )}
          >
            <Plus className="w-4 h-4" /> Nuevo segmento
          </Link>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-lg overflow-hidden bg-white">
        <CardContent className="p-0">
          <SegmentoTable />
        </CardContent>
      </Card>
    </div>
  );
};
