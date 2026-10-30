import { JSX, useCallback, useEffect, useState } from "react";
import { getCertificadosPaginate } from "../../services/certificadoService";
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
import { CertificadoRow } from "./CertificadoRow";
import { TableSpinner } from "../../components/Common/TableSpinner";
import { Certificado, PaginationType } from "@/interfaces/ICertificado";
import {
  CertificadoFilters,
  CertificadoFiltersData,
} from "./CertificadoFilters";

export const CertificadoTable = () => {
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  const [paginationInfo, setPaginationInfo] = useState<
    Omit<PaginationType, "currentPage" | "limit">
  >({
    totalPages: 1,
    totalItems: 0,
    nextPage: null,
    previousPage: null,
  });

  const [searchFilters, setSearchFilters] = useState<CertificadoFiltersData>({
    id_sucursal: "",
    id_institucion: "",
    id_programa: "",
    search: "",
  });

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= paginationInfo.totalPages) {
      setCurrentPage(page);
    }
  };

  const fetchData = useCallback(
    async (pageToFetch: number, filtersData: CertificadoFiltersData) => {
      setIsLoading(true);

      const filters = {
        id_sucursal: filtersData.id_sucursal,
        id_institucion: filtersData.id_institucion,
        id_programa: filtersData.id_programa,
        search: filtersData.search,
      };

      try {
        const response = await getCertificadosPaginate(
          pageToFetch,
          limit,
          filters,
        );

        const { result, data, pagination: newPagination } = response;

        if (result && data) {
          setCertificados(data as Certificado[]);

          if (newPagination) {
            setPaginationInfo({
              totalPages: newPagination.totalPages || 1,
              totalItems: newPagination.totalItems || 0,
              nextPage: newPagination.nextPage,
              previousPage: newPagination.previousPage,
            });
          }
        } else {
          setCertificados([]);
        }
      } catch (error) {
        console.error("Error al obtener certificados", error);
      } finally {
        setIsLoading(false);
      }
    },
    [limit],
  );

  useEffect(() => {
    fetchData(currentPage, searchFilters);
  }, [currentPage, searchFilters, fetchData]);

  const handleSearchSubmit = (newFilters: CertificadoFiltersData) => {
    setSearchFilters(newFilters);
    setCurrentPage(1);
  };

  const renderPaginationItems = (): JSX.Element[] => {
    const items: JSX.Element[] = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(paginationInfo.totalPages, currentPage + 2);

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
            isActive={i === currentPage}
            className={`h-7 w-7 text-xs rounded-md font-medium cursor-pointer ${
              i === currentPage
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "hover:bg-slate-100 text-slate-600 transition-colors"
            }`}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    if (endPage < paginationInfo.totalPages) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }
    return items;
  };

  return (
    <div className="w-full space-y-3">
      <div className="bg-white overflow-hidden">
        <CertificadoFilters onSearch={handleSearchSubmit} />

        <div className="w-full overflow-x-hidden border-t border-slate-100">
          <Table className="w-full table-fixed text-left border-collapse">
            <TableHeader>
              <TableRow className="bg-slate-50/75 hover:bg-slate-50/75 border-b border-slate-200">
                <TableHead className="w-[7%] py-2.5 px-2 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                  ID
                </TableHead>
                <TableHead className="w-[20%] py-2.5 px-2 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                  Alumno
                </TableHead>
                <TableHead className="w-[15%] py-2.5 px-2 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                  Institución
                </TableHead>
                <TableHead className="w-[15%] py-2.5 px-2 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                  Tipo Programa
                </TableHead>
                <TableHead className="w-[15%] py-2.5 px-2 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                  Programa
                </TableHead>
                <TableHead className="w-[10%] py-2.5 px-2 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                  Fecha
                </TableHead>
                <TableHead className="w-[4%] py-2.5 px-1 text-slate-500 font-medium text-[11px] uppercase tracking-wider text-center">
                  Est.
                </TableHead>
                <TableHead className="w-[4%] py-2.5 px-1 text-slate-500 font-medium text-[11px] uppercase tracking-wider text-right">
                  Acc.
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableSpinner colSpan={8} />
              ) : certificados.length > 0 ? (
                certificados.map((certificado) => (
                  <CertificadoRow
                    key={certificado.id}
                    certificado={certificado}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-1">
                      <span className="text-xs font-medium text-slate-600">
                        No se encontraron registros
                      </span>
                      <p className="text-[11px]">
                        Intenta ajustar los filtros de búsqueda
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between px-3 pb-3">
        <div className="text-[11px] text-slate-500 font-medium">
          Mostrando{" "}
          <span className="text-slate-800 font-semibold">
            {certificados.length}
          </span>{" "}
          de{" "}
          <span className="text-slate-800 font-semibold">
            {paginationInfo.totalItems}
          </span>{" "}
          registros
        </div>

        <Pagination className="justify-end w-auto m-0">
          <PaginationContent className="gap-0.5">
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                className={`h-7 px-2 text-xs rounded-md border border-slate-200 text-slate-600 cursor-pointer transition-colors hover:bg-slate-50 hover:text-slate-900 ${
                  currentPage === 1 ? "pointer-events-none opacity-30" : ""
                }`}
              />
            </PaginationItem>

            {renderPaginationItems()}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                className={`h-7 px-2 text-xs rounded-md border border-slate-200 text-slate-600 cursor-pointer transition-colors hover:bg-slate-50 hover:text-slate-900 ${
                  currentPage === paginationInfo.totalPages
                    ? "pointer-events-none opacity-30"
                    : ""
                }`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};
