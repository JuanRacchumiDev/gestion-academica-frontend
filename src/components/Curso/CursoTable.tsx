import { JSX, useCallback, useEffect, useState } from "react";
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
import { CursoRow } from "./CursoRow";
import { TableSpinner } from "../../components/Common/TableSpinner";
import { Programa } from "@/interfaces/IPrograma";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { getProgramasPaginate } from "@/services/programaService";

export const CursoTable: React.FC = () => {
  const navigate = useNavigate();
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  const [paginationInfo, setPaginationInfo] = useState({
    totalPages: 1,
    totalItems: 0,
    nextPage: null as number | null,
    previousPage: null as number | null,
  });

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= paginationInfo.totalPages) {
      setCurrentPage(page);
    }
  };

  const fetchData = useCallback(
    async (pageToFetch: number) => {
      setIsLoading(true);
      const filters = {};

      try {
        const response = await getProgramasPaginate(
          pageToFetch,
          limit,
          filters,
        );

        const { result, data, pagination: newPagination } = response;

        if (result && data) {
          setProgramas(data as Programa[]);
          if (newPagination) {
            setPaginationInfo({
              totalPages: newPagination.totalPages || 1,
              totalItems: newPagination.totalItems || 0,
              nextPage: newPagination.nextPage,
              previousPage: newPagination.previousPage,
            });
          }
        } else {
          setProgramas([]);
        }
      } catch (error) {
        console.error("Error al obtener cursos", error);
      } finally {
        setIsLoading(false);
      }
    },
    [limit],
  );

  //   const fetchCursos = useCallback(
  //     async (page: number) => {
  //       setIsLoading(true);
  //       try {
  //         // Simulación de llamada a servicio (reemplazar con tu getCursosPaginate)
  //         // const response = await getCursosPaginate(page, limit);
  //         // Mock temporal de respuesta:
  //         setProgramas([
  //           {
  //             id: 1,
  //             sigla: "MAT-101",
  //             titulo: "Álgebra I",
  //             creditos: 4,
  //             modalidad: "PRESENCIAL",
  //             estado: true,
  //           },
  //           {
  //             id: 2,
  //             sigla: "COM-102",
  //             titulo: "Comunicación y Lenguaje",
  //             creditos: 3,
  //             modalidad: "PRESENCIAL",
  //             estado: true,
  //           },
  //         ]);
  //         setPaginationInfo({
  //           totalPages: 1,
  //           totalItems: 2,
  //           nextPage: null,
  //           previousPage: null,
  //         });
  //       } catch (error) {
  //         console.error("Error al obtener cursos", error);
  //       } finally {
  //         setIsLoading(false);
  //       }
  //     },
  //     [limit],
  //   );

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, fetchData]);

  //   useEffect(() => {
  //     fetchCursos(currentPage);
  //   }, [currentPage, fetchCursos]);

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
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Gestión de Cursos
          </h2>
          <p className="text-xs text-slate-500">
            Administra los cursos de la institución educativa
          </p>
        </div>
        <Button
          onClick={() => navigate("/curso/nuevo")}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 font-semibold"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Nuevo Curso
        </Button>
      </div>

      <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-slate-100">
        <div className="w-full overflow-x-auto">
          <Table className="w-full table-auto text-left border-collapse">
            <TableHeader>
              <TableRow className="bg-slate-50/75 hover:bg-slate-50/75 border-b border-slate-200">
                <TableHead className="w-[35%] py-2.5 px-3 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                  Título del Curso
                </TableHead>
                <TableHead className="w-[15%] py-2.5 px-3 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                  Modalidad
                </TableHead>
                <TableHead className="w-[12%] py-2.5 px-3 text-slate-500 font-medium text-[11px] uppercase tracking-wider text-center">
                  Estado
                </TableHead>
                <TableHead className="w-[11%] py-2.5 px-3 text-slate-500 font-medium text-[11px] uppercase tracking-wider text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableSpinner colSpan={4} />
              ) : programas.length > 0 ? (
                programas.map((programa) => (
                  <CursoRow key={programa.id} curso={programa} />
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-xs text-slate-400"
                  >
                    No se encontraron cursos registrados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Sección inferior de paginación integrada */}
      <div className="flex items-center justify-between px-3 pb-3">
        <div className="text-[11px] text-slate-500 font-medium">
          Mostrando{" "}
          <span className="text-slate-800 font-semibold">
            {programas.length}
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
