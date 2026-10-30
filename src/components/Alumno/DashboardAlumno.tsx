import React, { useEffect, useState } from "react";
import { Persona } from "@/interfaces/IPersona";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GraduationCap, Award, User, Loader2, Paperclip } from "lucide-react";
import { ListarMatriculas } from "./ListarMatriculas";
import { ListarCertificados } from "./ListarCertificados";
import { getPersonaById } from "../../services/personaService";
import { useToast } from "../../context/ToastContext";

const loadPersona = async () => {
  let persona: Persona = null;
  const storedAuth = localStorage.getItem("auth");

  if (storedAuth) {
    const authData = JSON.parse(storedAuth);
    const { usuario } = authData;
    const { id_persona } = usuario;

    if (id_persona) {
      const response = await getPersonaById(id_persona);
      const { result, data } = response;
      if (result && data) {
        persona = data as Persona;
      }
    }
    return persona;
  }
};

export const DashboardAlumno: React.FC = () => {
  const [alumno, setAlumno] = useState<Persona | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dataAlumno] = await Promise.all([loadPersona()]);
        setAlumno(dataAlumno);
      } catch (error) {
        console.error("Error al cargar los catálogos formulario", error);
        showToast("error", "Error al cargar los catálogos del formulario.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center flex-col gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-500">
          Cargando tu espacio académico...
        </p>
      </div>
    );
  }

  if (!alumno) {
    return (
      <Card className="border-dashed border-red-200 p-6 text-center text-red-500 bg-red-50/50">
        No se pudo recuperar la información de la sesión. Por favor, vuelve a
        iniciar sesión.
      </Card>
    );
  }

  return (
    <div className="container mx-auto space-y-4 p-2 md:py-4 max-w-7xl">
      <Card className="border-slate-200 bg-slate-900 text-white shadow-lg overflow-hidden">
        <CardContent className="px-6 flex flex-col md:flex-row items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-indigo-400 shadow-md">
            <AvatarImage src={alumno?.foto} alt={alumno?.nombre_completo} />
            <AvatarFallback className="bg-indigo-600 text-lg font-bold">
              {alumno?.nombres?.[0]}
              {alumno?.apellido_paterno?.[0]}
            </AvatarFallback>
          </Avatar>

          {/* Reducido space-y-2 a space-y-0.5 */}
          <div className="space-y-0.5 text-center md:text-left flex-1">
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
              ¡Bienvenido, {alumno?.nombres}!
            </h1>
            <p className="text-slate-400 text-xs md:text-sm font-medium flex items-center justify-center md:justify-start gap-2">
              <User className="h-3.5 w-3.5 text-indigo-400" />
              {alumno?.tipo_documento?.nombre}: {alumno?.numero_documento} |{" "}
              {alumno?.email}
            </p>
          </div>

          {/* Reducido p-4 a py-2 px-4 */}
          <div className="flex gap-4 bg-slate-800/50 py-2 px-4 rounded-xl border border-slate-700 w-full md:w-auto justify-around">
            <div className="text-center px-2">
              <span className="block text-xl font-black text-indigo-400">
                {alumno.matriculas?.length ?? 0}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Matrículas
              </span>
            </div>
            <div className="w-px bg-slate-700 h-8 my-auto" />
            <div className="text-center px-2">
              <span className="block text-xl font-black text-emerald-400">
                {alumno.certificados?.length ?? 0}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Certificados
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reducido space-y-6 a space-y-4 */}
      <Tabs defaultValue="academico" className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md bg-slate-100 p-1 rounded-xl">
          <TabsTrigger
            value="academico"
            className="rounded-lg font-bold flex items-center gap-2 text-sm py-1.5"
          >
            <Paperclip className="h-4 w-4" />{" "}
            {/* Cambiado alternativamente si no compila o usando GraduationCap */}
            <GraduationCap className="h-4 w-4" />
            Historial Académico
          </TabsTrigger>
          <TabsTrigger
            value="certificados"
            className="rounded-lg font-bold flex items-center gap-2 text-sm py-1.5"
          >
            <Award className="h-4 w-4" />
            Mis Certificados
          </TabsTrigger>
        </TabsList>

        {/* Reducido space-y-4 a space-y-2 */}
        <TabsContent value="academico" className="space-y-2 outline-none">
          <ListarMatriculas matriculas={alumno.matriculas} />
        </TabsContent>

        <TabsContent value="certificados" className="space-y-2 outline-none">
          <ListarCertificados certificados={alumno.certificados} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
