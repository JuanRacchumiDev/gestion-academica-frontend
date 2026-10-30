import { Usuario } from "../../interfaces/IUsuario";
import { TableCell, TableRow } from "../ui/table";
import { CircleCheck, CircleX, Edit, MoreHorizontal } from "lucide-react";
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
  usuario: Usuario;
  onStatusChange?: (UsuarioId: number) => void;
}

export const UsuarioRow: React.FC<Props> = ({ usuario }) => {
  // console.log({ usuario });

  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleShowDetail = () => {
    navigate(`/usuario/editar/${usuario.id}`);
  };

  return (
    <>
      <TableRow
        key={usuario.id}
        className="hover:bg-slate-50/80 hover:cursor-pointer transition-colors duration-150 border-b border-slate-100"
      >
        <TableCell className="py-2 px-3 text-xs font-medium text-slate-500">
          {usuario.name ?? "--"}
        </TableCell>

        <TableCell className="py-2 px-3 text-xs font-medium text-slate-500">
          {usuario.email ?? "--"}
        </TableCell>
        <TableCell className="py-2 px-3 text-xs font-medium text-slate-500">
          {usuario.perfil.nombre ?? "--"}
        </TableCell>

        <TableCell className="py-2 px-3 text-xs font-medium text-slate-500">
          {usuario.persona?.nombre_completo}
        </TableCell>

        <TableCell className="py-2 px-3 text-center">
          <div className="flex items-center justify-center">
            {usuario.estado ? (
              <CircleCheck className="text-emerald-500 w-4 h-4 stroke-[2.5]" />
            ) : (
              <CircleX className="text-rose-500 w-4 h-4 stroke-[2.5]" />
            )}
          </div>
        </TableCell>
        <TableCell className="py-2 px-3 text-right">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-7 w-7 p-0 focus-visible:ring-1 focus-visible:ring-slate-400 focus-visible:ring-offset-0"
              >
                <span className="sr-only">Abrir menú de acciones</span>
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
                onClick={handleShowDetail}
                className="cursor-pointer hover:bg-slate-50 rounded-sm py-1 px-2 flex items-center gap-2 text-slate-700"
              >
                <Edit className="h-3.5 w-3.5 text-slate-400" />
                <span>Ver/Editar detalle</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    </>
  );
};
