import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PagoForm } from "../PagoForm";
import { Matricula } from "../../../interfaces/IMatricula";
import { useToast } from "../../../context/ToastContext";
import { getMatriculaById } from "../../../services/matriculaService";

export const PagoFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [matricula, setMatricula] = useState<Matricula | null>(null);

  useEffect(() => {
    const fetchMatriculaData = async () => {
      if (!id) return;

      try {
        const response = await getMatriculaById(+id);
        // console.log({ response });

        const { result, data } = response;

        if (result && data) {
          setMatricula(data as Matricula);
        } else {
          showToast(
            "error",
            response.message ||
              "No se pudo cargar la información de la matrícula.",
          );
          navigate("/matriculas");
        }
      } catch (error) {
        console.error("Error al recuperar la matrícula:", error);
        showToast(
          "error",
          "Error de conexión al obtener datos del estudiante.",
        );
        navigate("/matriculas");
      }
    };

    fetchMatriculaData();
  }, [id, navigate, showToast]);

  if (!matricula) return null;

  return (
    <div className="container mx-auto py-8 px-4">
      <PagoForm
        matriculaSeleccionada={matricula}
        idSucursal={matricula.id_sucursal ?? 0}
        onCancel={() => navigate("/matricula")}
      />
    </div>
  );
};
