import React from "react";
import { Matricula } from "@/interfaces/IMatricula";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, Landmark, Layers } from "lucide-react";
import { format, parseISO } from "date-fns";
import { VistaPrograma } from "./VistaPrograma";

interface ListarMatriculasProps {
  matriculas: Matricula[];
}

export const ListarMatriculas: React.FC<ListarMatriculasProps> = ({
  matriculas,
}) => {
  if (matriculas?.length === 0) {
    return (
      <Card className="border-dashed border-slate-200 p-6 text-center text-muted-foreground shadow-sm">
        No registras ninguna matrícula activa en el sistema actualmente.
      </Card>
    );
  }

  return (
    // Reducido de space-y-6 a space-y-4
    <div className="space-y-4">
      {matriculas?.map((mat) => (
        <Card
          key={mat.id}
          className="border-slate-200 shadow-md overflow-hidden bg-white"
        >
          {/* Reducido p-5 a py-3 px-5 */}
          <CardHeader className="bg-slate-50 border-b border-slate-100 py-3 px-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-indigo-600" />
                  {mat.institucion?.nombre || "Institución Académica"}
                </CardTitle>
                <CardDescription className="flex items-center gap-3 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    F. Matrícula:{" "}
                    {mat.fecha_matricula
                      ? format(parseISO(mat.fecha_matricula), "dd/MM/yyyy")
                      : "---"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5" />
                    Módulos: {mat.numero_modulos ?? 0}
                  </span>
                </CardDescription>
              </div>
              <Badge className="font-bold self-start sm:self-auto bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-none hover:bg-emerald-50">
                {mat.estadoMatricula?.nombre || "Activo"}
              </Badge>
            </div>
          </CardHeader>

          {/* Reducido p-6 a py-4 px-6 */}
          <CardContent className="py-4 px-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
              Programas de Estudio Inscritos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mat.detalles?.map((detalle, index) => (
                <VistaPrograma key={detalle.id ?? index} detalle={detalle} />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
