import { GraduationCap, ShieldCheck, BookOpen } from "lucide-react";
import { LoginForm } from "../LoginForm";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 sm:p-6 lg:p-8">
      {/* Contenedor principal estilo Tarjeta Dividida (Split Screen Card) */}
      <div className="w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 border border-slate-800/20">
        {/* Columna Izquierda: Branding e Identidad de InnovaPerú */}
        <div className="md:col-span-5 bg-linear-to-br from-indigo-900 via-indigo-950 to-slate-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Círculos decorativos de fondo */}
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-indigo-600/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />

          {/* Encabezado del Branding */}
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-semibold tracking-wide text-indigo-200 uppercase">
                Portal Académico
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tight text-white">
                INNOVAPERÚ
              </h1>
              <p className="text-xs text-indigo-200/80">
                Sistema Integral de Gestión Académica
              </p>
            </div>
          </div>

          {/* Sección Informativa / Beneficios */}
          <div className="relative z-10 my-8 hidden sm:block space-y-3">
            <div className="flex items-center space-x-3 text-xs text-indigo-100/90">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Acceso seguro a matrículas y pagos</span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-indigo-100/90">
              <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Gestión de módulos y certificados</span>
            </div>
          </div>

          {/* Footer del Branding */}
          <div className="relative z-10 pt-4 border-t border-indigo-800/40">
            <p className="text-[11px] text-indigo-300/60">
              © {new Date().getFullYear()} InnovaPerú. Todos los derechos
              reservados.
            </p>
          </div>
        </div>

        {/* Columna Derecha: Formulario de Autenticación */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
          <div className="w-full max-w-sm mx-auto space-y-6">
            {/* Logo e Introducción Centrados */}
            <div className="text-center space-y-1">
              {/* Contenedor flex siempre centrado horizontalmente */}
              <div className="flex items-center justify-center mb-3">
                <img
                  src="/LOGO_INNOVAPERU2.jpeg"
                  alt="InnovaPerú"
                  className="h-22 w-60 max-w-full object-contain rounded-md mx-auto"
                />

                <span className="text-xl font-bold text-slate-900 tracking-tight md:hidden">
                  INNOVAPERÚ
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Iniciar Sesión
              </h2>
              <p className="text-xs text-slate-500">
                Ingresa tus credenciales para acceder a la plataforma.
              </p>
            </div>

            {/* Formulario */}
            <LoginForm onLoginSuccess={onLoginSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
};
