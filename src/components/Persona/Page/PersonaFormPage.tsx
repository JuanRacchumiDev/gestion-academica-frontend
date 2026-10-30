import { useParams } from "react-router-dom";
import { PersonaForm } from "../PersonaForm";

export const PersonaFormPage = () => {
  const { nombreGrupo } = useParams<{ nombreGrupo: string }>();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 animate-in fade-in duration-300">
      <PersonaForm nombreGrupo={nombreGrupo} />
    </div>
  );
};
