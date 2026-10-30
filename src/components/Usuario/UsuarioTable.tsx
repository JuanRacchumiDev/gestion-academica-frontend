import { JSX, useCallback, useEffect, useState } from "react";
import { getUsuariosPaginate } from "../../services/usuarioService";
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
import { UsuarioRow } from "./UsuarioRow";
import { TableSpinner } from "../../components/Common/TableSpinner";
import { Usuario, PaginationType } from "@/interfaces/IUsuario";
import { UsuarioFilters, UsuarioFiltersData } from "./UsuarioFilters";
import { getDetalles } from "../../services/detalleParametroService";
import {
  DetalleParametro,
  DetalleParametroFilters,
} from "@/interfaces/IDetalleParametro";
import { ParametroClase } from "@/params/parametroClase";

const loadPerfiles = async () => {
  // Definiendo perfiles
  let listPerfiles: DetalleParametro[] = [];

  const queryParams = `parametro_clase=${ParametroClase.PERFIL}&en_persona=false&en_empresa=false&estado=true`;

  const responsePerfiles = await getDetalles(queryParams);

  const { result: resultPerfiles, data: dataPerfiles } = responsePerfiles;

  if (resultPerfiles && dataPerfiles) {
    listPerfiles = dataPerfiles as DetalleParametro[];
  }

  return listPerfiles;
};

export const UsuarioTable = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [perfiles, setPerfiles] = useState<DetalleParametro[]>([]);

  const [paginationInfo, setPaginationInfo] = useState<
    Omit<PaginationType, "currentPage" | "limit">
  >({
    totalPages: 1,
    totalItems: 0,
    nextPage: null,
    previousPage: null,
  });

  const [searchFilters, setSearchFilters] = useState<UsuarioFiltersData>({
    email: "",
    codigo_perfil: "",
  });

  useEffect(() => {
    const loadCatalogos = async () => {
      const dataPerfiles = await loadPerfiles();
      setPerfiles(dataPerfiles);
    };
    loadCatalogos();
  }, []);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= paginationInfo.totalPages) {
      setCurrentPage(page);
    }
  };

  const fetchData = useCallback(
    async (pageToFetch: number, filtersData: UsuarioFiltersData) => {
      setIsLoading(true);

      const filters = {
        email: filtersData.email,
        codigo_perfil: filtersData.codigo_perfil,
      };

      try {
        const response = await getUsuariosPaginate(pageToFetch, limit, filters);

        const { result, data, pagination: newPagination } = response;

        if (result && data) {
          setUsuarios(data as Usuario[]);

          if (newPagination) {
            setPaginationInfo({
              totalPages: newPagination.totalPages || 1,
              totalItems: newPagination.totalItems || 0,
              nextPage: newPagination.nextPage,
              previousPage: newPagination.previousPage,
            });
          }
        } else {
          setUsuarios([]);
        }
      } catch (error) {
        console.error("Error al obtener usuarios", error);
      } finally {
        setIsLoading(false);
      }
    },
    [limit],
  );

  useEffect(() => {
    fetchData(currentPage, searchFilters);
  }, [currentPage, searchFilters, fetchData]);

  const handleSearchSubmit = (newFilters: UsuarioFiltersData) => {
    setSearchFilters(newFilters);
    setCurrentPage(1); // Resetear a la primera página al filtrar
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
        <UsuarioFilters onSearch={handleSearchSubmit} perfiles={perfiles} />

        <div className="overflow-x-auto border-t border-slate-100">
          <Table className="w-full text-left border-collapse">
            <TableHeader>
              <TableRow className="bg-slate-50/75 hover:bg-slate-50/75 border-b border-slate-200">
                <TableHead className="w-[12%] py-2.5 px-3 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                  Nombre de usuario
                </TableHead>
                <TableHead className="w-[12%] py-2.5 px-3 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                  Email
                </TableHead>
                <TableHead className="w-[25%] py-2.5 px-3 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                  Perfil
                </TableHead>
                <TableHead className="w-[10%] py-2.5 px-3 text-slate-500 font-medium text-[11px] uppercase tracking-wider text-center">
                  Persona
                </TableHead>
                <TableHead className="w-[7%] py-2.5 px-3 text-slate-500 font-medium text-[11px] uppercase tracking-wider text-center">
                  Estado
                </TableHead>
                <TableHead className="w-[8%] py-2.5 px-3 text-slate-500 font-medium text-[11px] uppercase tracking-wider text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableSpinner colSpan={6} />
              ) : usuarios.length > 0 ? (
                usuarios.map((usuario) => (
                  <UsuarioRow key={usuario.id} usuario={usuario} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
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
            {usuarios.length}
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
