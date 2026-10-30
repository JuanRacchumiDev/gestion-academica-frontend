import React, { useState } from "react";
import { Certificado } from "@/interfaces/ICertificado";
import {
  downloadCertificadoByCodigo,
  downloadCertificado,
} from "@/services/certificadoService";
import { useToast } from "@/context/ToastContext";
import {
  Award,
  Calendar,
  Download,
  Loader2,
  QrCode,
  GraduationCap,
  FileCheck,
} from "lucide-react";

export interface ListarCertificadosProps {
  certificados: Certificado[];
  loading?: boolean;
}

export const ListarCertificados: React.FC<ListarCertificadosProps> = ({
  certificados,
  loading = false,
}) => {
  const [downloadingId, setDownloadingId] = useState<number | string | null>(
    null,
  );
  const { showToast } = useToast();

  const handleDownload = async (cert: Certificado) => {
    const certIdentifier = cert.codigo_verificacion || cert.id;
    setDownloadingId(certIdentifier);

    try {
      if (cert.codigo_verificacion) {
        await downloadCertificadoByCodigo(cert.codigo_verificacion);
      } else if (cert.id) {
        await downloadCertificado(cert.id);
      } else {
        throw new Error("Sin identificador válido para descarga.");
      }
      showToast("success", "Certificado descargado correctamente.");
    } catch (error) {
      console.error("Error al descargar el certificado:", error);
      showToast("error", "No se pudo descargar el archivo PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4"
          >
            <div className="h-6 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-10 bg-slate-200 rounded w-full mt-4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!certificados || certificados.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-slate-300 text-center shadow-sm">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
          <Award className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">
          No hay certificados disponibles
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mt-1">
          Aún no tienes certificados emitidos a tu nombre. Completa tus
          programas de estudio para obtenerlos.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {certificados.map((cert) => {
        const isDownloading =
          downloadingId === (cert.codigo_verificacion || cert.id);
        const tituloPrograma = cert.programa?.titulo;
        const fechaEmision = cert.fecha_crea;

        return (
          <div
            key={cert.id || cert.codigo_verificacion}
            className="group relative bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Oficial
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                  <QrCode className="w-3 h-3 text-slate-400 mr-1" />
                  {cert.codigo_verificacion || `#${cert.id}`}
                </span>
              </div>

              {/* Título */}
              <h3 className="font-semibold text-slate-900 text-base line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                {tituloPrograma}
              </h3>

              {/* Metadatos */}
              {fechaEmision && (
                <div className="flex items-center text-xs text-slate-500 mb-4">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  Emitido: {fechaEmision}
                </div>
              )}
            </div>

            {/* Footer / Action */}
            <div className="pt-4 border-t border-slate-100 mt-2">
              <button
                onClick={() => handleDownload(cert)}
                disabled={isDownloading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Descargando...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Descargar PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
