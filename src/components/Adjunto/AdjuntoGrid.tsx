import { JSX, useCallback, useEffect, useState } from "react";
import { getAdjuntosPaginate } from "../../services/adjuntoService";
import { AdjuntoFilters, AdjuntoFiltersData } from "./AdjuntoFilters";
import { AdjuntoItem } from "./AdjuntoItem";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { Adjunto, PaginationType } from "@/interfaces/IAdjunto";

export const AdjuntoGrid = () => {
  const [adjuntos, setAdjuntos] = useState<Adjunto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(8);

  const [paginationInfo, setPaginationInfo] = useState<
    Omit<PaginationType, "currentPage" | "limit">
  >({
    totalPages: 1,
    totalItems: 0,
    nextPage: null,
    previousPage: null,
  });

  const [searchFilters, setSearchFilters] = useState<AdjuntoFiltersData>({
    codigoTipoPrograma: "",
    fechaInicio: "",
    fechaFinal: "",
    search: "",
  });

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= paginationInfo.totalPages) {
      setCurrentPage(page);
    }
  };

  const fetchData = useCallback(
    async (pageToFetch: number, filtersData: AdjuntoFiltersData) => {
      setIsLoading(true);

      const filters = {
        codigo_tipoprograma: filtersData.codigoTipoPrograma,
        search: filtersData.search,
        fecha_inicio: filtersData.fechaInicio,
        fecha_final: filtersData.fechaFinal,
      };

      try {
        const response = await getAdjuntosPaginate(pageToFetch, limit, filters);

        const { result, data, pagination: newPagination } = response;

        if (result && data) {
          setAdjuntos(data as Adjunto[]);

          if (newPagination) {
            setPaginationInfo({
              totalPages: newPagination.totalPages || 1,
              totalItems: newPagination.totalItems || 0,
              nextPage: newPagination.nextPage,
              previousPage: newPagination.previousPage,
            });
          }
        } else {
          setAdjuntos([]);
        }
      } catch (error) {
        console.error("Error al obtener adjuntos", error);
      } finally {
        setIsLoading(false);
      }
    },
    [limit],
  );

  useEffect(() => {
    fetchData(currentPage, searchFilters);
  }, [currentPage, searchFilters, fetchData]);

  const handleSearchSubmit = (newFilters: AdjuntoFiltersData) => {
    setSearchFilters(newFilters);
    setCurrentPage(1);
  };

  const handleRefreshGrid = () => {
    fetchData(currentPage, searchFilters);
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
        <AdjuntoFilters onSearch={handleSearchSubmit} />

        <div className="pt-3 border-t border-slate-100">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-2">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600"></div>
              <span className="text-[11px] text-slate-400 font-medium">
                Cargando archivos...
              </span>
            </div>
          ) : adjuntos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-start px-3">
              {adjuntos.map((adjunto) => (
                <AdjuntoItem
                  key={adjunto.id}
                  adjunto={adjunto}
                  onDeleteSuccess={handleRefreshGrid}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl h-48 bg-slate-50/50 border border-dashed border-slate-200">
              <div className="text-center space-y-1 max-w-sm px-4">
                <span className="text-xs font-medium text-slate-600 block">
                  No se encontraron registros
                </span>
                <p className="text-[11px] text-slate-400">
                  Aún no hay archivos registrados en esta categoría o los
                  filtros aplicados no arrojaron resultados.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-3 pb-3">
        <div className="text-[11px] text-slate-500 font-medium">
          Mostrando{" "}
          <span className="text-slate-800 font-semibold">
            {adjuntos.length}
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
