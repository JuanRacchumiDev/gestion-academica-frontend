import { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "./components/Layout/Sidebar";
import { Header } from "./components/Layout/Header";
import { LoginPage } from "./components/Auth/Page/LoginPage";
import { NotFoundPage } from "./components/Layout/NotFoundPage";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { PersonaListPage } from "./components/Persona/Page/PersonaListPage";
import { PersonaFormPage } from "./components/Persona/Page/PersonaFormPage";
import { EventoListPage } from "./components/Evento/Page/EventoListPage";
import { EventoFormPage } from "./components/Evento/Page/EventoFormPage";
import { ProgramaListPage } from "./components/Programa/Page/ProgramaListPage";
import { ProgramaFormPage } from "./components/Programa/Page/ProgramaFormPage";
import { ModuloListPage } from "./components/Modulo/Page/ModuloListPage";
import { ModuloFormPage } from "./components/Modulo/Page/ModuloFormPage";
import { MatriculaListPage } from "./components/Matricula/Page/MatriculaListPage";
import { MatriculaFormPage } from "./components/Matricula/Page/MatriculaFormPage";
import { PagoListPage } from "./components/Pago/Page/PagoListPage";
import { PagoFormPage } from "./components/Pago/Page/PagoFormPage";
import { AdjuntoListPage } from "./components/Adjunto/Page/AdjuntoListPage";
import { AdjuntoFormPage } from "./components/Adjunto/Page/AdjuntoFormPage";
import { UsuarioListPage } from "./components/Usuario/Page/UsuarioListPage";
import { UsuarioFormPage } from "./components/Usuario/Page/UsuarioFormPage";
import { DashboardAlumno } from "./components/Alumno/DashboardAlumno";
import { MisMatriculasListPage } from "./components/Alumno/Page/MisMatriculasListPage";
import { CertificadoListPage } from "./components/Certificado/Page/CertificadoListPage";
import { CertificadoFormPage } from "./components/Certificado/Page/CertificadoFormPage";
import { ValidarCertificadoPage } from "./components/Certificado/Page/ValidarCertificadoPage";
import { MisCertificadosListPage } from "./components/Alumno/Page/MisCertificadosListPage";
import { PlantillaListPage } from "./components/Plantilla/Page/PlantillaListPage";
import { PlantillaFormPage } from "./components/Plantilla/Page/PlantillaFormPage";
import { MantenimientoPage } from "./components/Mantenimiento/MantenimientoPage";
import { CursoListPage } from "./components/Curso/Page/CursoListPage";
import { CursoFormPage } from "./components/Curso/Page/CursoFormPage";

function App() {
  const [sideBarCollapsed, setSideBarCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Definición de rutas públicas
  const isValidarCertificadoRoute = location.pathname.startsWith(
    "/validar-certificado/",
  );
  const isLoginPage =
    location.pathname === "/login" || location.pathname === "/";

  const handleLogin = (isSuccess: boolean) => {
    setIsLoggedIn(isSuccess);
  };

  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      setIsLoggedIn(true);
    } else if (!isLoginPage && !isValidarCertificadoRoute) {
      navigate("/login");
    }
  }, [isLoginPage, isValidarCertificadoRoute, navigate]);

  // Si se accede a la ruta pública de validación de certificado, renderiza únicamente la página sin layout protegido
  if (isValidarCertificadoRoute) {
    return (
      <Routes>
        <Route
          path="/validar-certificado/:codigoQR"
          element={<ValidarCertificadoPage />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    );
  }

  return (
    <div
      className={`min-h-screen ${isLoginPage ? "bg-slate-50 flex items-center justify-center" : "bg-slate-100"}`}
    >
      <div className="flex h-screen overflow-hidden w-full max-w-full">
        {!isLoginPage && isLoggedIn && <Sidebar collapsed={sideBarCollapsed} />}

        <div
          className={`flex-1 flex flex-col overflow-hidden ${isLoginPage ? "h-auto" : "h-screen"}`}
        >
          {!isLoginPage && isLoggedIn && (
            <Header
              sidebarCollapsed={sideBarCollapsed}
              onToggleSidebar={() => setSideBarCollapsed(!sideBarCollapsed)}
            />
          )}

          <main className="flex-1 overflow-y-auto bg-transparent">
            <div
              className={
                isLoginPage
                  ? "p-0 h-full flex items-center justify-center"
                  : "p-4 space-y-4"
              }
            >
              <Routes>
                <Route
                  path="/"
                  element={
                    <LoginPage onLoginSuccess={() => handleLogin(true)} />
                  }
                />
                <Route
                  path="/login"
                  element={
                    <LoginPage onLoginSuccess={() => handleLogin(true)} />
                  }
                />

                {isLoggedIn ? (
                  <>
                    <Route path="/dashboard" element={<Dashboard />} />

                    <Route
                      path="/personas/:nombreGrupo"
                      element={<PersonaListPage />}
                    />
                    <Route
                      path="/personas/:nombreGrupo/nuevo"
                      element={<PersonaFormPage />}
                    />
                    <Route
                      path="/personas/:nombreGrupo/editar/:id"
                      element={<PersonaFormPage />}
                    />

                    <Route path="/evento" element={<EventoListPage />} />
                    <Route path="/evento/nuevo" element={<EventoFormPage />} />
                    <Route
                      path="/evento/editar/:id"
                      element={<EventoFormPage />}
                    />

                    <Route
                      path="/programa-academico"
                      element={<ProgramaListPage />}
                    />
                    <Route
                      path="/programa-academico/nuevo"
                      element={<ProgramaFormPage />}
                    />
                    <Route
                      path="/programa-academico/editar/:id"
                      element={<ProgramaFormPage />}
                    />

                    <Route path="/curso" element={<CursoListPage />} />
                    <Route path="/curso/nuevo" element={<CursoFormPage />} />
                    <Route
                      path="/curso/editar/:id"
                      element={<CursoFormPage />}
                    />

                    <Route path="/modulo" element={<ModuloListPage />} />
                    <Route path="/modulo/nuevo" element={<ModuloFormPage />} />
                    <Route
                      path="/modulo/editar/:id"
                      element={<ModuloFormPage />}
                    />

                    <Route path="/matricula" element={<MatriculaListPage />} />
                    <Route
                      path="/matricula/nuevo"
                      element={<MatriculaFormPage />}
                    />
                    <Route
                      path="/matricula/editar/:id"
                      element={<MatriculaFormPage />}
                    />
                    <Route
                      path="/matricula/:id/pago-modulo"
                      element={<PagoFormPage />}
                    />

                    <Route path="/pago" element={<PagoListPage />} />

                    <Route path="/adjunto" element={<AdjuntoListPage />} />
                    <Route
                      path="/adjunto/nuevo"
                      element={<AdjuntoFormPage />}
                    />
                    <Route
                      path="/adjunto/editar/:id"
                      element={<AdjuntoFormPage />}
                    />

                    <Route path="/usuario" element={<UsuarioListPage />} />
                    <Route
                      path="/usuario/nuevo"
                      element={<UsuarioFormPage />}
                    />
                    <Route
                      path="/usuario/editar/:id"
                      element={<UsuarioFormPage />}
                    />

                    <Route
                      path="/certificado"
                      element={<CertificadoListPage />}
                    />
                    <Route
                      path="/certificado/nuevo"
                      element={<CertificadoFormPage />}
                    />
                    <Route
                      path="/certificado/editar/:id"
                      element={<CertificadoFormPage />}
                    />

                    <Route path="/plantilla" element={<PlantillaListPage />} />
                    <Route
                      path="/plantilla/nuevo"
                      element={<PlantillaFormPage />}
                    />
                    <Route
                      path="/plantilla/editar/:id"
                      element={<PlantillaFormPage />}
                    />

                    <Route
                      path="/mantenimiento/*"
                      element={<MantenimientoPage />}
                    />

                    <Route
                      path="/dashboard-alumno"
                      element={<DashboardAlumno />}
                    />
                    <Route
                      path="/mis-matriculas"
                      element={<MisMatriculasListPage />}
                    />
                    <Route
                      path="/mis-certificados"
                      element={<MisCertificadosListPage />}
                    />
                  </>
                ) : (
                  <Route
                    path="*"
                    element={
                      <LoginPage onLoginSuccess={() => handleLogin(true)} />
                    }
                  />
                )}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
export default App;
