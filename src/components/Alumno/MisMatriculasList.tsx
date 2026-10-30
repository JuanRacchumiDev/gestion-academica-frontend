import React, { useEffect, useState } from "react";
import { Persona } from "@/interfaces/IPersona";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Calendar,
  Layers,
  Landmark,
  BookOpen,
  Download,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { getPersonaById } from "../../services/personaService";
import { useToast } from "../../context/ToastContext";

export const MisMatriculasList: React.FC = () => {
  const [alumno, setAlumno] = useState<Persona | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedPrograma, setExpandedPrograma] = useState<number | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchMatriculas = async () => {
      try {
        const storedAuth = localStorage.getItem("auth");
        if (storedAuth) {
          const { usuario } = JSON.parse(storedAuth);
          if (usuario?.id_persona) {
            const response = await getPersonaById(usuario.id_persona);
            if (response?.result && response?.data) {
              setAlumno(response.data as Persona);
            }
          }
        }
      } catch (error) {
        console.error("Error al obtener el historial de matrículas", error);
        showToast("error", "No se pudo cargar el listado de matrículas.");
      } finally {
        setLoading(false);
      }
    };

    fetchMatriculas();
  }, []);

  const toggleExpand = (programaId: number) => {
    setExpandedPrograma(expandedPrograma === programaId ? null : programaId);
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center flex-col gap-3 bg-slate-50/50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm font-semibold text-slate-600 tracking-wide">
          Cargando tus expedientes de matrícula...
        </p>
      </div>
    );
  }

  if (!alumno || !alumno.matriculas || alumno.matriculas.length === 0) {
    return (
      <div className="container mx-auto p-4 max-w-5xl">
        <Card className="border-dashed border-slate-300 p-8 text-center bg-white shadow-sm">
          <BookOpen className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <CardTitle className="text-lg font-bold text-slate-700 mb-1">
            Sin Matrículas Registradas
          </CardTitle>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Actualmente no cuentas con programas académicos o matrículas
            vigentes asignadas a tu usuario.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 md:p-4 max-w-6xl space-y-4 animate-fade-in">
      {/* Encabezado de la Página */}
      <div className="space-y-1 border-b border-slate-200 pb-4">
        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <BookOpen className="h-6 w-6 text-indigo-600" />
          Mis Matrículas Académicas
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Consulta el estado de tus inscripciones, detalles de módulos y
          descarga el material o adjuntos de tus programas.
        </p>
      </div>

      {/* Listado Principal de Matrículas */}
      <div className="space-y-5">
        {alumno.matriculas.map((mat) => (
          <div
            key={mat.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
          >
            {/* Header de la Matrícula */}
            <div className="bg-slate-50/70 border-b border-slate-200 px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Landmark className="h-4.5 w-4.5 text-indigo-600 shrink-0" />
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                    {mat.institucion?.nombre ||
                      "Institución Educativa Superior"}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    Fecha Emisión:{" "}
                    {mat.fecha_matricula
                      ? format(
                          parseISO(mat.fecha_matricula),
                          "dd 'de' MMMM, yyyy",
                        )
                      : "---"}
                  </span>
                  <span className="hidden md:inline text-slate-300">|</span>
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-slate-400" />
                    Estructura: {mat.numero_modulos ?? 0} Módulos
                  </span>
                </div>
              </div>

              <Badge className="md:self-center self-start font-bold tracking-wide px-2.5 py-0.5 text-xs bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none">
                {mat.estadoMatricula?.nombre || "VIGENTE"}
              </Badge>
            </div>

            {/* Cuerpo: Programas de esta Matrícula */}
            <div className="p-4 bg-white space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600/90">
                Programas de Estudio Incluidos
              </h3>

              <div className="space-y-2.5">
                {mat.detalles?.map((detalle) => {
                  const prog = detalle.programa;
                  const isExpanded = expandedPrograma === prog?.id;

                  if (!prog) return null;

                  return (
                    <div
                      key={detalle.id}
                      className={`border rounded-lg transition-all ${
                        isExpanded
                          ? "border-indigo-200 bg-indigo-50/5 shadow-sm"
                          : "border-slate-200 bg-slate-50/30 hover:bg-slate-50/70"
                      }`}
                    >
                      {/* Fila del Programa (Trigger) */}
                      <div
                        onClick={() => toggleExpand(prog.id)}
                        className="px-4 py-3 flex items-center justify-between gap-4 cursor-pointer select-none"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] font-extrabold tracking-wider bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded uppercase">
                              {prog.tipo_programa?.nombre || "Programa"}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {prog.modalidad}
                            </span>
                          </div>
                          <h4 className="text-xs md:text-sm font-bold text-slate-800 uppercase tracking-tight">
                            {prog.titulo}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="hidden sm:inline text-[11px] font-bold text-slate-400 bg-white border px-2 py-0.5 rounded">
                            {prog.duracion}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-slate-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-slate-500" />
                          )}
                        </div>
                      </div>

                      {/* Contenido Desplegable: Archivos Adjuntos */}
                      {isExpanded && (
                        <div className="px-4 pb-3 pt-0.5 border-t border-slate-100 bg-white rounded-b-lg animate-fade-in">
                          <div className="mt-1.5 space-y-1.5">
                            <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 mb-2">
                              <FileText className="h-3.5 w-3.5 text-indigo-500" />
                              Documentos y Recursos Disponibles para Descarga:
                            </p>

                            {/* Validación de si existen adjuntos */}
                            {prog.adjuntos && prog.adjuntos.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {prog.adjuntos.map((adjunto: any) => (
                                  <div
                                    key={adjunto.id}
                                    className="flex items-center justify-between px-3 py-2 rounded-md border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                                  >
                                    <div className="flex items-center gap-2 overflow-hidden pr-2">
                                      <FileText className="h-3.5 w-3.5 text-red-500 shrink-0" />
                                      <span className="text-xs font-medium text-slate-700 truncate">
                                        {adjunto.nombre_archivo ||
                                          "Documento Adjunto sin nombre"}
                                      </span>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-[11px] font-bold text-indigo-600 border-indigo-200 bg-white hover:bg-indigo-50 hover:text-indigo-700 gap-1 px-2.5 shadow-none"
                                      onClick={() =>
                                        window.open(
                                          adjunto.ruta_enlace,
                                          "_blank",
                                        )
                                      }
                                    >
                                      <Download className="h-3 w-3" />
                                      Descargar
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-400 italic bg-slate-50 p-2.5 rounded border border-dashed border-slate-200">
                                No se han subido archivos adjuntos o sílabos
                                para este programa todavía.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
