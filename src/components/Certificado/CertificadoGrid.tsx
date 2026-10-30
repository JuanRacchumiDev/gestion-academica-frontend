import React, { JSX, useEffect, useState, useCallback } from "react";
import {
  Matricula,
  MatriculaPaginateResponse,
  PaginationType,
} from "../../interfaces/IMatricula";
import { MatriculaItem } from "./MatriculaItem";
import { Folder, Plus, ArrowLeft, Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { getCertificadosPaginate } from "../../services/certificadoService";
import {
  CertificadoFilters,
  CertificadoFiltersData,
} from "./CertificadoFilters";

export const CertificadoGrid: React.FC = () => {
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
          setMatriculas(data as Matricula[]);

          if (newPagination) {
            setPaginationInfo({
              totalPages: newPagination.totalPages || 1,
              totalItems: newPagination.totalItems || 0,
              nextPage: newPagination.nextPage,
              previousPage: newPagination.previousPage,
            });
          }
        } else {
          setMatriculas([]);
        }
      } catch (error) {
        console.error("Error al obtener matrículas", error);
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
            className={`${
              i === currentPage
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "hover:bg-slate-100 transition-colors cursor-pointer"
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      {/* Lista / Loader */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-indigo-900 animate-spin mb-2" />
          <p className="text-sm text-slate-500">
            Cargando información del servidor...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {matriculas.map((item) => (
            <MatriculaItem key={item.id} matricula={item} />
          ))}

          <div className="flex items-center justify-between px-3 pb-3">
            <div className="text-[11px] text-slate-500 font-medium">
              Mostrando{" "}
              <span className="text-slate-800 font-semibold">
                {matriculas.length}
              </span>{" "}
              registros de {paginationInfo.totalItems}
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
      )}
    </div>
  );
};
