import { Route, Routes } from "react-router-dom";
import { SegmentoList } from "./Segmento/SegmentoList";
import { SegmentoForm } from "./Segmento/SegmentoForm";
import { TipoCertificadoList } from "./TipoCertificado/TipoCertificadoList";
import { TipoCertificadoForm } from "./TipoCertificado/TipoCertificadoForm";
import { SedeList } from "./Sede/SedeList";
import { SedeForm } from "./Sede/SedeForm";
import { InstitucionList } from "./Institucion/InstitucionList";
import { InstitucionForm } from "./Institucion/InstitucionForm";
import { PeriodoAcademicoList } from "./PeriodoAcademico/PeriodoAcademicoList";
import { PeriodoAcademicoForm } from "./PeriodoAcademico/PeriodoAcademicoForm";
import { PeriodoEvaluacionList } from "./PeriodoEvaluacion/PeriodoEvaluacionList";
import { PeriodoEvaluacionForm } from "./PeriodoEvaluacion/PeriodoEvaluacionForm";
import { GradoAcademicoList } from "./GradoAcademico/GradoAcademicoList";
import { ParentescoList } from "./Parentesco/ParentescoList";
import { GradoAcademicoForm } from "./GradoAcademico/GradoAcademicoForm";

export const MantenimientoPage = () => {
  return (
    <div>
      <Routes>
        <Route path="/tipo-certificado" element={<TipoCertificadoList />} />
        <Route
          path="/tipo-certificado/nuevo"
          element={<TipoCertificadoForm />}
        />
        <Route
          path="/tipo-certificado/editar/:id"
          element={<TipoCertificadoForm />}
        />

        <Route path="/sede" element={<SedeList />} />
        <Route path="/sede/nuevo" element={<SedeForm />} />
        <Route path="/sede/editar/:id" element={<SedeForm />} />

        <Route path="/segmento" element={<SegmentoList />} />
        <Route path="/segmento/nuevo" element={<SegmentoForm />} />
        <Route path="/segmento/editar/:id" element={<SegmentoForm />} />

        <Route path="/institucion" element={<InstitucionList />} />
        <Route path="/institucion/nuevo" element={<InstitucionForm />} />
        <Route path="/institucion/editar/:id" element={<InstitucionForm />} />

        <Route path="/periodo-academico" element={<PeriodoAcademicoList />} />
        <Route
          path="/periodo-academico/nuevo"
          element={<PeriodoAcademicoForm />}
        />
        <Route
          path="/periodo-academico/editar/:id"
          element={<PeriodoAcademicoForm />}
        />

        <Route
          path="/periodo-evaluacion"
          element={<PeriodoEvaluacionList />}
        ></Route>
        <Route
          path="/periodo-evaluacion/nuevo"
          element={<PeriodoEvaluacionForm />}
        />
        <Route
          path="/periodo-evaluacion/editar/:id"
          element={<PeriodoEvaluacionForm />}
        />

        <Route path="/grado-academico" element={<GradoAcademicoList />}></Route>
        <Route path="/grado-academico/nuevo" element={<GradoAcademicoForm />} />
        <Route
          path="/grado-academico/editar/:id"
          element={<GradoAcademicoForm />}
        />

        <Route path="/parentesco" element={<ParentescoList />}></Route>
      </Routes>
    </div>
  );
};
