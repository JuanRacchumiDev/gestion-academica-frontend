import { ChevronDown, Menu, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { logoutAuth } from "../../services/authService";
import { getAuthData } from "../../utils/authMemo";
import { useMemo } from "react";

export const Header = ({ sidebarCollapsed, onToggleSidebar }) => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const userProfile = useMemo(() => getAuthData()?.usuario, []);

  const handleLogout = async () => {
    if (userProfile?.id) {
      // console.log(userProfile?.id);
      const response = await logoutAuth(userProfile.id);
      const { result, message } = response;
      const classResult = result ? "success" : "error";
      showToast(classResult, message as string);
      // window.location.href = "/";
      if (result) {
        navigate("/");
      }
    } else {
      showToast("error", "Error al cerrar sesión de usuario");
    }
  };

  return (
    <div className="bg-white px-6 py-5 border-b border-gray-200 shadow-sm z-10 sticky top-0">
      <div className="flex items-center justify-between h-8">
        {/* Botón de Menú (Toggle Sidebar) */}
        <div className="flex items-center space-x-4">
          <button
            className={`p-2 rounded-full transition-all duration-200 
                ${
                  // Estilo si el sidebar está colapsado (para enfatizar el botón)
                  sidebarCollapsed
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                    : // Estilo si el sidebar está expandido
                      "text-gray-600 hover:bg-gray-100"
                }
            `}
            onClick={onToggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Dropdown de Usuario */}
        <div className="flex items-center space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-3 pl-3 border-l border-gray-200 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-semibold text-gray-800">
                    {userProfile?.nombre_completo || "Usuario"}
                  </p>
                  <p className="text-xs text-blue-600 font-medium">
                    {userProfile?.nombre_perfil || "PERFIL"}
                  </p>
                </div>
                {/* Icono Avatar/Iniciales */}
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {userProfile?.nombre_completo
                    ? userProfile.nombre_completo.charAt(0)
                    : "U"}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-60 bg-white shadow-xl border border-gray-100" // Fondo blanco y sombra limpia
              align="end"
            >
              {/* Estilo Label: Usando el degradado para el título del menú */}
              <DropdownMenuLabel className="p-3 bg-linear-to-r from-blue-600 to-indigo-700 text-white rounded-t-md">
                Mi Cuenta
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="border-gray-200 my-1" />

              {/* Ítem Perfil */}
              <DropdownMenuItem
                asChild
                // Hover: Usamos el hover azul corporativo
                className="cursor-pointer text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <Link to="/profile" className="flex items-center p-2">
                  <User className="mr-2 h-4 w-4 text-blue-500" />
                  <span>Perfil</span>
                </Link>
              </DropdownMenuItem>

              {/* Separador antes de cerrar sesión */}
              <DropdownMenuSeparator className="border-gray-200 my-1" />

              {/* Ítem Cerrar Sesión */}
              <DropdownMenuItem
                onClick={handleLogout}
                // Estilo Cerrar Sesión: Destacado en rojo con hover azul sutil
                className="text-red-500 cursor-pointer hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
