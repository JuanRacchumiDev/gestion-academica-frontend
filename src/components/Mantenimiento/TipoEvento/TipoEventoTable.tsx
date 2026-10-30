import { useCallback, useEffect, useState } from "react";
// import { getDetalle } from "../../../services/detalleParametroService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { TipoEventoRow } from "./TipoEventoRow";
import { TableSpinner } from "../../../components/Common/TableSpinner";
import { DetalleParametro } from "@/interfaces/IDetalleParametro";

export const TipoEventoTable: React.FC = () => {
  const [tipoEventos, setTipoEventos] = useState<DetalleParametro[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // const response = await getDetalle("tipo-evento");
      const response = { result: null, data: null };

      // console.log("response tipoEventos", response);

      const { result, data } = response;

      if (result && data) {
        const dataTipoEventos = data as DetalleParametro[];
        setTipoEventos(dataTipoEventos);
      } else {
        setTipoEventos([]);
      }
    } catch (error) {
      console.error("Error al obtener tipo de eventos", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="w-full space-y-4 pt-4">
      <div className="flex justify-end items-center space-x-2 pb-4"></div>
      <div className="rounded-md border border-gray-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="text-gray-600 font-medium">
                Nombre
              </TableHead>
              <TableHead className="text-gray-600 font-medium">
                Descripción
              </TableHead>
              <TableHead className="text-gray-600 font-medium">
                Estado
              </TableHead>
              <TableHead className="text-gray-600 font-medium">
                Opciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSpinner colSpan={4} />
            ) : tipoEventos.length > 0 ? (
              tipoEventos.map((tipoEvento) => (
                <TipoEventoRow
                  key={tipoEvento.codigo}
                  tipoEvento={tipoEvento}
                  //   onStatusChange={handleDocumentoStatusChange}
                />
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-gray-500 py-6"
                >
                  No se encontraron tipo de eventos registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
