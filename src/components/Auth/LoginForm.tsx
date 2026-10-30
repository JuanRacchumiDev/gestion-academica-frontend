import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { loginAuth } from "../../services/authService";
import { useToast } from "../../context/ToastContext";
import { TAuthResponse } from "../../types/TAuthResponse";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const validateForm = () => {
    if (!email.trim() || !password.trim()) {
      showToast("error", "Email y contraseña son requeridos");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("error", "Por favor ingrese un correo electrónico válido");
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      let redirectDashboard: string = "";
      const response = await loginAuth(email, password);
      const { result, status, message, data } = response as TAuthResponse;
      const messageStr = message as string;

      if (result && status === 200) {
        const { nombre_perfil } = data;
        if (nombre_perfil === "alumno") {
          redirectDashboard = "/dashboard-alumno";
        } else if (nombre_perfil === "administrador") {
          redirectDashboard = "/dashboard";
        } else {
          redirectDashboard = "/dashboard";
        }

        showToast("success", messageStr);
        onLoginSuccess();
        navigate(redirectDashboard);
        return;
      }
      showToast("error", messageStr);
    } catch (error) {
      console.error("error", error);
      showToast("error", "Error de conexión o credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {/* Campo: Correo Electrónico */}
      <div>
        <label
          htmlFor="email"
          className="block text-xs font-semibold text-slate-700 mb-1.5"
        >
          Correo Electrónico
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-xs"
            placeholder="usuario@innovaperu.edu.pe"
            autoComplete="off"
            required
          />
        </div>
      </div>

      {/* Campo: Contraseña */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-slate-700"
          >
            Contraseña
          </label>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              showToast(
                "info",
                "Contacte al administrador para restablecer su clave.",
              );
            }}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-9 pr-10 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-xs"
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Botón de Submit */}
      <button
        type="submit"
        className="w-full py-2.5 mt-2 font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm shadow-indigo-200 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Autenticando...</span>
          </>
        ) : (
          <span>Iniciar Sesión</span>
        )}
      </button>
    </form>
  );
};
