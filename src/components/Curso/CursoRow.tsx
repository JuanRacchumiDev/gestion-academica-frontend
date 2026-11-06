import { Programa } from "../../interfaces/IPrograma";
import { TableCell, TableRow } from "../ui/table";
import {
  CircleCheck,
  CircleX,
  Edit,
  MoreHorizontal,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useState } from "react";

interface Props {
  curso: Programa;
}

export const CursoRow: React.FC<Props> = ({ curso }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/curso/editar/${curso.id}`);
  };

  const actionText = curso.estado ? "Desactivar" : "Activar";
  const ActionIcon = curso.estado ? ToggleLeft : ToggleRight;
  const actionColor = curso.estado ? "text-rose-600" : "text-emerald-600";
  const hoverBgColor = curso.estado
    ? "hover:bg-rose-50"
    : "hover:bg-emerald-50";

  return (
    <TableRow className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
      <TableCell className="py-2.5 px-3 text-xs font-medium text-slate-800">
        {curso.titulo}
      </TableCell>
      <TableCell className="py-2.5 px-3 text-xs text-slate-600">
        {curso.modalidad || "Presencial"}
      </TableCell>
      <TableCell className="py-2.5 px-3 text-center">
        <div className="flex items-center justify-center">
          {curso.estado ? (
            <CircleCheck className="text-emerald-500 w-4 h-4 stroke-[2.5]" />
          ) : (
            <CircleX className="text-rose-500 w-4 h-4 stroke-[2.5]" />
          )}
        </div>
      </TableCell>
      <TableCell className="py-2.5 px-3 text-right">
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-7 w-7 p-0">
              <span className="sr-only">Acciones</span>
              <MoreHorizontal className="h-3.5 w-3.5 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-white border border-slate-200 shadow-md min-w-[140px] text-xs p-1 rounded-md"
          >
            <DropdownMenuLabel className="font-medium text-slate-400 px-2 py-1 text-[10px] uppercase tracking-wider">
              Acciones
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem
              onClick={handleEdit}
              className="cursor-pointer py-1.5 px-2 flex items-center gap-2 text-slate-700"
            >
              <Edit className="h-3.5 w-3.5 text-slate-400" />
              <span>Editar curso</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem
              onClick={() => setIsDropdownOpen(false)}
              className={`cursor-pointer py-1.5 px-2 flex items-center gap-2 font-medium ${actionColor} ${hoverBgColor}`}
            >
              <ActionIcon className="h-3.5 w-3.5" />
              <span>{actionText}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
