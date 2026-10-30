import { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { CategoriaEventoRow } from "./CategoriaEventoRow";
import { TableSpinner } from "../../../components/Common/TableSpinner";
import { DetalleParametro } from "@/interfaces/IDetalleParametro";

export const CategoriaEventoTable: React.FC = () => {
  const [categoriaEventos, setCategoriaEventos] = useState<DetalleParametro[]>(
    [],
  );

  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = {
        result: null,
        data: null,
      };

      // console.log("response categoriaEventos", response);

      const { result, data } = response;

      if (result && data) {
        const dataCategoriaEventos = data as DetalleParametro[];
        setCategoriaEventos(dataCategoriaEventos);
      } else {
        setCategoriaEventos([]);
      }
    } catch (error) {
      console.error("Error al obtener categoría de eventos", error);
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
            ) : categoriaEventos.length > 0 ? (
              categoriaEventos.map((categoriaEvento) => (
                <CategoriaEventoRow
                  key={categoriaEvento.codigo}
                  categoriaEvento={categoriaEvento}
                />
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-gray-500 py-6"
                >
                  No se encontraron categoría de eventos registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
