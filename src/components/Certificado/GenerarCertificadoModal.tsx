import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Download,
  Eye,
  Loader2,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Matricula } from "../../interfaces/IMatricula";
import { Modulo } from "../../interfaces/IModulo";
import {
  Certificado,
  CertificadoResponse,
} from "../../interfaces/ICertificado";
import {
  createCertificadoModular,
  downloadCertificado,
  viewCertificado,
} from "../../services/certificadoService";

interface GenerarCertificadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  matricula: Matricula;
  modulo: Modulo | null;
}

export const GenerarCertificadoModal: React.FC<
  GenerarCertificadoModalProps
> = ({ isOpen, onClose, matricula, modulo }) => {
  const persona = matricula.persona;
  const primerDetalle = matricula.detalles?.[0];
  const programa = primerDetalle?.programa || modulo?.programa;

  // Form States
  const [nombreImpresion, setNombreImpresion] = useState("");
  const [idPlantilla] = useState<number>(1);
  const [idTipoCertificado] = useState<number>(1);

  // Status States
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certificadoGenerado, setCertificadoGenerado] =
    useState<Certificado | null>(null);

  useEffect(() => {
    if (persona) {
      const nombreCompleto =
        `${persona.nombres ?? ""} ${persona.apellido_paterno ?? ""} ${persona.apellido_materno ?? ""}`.trim();
      setNombreImpresion(persona.nombre_completo || nombreCompleto);
    }
    setCertificadoGenerado(null);
    setError(null);
  }, [persona, modulo, isOpen]);

  if (!isOpen || !modulo) return null;

  const handleGenerar = async () => {
    if (!persona?.id || !modulo.id || !programa?.id || !matricula.id_sucursal) {
      setError(
        "Faltan datos requeridos para procesar la emisión del certificado.",
      );
      return;
    }

    setLoading(true);
    setError(null);

    const payload: Certificado = {
      id_persona: persona.id,
      id_modulo: modulo.id,
      id_plantilla: idPlantilla,
      id_sucursal: matricula.id_sucursal,
      codigo_tipocertificado: idTipoCertificado,
      id_programa: programa.id,
      nombre_impresion: nombreImpresion,
    };

    try {
      const response = await createCertificadoModular(payload);

      const { result, data } = response;

      if (result && data) {
        setCertificadoGenerado(data as Certificado);
      } else {
        setError(response.message || "Error al generar el certificado.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Ocurrió un error al generar el certificado",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDescargar = async () => {
    if (!certificadoGenerado) return;
    try {
      setDownloading(true);
      await downloadCertificado(certificadoGenerado.id);
    } catch (err: any) {
      setError("Error al intentar descargar el archivo PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrevisualizar = () => {
    if (certificadoGenerado) {
      viewCertificado(certificadoGenerado.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-900 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {certificadoGenerado
                  ? "Certificado Generado"
                  : "Emitir Certificado Modular"}
              </h3>
              <p className="text-[11px] text-slate-400">
                {certificadoGenerado
                  ? "El documento está listo para descarga"
                  : "Complete los datos de emisión"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg font-medium">
              {error}
            </div>
          )}

          {!certificadoGenerado ? (
            /* --- VISTA DE FORMULARIO DE GENERACIÓN --- */
            <>
              {/* Información Contextual */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50/80 border border-slate-100 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">
                    Programa
                  </span>
                  <span className="text-slate-700 font-semibold line-clamp-1">
                    {programa?.titulo ?? "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">
                    Tipo Programa
                  </span>
                  <span className="text-slate-700 font-semibold">
                    {programa?.tipo_programa?.nombre ?? "Modular"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">
                    Módulo
                  </span>
                  <span className="text-slate-700 font-semibold line-clamp-1">
                    Módulo {modulo.orden}: {modulo.titulo}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">
                    Certificado
                  </span>
                  <span className="text-slate-700 font-semibold">
                    Modular Académico
                  </span>
                </div>
              </div>

              {/* Formulario / Edición Nombre */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Nombre de Impresión en Certificado
                </label>
                <input
                  type="text"
                  value={nombreImpresion}
                  onChange={(e) => setNombreImpresion(e.target.value)}
                  placeholder="Ej. JUAN CARLOS PÉREZ GÓMEZ"
                  disabled={loading}
                  className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-900 focus:border-indigo-900 disabled:bg-slate-100 disabled:text-slate-500 outline-none transition-all"
                />
                <p className="text-[11px] text-slate-400">
                  Verifique el nombre del participante antes de emitir.
                </p>
              </div>
            </>
          ) : (
            /* --- VISTA DE DESCARGA / ÉXITO --- */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-emerald-900">
                    Documento emitido correctamente
                  </p>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    Se generó la versión PDF firmada digitalmente con su
                    correspondiente código QR de verificación.
                  </p>
                </div>
              </div>

              {/* Tarjeta Visual de Previsualización del PDF */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-100/80 text-red-700 rounded-lg shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">
                      {certificadoGenerado.filename}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1 font-mono bg-slate-200/60 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-700">
                        <ShieldCheck className="w-3 h-3 text-indigo-700" />
                        {certificadoGenerado.codigo_verificacion}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acción Directa Previsualizar */}
                <button
                  onClick={handlePrevisualizar}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-900 hover:text-indigo-700 transition-colors shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Previsualizar
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Acciones */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-2">
          {!certificadoGenerado ? (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGenerar}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-900 hover:bg-indigo-800 disabled:opacity-50 rounded-lg shadow-sm transition-all"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {loading ? "Generando PDF..." : "Generar Certificado"}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setCertificadoGenerado(null)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                title="Volver a generar"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Re-generar
              </button>

              <button
                type="button"
                onClick={handleDescargar}
                disabled={downloading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
              >
                {downloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                {downloading ? "Descargando..." : "Descargar PDF"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
