import { JSX, useCallback, useEffect, useState } from "react";
import { getModulosPaginate } from "../../services/moduloService";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ModuloRow } from "./ModuloRow";
import { TableSpinner } from "../../components/Common/TableSpinner";
import { Modulo, PaginationType } from "@/interfaces/IModulo";

export const ModuloTable = () => {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    currentPage: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
    nextPage: null,
    previousPage: null,
  });

  // console.log({ pagination });

  const [isLoading, setIsLoading] = useState(true);

  const handlePageChange = (page: number) => {
    // console.log("---- page handlePageChange ----");
    // console.log({ page });

    const validatePage = page > 0 && page <= pagination.totalPages;

    // console.log({ validatePage });

    if (validatePage) {
      setPagination((prev) => ({ ...prev, currentPage: page }));
    }
  };

  const fetchData = useCallback(async () => {
    // setIsLoading(true);
    const { currentPage, limit } = pagination;

    // console.log({ currentPage });

    // console.log({ limit });

    const filters = {};

    // console.log({ filters });

    try {
      const response = await getModulosPaginate(currentPage, limit, filters);

      const { result, data, pagination: newPagination } = response;

      if (result && data) {
        const dataModulos = data as Modulo[];
        setModulos(dataModulos);

        if (newPagination) {
          setPagination(newPagination);
        }
      } else {
        setModulos([]);
        setPagination({
          currentPage: 1,
          limit: 10,
          totalPages: 1,
          totalItems: 0,
          nextPage: null,
          previousPage: null,
        });
      }
    } catch (error) {
      console.error("Error al obtener módulos", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, pagination.limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderPaginationItems = (): JSX.Element[] => {
    const items: JSX.Element[] = [];
    const startPage = Math.max(1, pagination.currentPage - 2);
    const endPage = Math.min(pagination.totalPages, pagination.currentPage + 2);

    if (startPage > 1) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={i === pagination.currentPage}
            className={`
                  ${
                    i === pagination.currentPage
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-200 transition-colors"
                  }
                `}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    if (endPage < pagination.totalPages) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }
    return items;
  };

  return (
    <div className="w-full space-y-4 pt-4">
      <div className="flex justify-end items-center space-x-2 pb-4"></div>
      <div className="rounded-md border border-gray-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="text-gray-600 font-medium">
                # Orden
              </TableHead>
              <TableHead className="text-gray-600 font-medium">
                Título
              </TableHead>
              <TableHead className="text-gray-600 font-medium">
                Programa
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
              <TableSpinner colSpan={5} />
            ) : modulos.length > 0 ? (
              modulos.map((modulo) => (
                <ModuloRow
                  key={modulo.id}
                  modulo={modulo}
                  //   onStatusChange={handleDocumentoStatusChange}
                />
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-gray-500 py-6"
                >
                  No se encontraron módulos registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex justify-end">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                className="hover:bg-gray-200 transition-colors"
              >
                Anterior
              </PaginationPrevious>
            </PaginationItem>

            {renderPaginationItems()}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                className="hover:bg-gray-200 transition-colors"
              >
                Siguiente
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};
