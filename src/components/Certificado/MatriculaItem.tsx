import React, { useState } from "react";
import { Matricula } from "../../interfaces/IMatricula";
import { Modulo } from "../../interfaces/IModulo";
import { ModuloCard } from "./ModuloCard";
import { GenerarCertificadoModal } from "./GenerarCertificadoModal";
import { ChevronDown, ChevronUp, GraduationCap } from "lucide-react";
import { padString } from "@/utils/stringUtils";

interface MatriculaItemProps {
  matricula: Matricula;
}

export const MatriculaItem: React.FC<MatriculaItemProps> = ({ matricula }) => {
  const [isOpen, setIsOpen] = useState(true);

  // Estado para controlar la apertura del modal y el módulo seleccionado
  const [selectedModulo, setSelectedModulo] = useState<Modulo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extraer información relevante
  const persona = matricula.persona;
  const nombreCompleto = persona
    ? `${persona.nombres ?? ""} ${persona.apellido_paterno ?? ""} ${persona.apellido_materno ?? ""}`.trim()
    : "Estudiante no registrado";

  // Obtenemos el programa del primer detalle de matrícula
  const primerDetalle = matricula.detalles?.[0];
  const programa = primerDetalle?.programa;
  const modulos: Modulo[] = programa?.detalle_modulos ?? [];

  // Cálculo del progreso según pagos
  const totalModulos = modulos.length || matricula.numero_modulos || 1;
  const modulosPagadosCount =
    matricula.pago_modulos?.filter((p) => p.estado).length ?? 0;
  const porcentaje = Math.min(
    Math.round((modulosPagadosCount / totalModulos) * 100),
    100,
  );

  const handleOpenCertificadoModal = (modulo: Modulo) => {
    setSelectedModulo(modulo);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl mb-4 shadow-sm overflow-hidden transition-all">
      {/* Resumen */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-start sm:items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="mt-1 sm:mt-0 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/60 transition-colors"
          >
            {isOpen ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded">
                Matrícula ref: #{padString(4, matricula.id, "left")}
              </span>
              <h3 className="text-base font-bold text-slate-800">
                {nombreCompleto}
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                DNI: {persona?.numero_documento ?? "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Progreso */}
        <div className="w-full md:w-72 space-y-1.5 pl-8 md:pl-0">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-600">Certificación: {porcentaje}%</span>
            <span className="text-slate-400">
              ({modulosPagadosCount} de {totalModulos} módulos)
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-900 h-full rounded-full transition-all duration-500"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>
      </div>

      {/* Detalle Desplegable */}
      {isOpen && (
        <div className="p-4 sm:p-6 bg-white space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-900" />
              <span className="text-sm font-semibold">
                Programa: {programa?.titulo ?? "Programa General"}
              </span>
            </div>
            {programa?.tipo_programa?.nombre && (
              <span className="text-[10px] uppercase tracking-wider font-bold bg-indigo-50 text-indigo-900 border border-indigo-200 px-2 py-0.5 rounded">
                {programa.tipo_programa.nombre}
              </span>
            )}
          </div>

          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-2">
            Certificados Modulares Disponibles
          </h4>

          {modulos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modulos.map((modulo) => (
                <ModuloCard
                  key={modulo.id ?? modulo.orden}
                  modulo={modulo}
                  matricula={matricula}
                  onGenerarCertificado={handleOpenCertificadoModal}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No hay módulos asignados a este programa.
            </p>
          )}
        </div>
      )}

      {/* Modal de emisión de certificado */}
      <GenerarCertificadoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        matricula={matricula}
        modulo={selectedModulo}
      />
    </div>
  );
};
