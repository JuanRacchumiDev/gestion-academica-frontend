import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { PersonaTable } from "./PersonaTable";
import { Plus, Users, ArrowLeft } from "lucide-react";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";

interface PersonaListProps {
  nombreGrupo?: string;
}

const getNombresDescriptivos = (
  group: string | undefined,
): { singular: string; plural: string; buttonPrefix: string } => {
  const defaultNombres = {
    singular: "Persona",
    plural: "Personas",
    buttonPrefix: "Nueva",
  };
  if (!group) return defaultNombres;

  const mapping: Record<
    string,
    { singular: string; plural: string; buttonPrefix: string }
  > = {
    alumno: { singular: "Alumno", plural: "Alumnos", buttonPrefix: "Nuevo" },
    promotor: {
      singular: "Promotor",
      plural: "Promotores",
      buttonPrefix: "Nuevo",
    },
    cobrador: {
      singular: "Cobrador",
      plural: "Cobradores",
      buttonPrefix: "Nuevo",
    },
  };

  return mapping[group.toLowerCase()] || defaultNombres;
};

export const PersonaList: React.FC<PersonaListProps> = ({ nombreGrupo }) => {
  const nombres = getNombresDescriptivos(nombreGrupo);
  const newRoute = nombreGrupo
    ? `/personas/${nombreGrupo}/nuevo`
    : "/personas/nuevo";
  const buttonText = `${nombres.buttonPrefix} ${nombres.singular}`;

  return (
    // Reducción de la duración de animación para mejor feedback visual al cambiar de ruta
    <div className="animate-in fade-in duration-200">
      {/* Margen inferior reducido de mb-8 a mb-4 para compactar la cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Users className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Gestión Académica
            </span>
          </div>
          {/* Título optimizado de text-3xl font-extrabold a text-xl font-bold */}
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Listado de <span className="text-indigo-600">{nombres.plural}</span>
          </h1>
          <p className="text-xs text-slate-500">
            Administra, visualiza y gestiona la información de todos los{" "}
            {nombres.plural.toLowerCase()} registrados.
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
            <Plus className="w-4 h-4" />
            {buttonText}
          </Link>
        </div>
      </div>

      {/* Tarjeta con sombra sutil perimetral y bordes simplificados */}
      <Card className="border-slate-200 shadow-sm rounded-lg overflow-hidden bg-white">
        <CardContent className="p-0">
          <PersonaTable nombreGrupo={nombreGrupo} />
        </CardContent>
      </Card>
    </div>
  );
};
