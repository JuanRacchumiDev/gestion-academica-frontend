import React, { useEffect, useState } from "react";
import { ListarCertificados } from "../ListarCertificados";
import { Certificado } from "@/interfaces/ICertificado";
import { getCertificadosPaginate } from "@/services/certificadoService";
import { useToast } from "@/context/ToastContext";
import { FileCheck, Loader2 } from "lucide-react";

export const MisCertificadosListPage: React.FC = () => {
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchCertificados = async () => {
      try {
        const storedAuth = localStorage.getItem("auth");
        if (storedAuth) {
          const { usuario } = JSON.parse(storedAuth);
          if (usuario?.id_persona) {
            const page = 1;
            const limit = 20;
            const filters = { id_persona: usuario.id_persona };

            const response = await getCertificadosPaginate(
              page,
              limit,
              filters,
            );

            if (response?.result && Array.isArray(response?.data)) {
              setCertificados(response.data);
            }
          }
        }
      } catch (error) {
        console.error("Error al obtener el listado de certificados:", error);
        showToast("error", "No se pudo cargar el listado de certificados.");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificados();
  }, [showToast]);

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Cabecera Académica */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <FileCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Mis Certificados
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Consulta y descarga tus acreditaciones académicas digitales y
                constancias obtenidas.
              </p>
            </div>
          </div>

          {!loading && (
            <div className="flex items-center gap-2 self-start md:self-auto bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600">
              <span>Total emitidos:</span>
              <span className="bg-white px-2 py-0.5 rounded shadow-xs text-blue-600 font-bold">
                {certificados.length}
              </span>
            </div>
          )}
        </div>

        {/* Contenedor Principal */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 bg-white rounded-xl border border-slate-200">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
              <p className="text-sm font-medium text-slate-500">
                Cargando tus documentos...
              </p>
            </div>
          ) : (
            <ListarCertificados certificados={certificados} loading={false} />
          )}
        </div>
      </div>
    </div>
  );
};
