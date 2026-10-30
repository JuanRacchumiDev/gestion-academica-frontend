import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  validarCertificadoByCodigo,
  downloadCertificadoByCodigo,
} from "@/services/certificadoService";
import { Certificado } from "@/interfaces/ICertificado";
import { formatDate } from "@/utils/dateUtils";

export const ValidarCertificadoPage: React.FC = () => {
  const { codigoQR } = useParams<{ codigoQR?: string }>();

  const [loading, setLoading] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [certificado, setCertificado] = useState<Certificado | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  //   console.log({ codigoQR });

  useEffect(() => {
    const validar = async () => {
      if (!codigoQR.trim()) {
        setLoading(false);
        setErrorMessage(
          "No se proporcionó un código de verificación en la solicitud.",
        );
        return;
      }

      setLoading(true);
      setErrorMessage(null);

      try {
        const response = await validarCertificadoByCodigo(codigoQR.trim());

        // console.log({ response });

        const { result, data } = response;

        if (result && data) {
          setCertificado(data as Certificado);
        } else {
          setErrorMessage(
            response.error ||
              response.message ||
              "El certificado consultado no es válido, no existe o ha sido dado de baja.",
          );
        }
      } catch (error: any) {
        setErrorMessage(
          "Ocurrió un error al intentar verificar el certificado.",
        );
      } finally {
        setLoading(false);
      }
    };

    validar();
  }, [codigoQR]);

  const handleDownload = async () => {
    if (!certificado || downloading) return;

    setDownloading(true);
    try {
      await downloadCertificadoByCodigo(certificado.codigo_verificacion);
    } catch (error: any) {
      alert(error.message || "Ocurrió un error al descargar el PDF.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* Cabecera Principal */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-2 bg-blue-50 rounded-full mb-3 text-blue-700">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Portal de Verificación Digital
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Plataforma de Certificación y Autenticidad Académica
          </p>
        </div>

        {/* Tarjeta Principal */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200/80">
          {/* ESTADO 1: Cargando */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-blue-200 animate-spin border-t-blue-600"></div>
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-700">
                Verificando autenticidad del certificado...
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Consultando registros oficiales
              </p>
            </div>
          )}

          {/* ESTADO 2: Certificado Inválido o Dado de baja */}
          {!loading && errorMessage && (
            <div className="p-6 sm:p-8">
              <div className="rounded-xl bg-red-50 p-5 border border-red-200">
                <div className="flex items-start">
                  <div className="shrink-0">
                    <svg
                      className="h-7 w-7 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base font-bold text-red-900">
                      Certificado No Encontrado o Inválido
                    </h3>
                    <div className="mt-1 text-sm text-red-700 leading-relaxed">
                      <p>{errorMessage}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled
                  className="w-full flex justify-center items-center px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-400 bg-slate-100 cursor-not-allowed select-none transition-all"
                >
                  <svg
                    className="w-5 h-5 mr-2 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Descargar Certificado (No Disponible)
                </button>
              </div>
            </div>
          )}

          {/* ESTADO 3: Certificado Válido */}
          {!loading && certificado && (
            <div>
              {/* Header de la tarjeta con Logo y Estado */}
              <div className="bg-slate-50 px-6 py-6 sm:px-8 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Logo de la Sucursal / Institución */}
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div>
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Sede / Institución
                    </h2>
                    <p className="text-sm font-bold text-slate-800">
                      {certificado.sucursal?.nombre || "Sede Principal"}
                    </p>
                  </div>
                </div>

                {/* Badge de Validez */}
                <div className="flex flex-col items-center sm:items-end">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                    Documento Auténtico
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 mt-1">
                    ID: {certificado.codigo_verificacion}
                  </span>
                </div>
              </div>

              {/* Contenido de los datos del Certificado */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Alumno */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Otorgado A
                  </dt>
                  <dd className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900">
                    {certificado.nombre_impresion}
                  </dd>
                </div>

                {/* Grid de Información Académica */}
                <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Programa / Curso */}
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Programa / Nombre del Curso
                    </dt>
                    <dd className="mt-1 text-base font-bold text-blue-900">
                      {certificado.programa?.titulo}
                    </dd>
                  </div>

                  {/* Tipo de Programa */}
                  <div>
                    <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Tipo de Programa
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-700 bg-slate-100/70 px-3 py-1.5 rounded-lg inline-block border border-slate-200">
                      {certificado.programa.tipo_programa?.nombre}
                    </dd>
                  </div>

                  {/* Tipo de Certificación */}
                  <div>
                    <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Tipo de Certificado
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-700 bg-slate-100/70 px-3 py-1.5 rounded-lg inline-block border border-slate-200">
                      {certificado.tipo_certificado?.nombre ||
                        "Certificado de Aprobación"}
                    </dd>
                  </div>

                  {/* Horas Académicas */}
                  <div>
                    <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Carga Horaria
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-800">
                      {certificado.programa?.horas_academicas} Horas Académicas
                    </dd>
                  </div>

                  {/* Fecha de Emisión */}
                  <div>
                    <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Fecha de Emisión
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-800">
                      {formatDate(certificado.fecha_crea)}
                    </dd>
                  </div>
                </dl>

                {/* Acción de Descargar */}
                <div className="pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full flex justify-center items-center px-4 py-3.5 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    {downloading
                      ? "Descargando Documento Oficial..."
                      : "Descargar Certificado Oficial en PDF"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} Sistema de Gestión de Certificados
          Académicos. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};
