import React, { useMemo, useState } from "react";
import { getAuthData } from "@/utils/authMemo";
import { ADMIN_MENU_ITEMS, ALUMNO_MENU_ITEMS } from "@/utils/menuItems";
import { ChevronDown, Zap } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

interface SidebarProps {
  collapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(["mantenimiento"]),
  );
  const location = useLocation();

  const toggleExpanded = (itemid: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemid)) {
        next.delete(itemid);
      } else {
        next.add(itemid);
      }
      return next;
    });
  };

  const userProfile = useMemo(() => getAuthData()?.usuario, []);

  const filteredMenuItems = useMemo(() => {
    if (!userProfile) return [];
    const { nombre_perfil } = userProfile;

    switch (nombre_perfil?.toLowerCase()) {
      case "administrador":
        return ADMIN_MENU_ITEMS;
      case "alumno":
        return ALUMNO_MENU_ITEMS;
      default:
        return [];
    }
  }, [userProfile]);

  const panelSubtitle = useMemo(() => {
    if (!userProfile) return "Panel";
    return userProfile.nombre_perfil?.toLowerCase() === "administrador"
      ? "Admin Panel"
      : "Portal Alumno";
  }, [userProfile]);

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-64"
      } transition-all duration-300 ease-in-out bg-white border-r border-slate-200/80 shadow-sm flex flex-col relative z-20 h-screen select-none`}
    >
      {/* Encabezado / Logo */}
      <div className="p-4 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div
          className={`flex items-center ${collapsed ? "justify-center" : "space-x-3"}`}
        >
          <div className="w-10 h-10 bg-linear-to-br from-indigo-600 to-indigo-800 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-bold text-slate-900 leading-tight truncate tracking-tight">
                SIST. ACADÉMICO
              </h1>
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider truncate">
                {panelSubtitle}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isParentActive =
            item.submenu?.some((sub) =>
              location.pathname.startsWith(sub.path),
            ) ?? false;
          const isDirectActive = item.path
            ? location.pathname === item.path ||
              location.pathname.startsWith(item.path)
            : false;

          return (
            <div key={item.id} className="relative group">
              {item.path ? (
                /* Opción Simple con Ruta */
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `w-full flex items-center ${
                      collapsed ? "justify-center px-0" : "justify-between px-3"
                    } py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-indigo-900 text-white shadow-sm shadow-indigo-900/30"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center space-x-3 min-w-0">
                        <Icon
                          className={`w-5 h-5 shrink-0 transition-colors ${
                            isActive
                              ? "text-white"
                              : "text-slate-500 group-hover:text-indigo-900"
                          }`}
                        />
                        {!collapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>

                      {/* Tooltip cuando está colapsado */}
                      {collapsed && (
                        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-md whitespace-nowrap shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                          {item.label}
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              ) : (
                /* Opción Contenedora con Submenú */
                <>
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className={`w-full flex items-center ${
                      collapsed ? "justify-center px-0" : "justify-between px-3"
                    } py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isParentActive || expandedItems.has(item.id)
                        ? "bg-indigo-50/70 text-indigo-900"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <Icon
                        className={`w-5 h-5 shrink-0 transition-colors ${
                          isParentActive
                            ? "text-indigo-900"
                            : "text-slate-500 group-hover:text-indigo-900"
                        }`}
                      />
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>

                    {!collapsed && item.submenu && (
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          expandedItems.has(item.id) ? "rotate-180" : ""
                        }`}
                      />
                    )}

                    {/* Tooltip para menú colapsado con submenú */}
                    {collapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-md whitespace-nowrap shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                        {item.label}
                      </div>
                    )}
                  </button>

                  {/* Submenú Desplegable */}
                  {!collapsed && item.submenu && expandedItems.has(item.id) && (
                    <div className="ml-4 mt-1 pl-3 border-l-2 border-slate-200 space-y-1">
                      {item.submenu.map((subitem) => {
                        const SubIcon = subitem.icon;
                        return (
                          <NavLink
                            key={subitem.id}
                            to={subitem.path}
                            className={({ isActive }) =>
                              `flex items-center space-x-2.5 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                                isActive
                                  ? "bg-indigo-900 text-white font-semibold shadow-xs"
                                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                              }`
                            }
                          >
                            {({ isActive }) => (
                              <>
                                {SubIcon && (
                                  <SubIcon
                                    className={`w-4 h-4 shrink-0 ${
                                      isActive ? "text-white" : "text-slate-400"
                                    }`}
                                  />
                                )}
                                <span className="truncate">
                                  {subitem.label}
                                </span>
                              </>
                            )}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </nav>

      {/* Perfil del Usuario al Pie */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white hover:shadow-xs transition-all duration-200 cursor-pointer border border-transparent hover:border-slate-200/60">
            <div className="w-9 h-9 rounded-full bg-indigo-900 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {userProfile?.nombre_completo
                ? userProfile.nombre_completo.charAt(0)
                : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">
                {userProfile?.nombre_completo || "Usuario"}
              </p>
              <p className="text-[10px] text-slate-500 font-medium truncate capitalize">
                {userProfile?.nombre_perfil || "Perfil"}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
