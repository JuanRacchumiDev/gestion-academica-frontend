import React, { useState, useEffect } from "react";
import { Persona } from "../../interfaces/IPersona";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../../context/ToastContext";
import { Spinner } from "../Common/Spinner";
import { X, UserPlus, Trash2, CheckCircle2, Search } from "lucide-react";
import {
  getPersonasPaginate,
  vincularHijosPersona,
} from "../../services/personaService"; // <--- Importado el servicio
import { ParametroClase } from "@/params/parametroClase";
import { DetalleParametro } from "@/interfaces/IDetalleParametro";
import { getDetalles } from "@/services/detalleParametroService";

interface VinculaParienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  apoderado: Persona;
}

interface HijoVinculado {
  id: number;
  nombreCompleto: string;
  numeroDocumento: string;
  parentesco: string; // Guarda el código numérico como string
}

const loadParentescos = async (): Promise<DetalleParametro[]> => {
  let dataParentesco: DetalleParametro[] = [];
  const queryParams = `parametro_clase=${ParametroClase.PARENTESCO}&en_persona=false&en_empresa=false&estado=true`;
  const response = await getDetalles(queryParams);
  const { result, data } = response;
  if (result && data) {
    dataParentesco = data as DetalleParametro[];
  }
  return dataParentesco;
};

export const VinculaParienteModal: React.FC<VinculaParienteModalProps> = ({
  isOpen,
  onClose,
  apoderado,
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [alumnosDisponibles, setAlumnosDisponibles] = useState<Persona[]>([]);
  const [parentescos, setParentescos] = useState<DetalleParametro[]>([]);
  const [hijosSeleccionados, setHijosSeleccionados] = useState<HijoVinculado[]>(
    [],
  );
  const [isLoadingAlumnos, setIsLoadingAlumnos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar catálogos de parentescos al montar el modal
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const listParentescos = await loadParentescos();
        if (!isMounted) return;
        setParentescos(listParentescos);
      } catch (error) {
        console.error("Error al obtener datos", error);
        showToast("error", "Error al cargar los parentescos.");
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  // Cargar lista de alumnos para vincular
  useEffect(() => {
    if (!isOpen) return;

    const fetchAlumnos = async () => {
      setIsLoadingAlumnos(true);
      try {
        const filters = {
          parametro_clase: ParametroClase.GRUPO,
          search: searchTerm,
          id_parentesco: null,
          codigo_tipo_parentesco: null,
        };
        const response = await getPersonasPaginate(
          1,
          20,
          "grupo-alumno",
          filters,
        );
        if (response.result && response.data) {
          setAlumnosDisponibles(response.data as Persona[]);
        }
      } catch (error) {
        console.error("Error al buscar alumnos", error);
        showToast("error", "Error al cargar la lista de alumnos.");
      } finally {
        setIsLoadingAlumnos(false);
      }
    };

    const timer = setTimeout(() => {
      fetchAlumnos();
    }, 300);

    return () => clearTimeout(timer);
  }, [isOpen, searchTerm, showToast]);

  if (!isOpen) return null;

  const handleAgregarHijo = (alumno: Persona) => {
    if (hijosSeleccionados.some((h) => h.id === alumno.id)) {
      showToast(
        "warning",
        "Este alumno ya se encuentra en la lista de vinculación.",
      );
      return;
    }

    const defaultParentesco =
      parentescos.length > 0 ? String(parentescos[0].codigo) : "";

    setHijosSeleccionados((prev) => [
      ...prev,
      {
        id: alumno.id!,
        nombreCompleto: alumno.nombre_completo,
        numeroDocumento: alumno.numero_documento,
        parentesco: defaultParentesco,
      },
    ]);
  };

  const handleQuitarHijo = (id: number) => {
    setHijosSeleccionados((prev) => prev.filter((h) => h.id !== id));
  };

  const handleParentescoChange = (id: number, nuevoParentesco: string) => {
    setHijosSeleccionados((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, parentesco: nuevoParentesco } : h,
      ),
    );
  };

  const handleGuardarVinculacion = async () => {
    if (hijosSeleccionados.length === 0) {
      showToast(
        "warning",
        "Debe seleccionar al menos un alumno para vincular.",
      );
      return;
    }

    if (!apoderado.id) {
      showToast("error", "No se encontró el ID del apoderado.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Preparamos el payload exacto para la API
      const payload = {
        hijos: hijosSeleccionados.map((h) => ({
          id_alumno: h.id,
          codigo_tipo_parentesco: Number(h.parentesco),
        })),
      };

      const response = await vincularHijosPersona(apoderado.id, payload);
      const { result, message } = response;

      if (result) {
        showToast(
          "success",
          message || "Hijos vinculados exitosamente al apoderado.",
        );
        onClose();
      } else {
        showToast("error", message || "Error al registrar la vinculación.");
      }
    } catch (error) {
      console.error("Error al vincular hijos", error);
      showToast("error", "Error de conexión al intentar vincular los hijos.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera del Modal */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Vincular Hijos / Alumnos
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Apoderado:{" "}
              <span className="text-slate-700 font-semibold">
                {apoderado.nombre_completo}
              </span>
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 h-8 w-8 p-0 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Contenido del Modal */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Buscador de Alumnos */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Buscar Alumno por Nombre o DNI
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Escriba el nombre del alumno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs border-slate-200 bg-white"
              />
            </div>
          </div>

          {/* Lista de Alumnos Encontrados */}
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
            <div className="bg-slate-100 px-4 py-2 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Resultados de Búsqueda
            </div>
            <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 bg-white">
              {isLoadingAlumnos ? (
                <div className="p-6 flex justify-center">
                  <Spinner className="h-6 w-6 text-blue-600 animate-spin" />
                </div>
              ) : alumnosDisponibles.length > 0 ? (
                alumnosDisponibles.map((alumno) => {
                  const yaSeleccionado = hijosSeleccionados.some(
                    (h) => h.id === alumno.id,
                  );
                  return (
                    <div
                      key={alumno.id}
                      className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">
                          {alumno.nombre_completo}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          DNI: {alumno.numero_documento}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        disabled={yaSeleccionado}
                        onClick={() => handleAgregarHijo(alumno)}
                        className={`h-7 px-2.5 text-xs ${
                          yaSeleccionado
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 cursor-default"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {yaSeleccionado ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />{" "}
                            Vinculado
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-3.5 w-3.5 mr-1" /> Agregar
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  No se encontraron alumnos disponibles.
                </div>
              )}
            </div>
          </div>

          {/* Tabla de Hijos Seleccionados */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Hijos Seleccionados ({hijosSeleccionados.length})
            </label>
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
              {hijosSeleccionados.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {hijosSeleccionados.map((hijo) => (
                    <div
                      key={hijo.id}
                      className="p-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1">
                        <p className="font-bold text-slate-800">
                          {hijo.nombreCompleto}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          DNI: {hijo.numeroDocumento}
                        </p>
                      </div>

                      <div className="w-40">
                        <select
                          value={hijo.parentesco}
                          onChange={(e) =>
                            handleParentescoChange(hijo.id, e.target.value)
                          }
                          className="w-full h-8 text-xs border border-slate-200 rounded-md bg-white px-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {parentescos.map((item) => {
                            const valorCodigo = String(item.codigo);
                            const textoDescripcion =
                              item.descripcion ?? item.nombre;
                            return (
                              <option key={valorCodigo} value={valorCodigo}>
                                {textoDescripcion}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuitarHijo(hijo.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Quitar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg m-2">
                  No hay hijos agregados en la lista de vinculación.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pie del Modal */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-3.5 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onClose}
            className="border-slate-200 text-slate-700 hover:bg-slate-100 h-9 text-xs font-semibold"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || hijosSeleccionados.length === 0}
            onClick={handleGuardarVinculacion}
            className="bg-blue-600 hover:bg-blue-700 text-white h-9 text-xs font-semibold min-w-[120px]"
          >
            {isSubmitting ? (
              <Spinner className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
};
