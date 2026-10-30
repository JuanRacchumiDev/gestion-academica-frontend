import { DetalleParametro } from "../../../interfaces/IDetalleParametro";
import { TableCell, TableRow } from "../../ui/table";
import {
  AlertTriangle,
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
} from "../../ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import { useToast } from "../../../context/ToastContext";
// import { ConfirmDialog } from "../../Common/ConfirmDialog";
import { useState } from "react";
import { ConfirmDialog } from "@/components/Common/ConfirmDialog";

interface Props {
  categoriaEvento: DetalleParametro;
  onStatusChange?: (categoriaEventoId: number) => void;
}

export const CategoriaEventoRow: React.FC<Props> = ({ categoriaEvento }) => {
  const { showToast } = useToast();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // ⬅️ Estado para el modal
  const [isProcessing, setIsProcessing] = useState(false); // ⬅️ Estado para el loading

  const navigate = useNavigate();

  const nuevoEstado = !categoriaEvento.estado;
  const action = nuevoEstado ? "activar" : "desactivar";
  const modalTitle = `${
    action.charAt(0).toUpperCase() + action.slice(1)
  } Empresa`;
  const modalMessage = `¿Deseas <strong>${action}</strong> la categoría de evento: <strong>${categoriaEvento.nombre}</strong>?`;

  // console.log({ categoriaEvento });

  const handleShowDetail = () => {
    navigate(
      `/mantenimiento/categoria-evento/editar/${categoriaEvento.codigo}`,
    );
  };

  // Abre el modal
  const handleOpenStatusModal = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsDropdownOpen(false);
    setIsModalOpen(true);
  };

  // Cierra el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirmStatus = async () => {
    setIsProcessing(true);

    try {
      //   const payload: categoriaEvento = {
      //     estado: nuevoEstado,
      //   };

      //   const response = await updateDocumentoTipoContByEstado(
      //     categoriaEvento.id,
      //     payload
      //   );

      //   const response = null;

      //   const { result, data, message, error } =
      //     response as categoriaEventoResponse;

      //   if (result && data) {
      //     showToast(
      //       "success",
      //       message || "Estado del documento actualizado con éxito."
      //     );

      //     // Si hay una función de callback, llamarla para actualizar la tabla padre
      //     if (onStatusChange) {
      //       onStatusChange(categoriaEvento.id);
      //     }
      //   } else {
      //     showToast("error", error || "Error al actualizar el categoriaEvento.");
      //   }

      showToast("error", "Error de conexión al intentar actualizar.");
    } catch (error) {
      console.error("Error en la actualización de estado:", error);
      showToast("error", "Error de conexión al intentar actualizar.");
    } finally {
      setIsProcessing(false); // Desactiva el loading
      handleCloseModal(); // Cierra el modal
    }
  };

  // Determinar texto y color de acción
  const actionText = categoriaEvento.estado ? "Desactivar" : "Activar";
  const ActionIcon = categoriaEvento.estado ? ToggleLeft : ToggleRight;
  const actionColor = categoriaEvento.estado
    ? "text-red-600"
    : "text-green-600";
  const hoverBgColor = categoriaEvento.estado
    ? "hover:bg-red-100"
    : "hover:bg-green-100";

  return (
    <>
      <TableRow
        key={categoriaEvento.codigo}
        className="hover:bg-blue-100 hover:cursor-pointer transition-colors duration-200"
      >
        <TableCell className="py-3">{categoriaEvento.nombre}</TableCell>
        <TableCell className="py-3">{categoriaEvento.descripcion}</TableCell>
        <TableCell className="py-3">
          {categoriaEvento.estado ? (
            <CircleCheck className="text-green-500 w-5 h-5" />
          ) : (
            <CircleX className="text-red-500 w-5 h-5" />
          )}
        </TableCell>
        <TableCell className="py-3">
          {/* w-72 border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 */}
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger
              asChild
              className="focus:outline-none focus:ring-2 z-40 focus:ring-gray-400 focus:border-transparent transition duration-300 cursor-pointer"
              // className="bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition duration-300 cursor-pointer"
            >
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú de acciones</span>
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="bg-white border shadow-lg"
            >
              <DropdownMenuLabel className="font-semibold text-gray-700">
                Acciones
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleShowDetail}
                className="cursor-pointer hover:bg-gray-100 transition-colors flex items-center space-x-2 text-blue-600"
              >
                <Edit className="h-4 w-4" />
                <span>Ver/Editar Detalle</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleOpenStatusModal}
                className={`cursor-pointer ${hoverBgColor} transition-colors flex items-center space-x-2 ${actionColor}`}
              >
                <ActionIcon className="h-4 w-4" />
                <span>{actionText} Categoría Evento</span>
              </DropdownMenuItem>

              {/* <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 transition-colors">
              Eliminar
            </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <ConfirmDialog
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmStatus}
        title={modalTitle}
        message={<span dangerouslySetInnerHTML={{ __html: modalMessage }} />}
        confirmText={actionText}
        isProcessing={isProcessing}
        icon={
          <AlertTriangle
            className={
              categoriaEvento.estado ? "text-red-500" : "text-green-500"
            }
          />
        }
      />
    </>
  );
};
