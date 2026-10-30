import { useToast } from "../../context/ToastContext";
import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Institucion } from "../../interfaces/IInstitucion";
import { Programa } from "../../interfaces/IPrograma";
import { Modulo } from "../../interfaces/IModulo";
import { getInstituciones } from "../../services/institucionService";
import { getProgramas } from "@/services/programaService";
import { getModulosByPrograma } from "@/services/moduloService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import SearchableCombobox from "../Common/SearchableCombobox";
import { Button } from "../ui/button";
import { Filter, RotateCcw } from "lucide-react";

interface CertificadoFiltersProps {
  onSearch: (filters: CertificadoFiltersData) => void;
}

export interface CertificadoFiltersData {
  id_sucursal?: string;
  id_institucion?: string;
  id_programa?: string;
  search?: string;
}

const loadSucursales = async (): Promise<Institucion[]> => {
  let sucursales: Institucion[] = [];
  const queryParams = `is_cliente=false`;

  try {
    const response = await getInstituciones(queryParams);
    const { result, data } = response;
    if (result && data) {
      sucursales = data as Institucion[];
    }
    return sucursales;
  } catch (error) {
    console.error("Error al obtener sucursales", error);
    return [];
  }
};

const loadInstituciones = async (): Promise<Institucion[]> => {
  let instituciones: Institucion[] = [];
  const queryParams = `is_cliente=true`;

  try {
    const response = await getInstituciones(queryParams);
    const { result, data } = response;
    if (result && data) {
      instituciones = data as Institucion[];
    }
    return instituciones;
  } catch (error) {
    console.error("Error al obtener instituciones", error);
    return [];
  }
};

const loadProgramas = async (): Promise<Programa[]> => {
  let programas: Programa[] = [];

  try {
    const response = await getProgramas();
    const { result, data } = response;
    if (result && data) {
      programas = data as Programa[];
    }
    return programas;
  } catch (error) {
    console.error("Error al obtener programas", error);
    return [];
  }
};

const defaultValues: CertificadoFiltersData = {
  id_sucursal: "all",
  id_institucion: "all",
  id_programa: "all",
  search: "",
};

export const CertificadoFilters: React.FC<CertificadoFiltersProps> = ({
  onSearch,
}) => {
  const { showToast } = useToast();
  const methods = useForm<CertificadoFiltersData>({
    defaultValues,
  });

  const [sucursales, setSucursales] = useState<Institucion[]>([]);
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [isLoadingModulos, setIsLoadingModulos] = useState<boolean>(false);

  const [filters, setFilters] = useState<CertificadoFiltersData>(defaultValues);

  const handleSelectChange = (
    key: keyof CertificadoFiltersData,
    value: string,
  ) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };

      return newFilters;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanFilters: CertificadoFiltersData = {
      ...filters,
      id_sucursal: filters.id_sucursal === "all" ? "" : filters.id_sucursal,
      id_institucion:
        filters.id_institucion === "all" ? "" : filters.id_institucion,
      id_programa: filters.id_programa === "all" ? "" : filters.id_programa,
    };
    onSearch(cleanFilters);
  };

  const handleReset = () => {
    setFilters(defaultValues);
    methods.reset(defaultValues);

    const cleanResetValues: CertificadoFiltersData = {
      id_sucursal: "",
      id_institucion: "",
      id_programa: "",
      search: "",
    };
    onSearch(cleanResetValues);
  };

  // Carga de catálogos iniciales
  useEffect(() => {
    const fetchdata = async () => {
      try {
        const [listSucursales, listInstituciones, listProgramas] =
          await Promise.all([
            loadSucursales(),
            loadInstituciones(),
            loadProgramas(),
          ]);

        setSucursales(listSucursales);
        setInstituciones(listInstituciones);
        setProgramas(listProgramas);
      } catch (error) {
        console.error("Error al obtener datos", error);
        showToast("error", "Error al cargar los datos del formulario.");
      }
    };

    fetchdata();
  }, [showToast]);

  const institucionConTodos = [
    { id: "all", nombre: "Todos" },
    ...instituciones,
  ];

  const programasConTodos = [{ id: "all", titulo: "Todos" }, ...programas];

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSearch}
        className="p-4 bg-slate-50/50 border-b border-slate-200 w-full space-y-3"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-end">
          {/* Sucursal */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-wider flex items-center gap-1">
              Sucursal
            </label>
            <Select
              value={filters.id_sucursal}
              onValueChange={(value) =>
                handleSelectChange("id_sucursal", value)
              }
            >
              <SelectTrigger className="bg-white border-slate-200 w-full h-9 text-xs">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {sucursales.map((sucursal) => (
                  <SelectItem key={sucursal.id} value={sucursal.id.toString()}>
                    {sucursal.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Institución */}
          <div className="md:col-span-3 space-y-1.5">
            <SearchableCombobox
              label="Institución"
              placeholder="Todos"
              options={institucionConTodos}
              valueKey="id"
              displayKey="nombre"
              searchKeys={["nombre"]}
              value={filters.id_institucion}
              onChange={(value) => handleSelectChange("id_institucion", value)}
            />
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <SearchableCombobox
              label="Programa"
              placeholder="Todos"
              options={programasConTodos}
              valueKey="id"
              displayKey="titulo"
              searchKeys={["titulo"]}
              value={filters.id_programa}
              onChange={(value) => handleSelectChange("id_programa", value)}
            />
          </div>

          {/* Búsqueda general por texto */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-wider flex items-center gap-1">
              Búsqueda
            </label>
            <div className="relative">
              <input
                type="text"
                name="search"
                value={filters.search || ""}
                onChange={handleInputChange}
                placeholder="DNI o nombre"
                className="w-full h-9 px-3 py-1 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="md:col-span-2 flex gap-2">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm"
            >
              <Filter className="w-4 h-4" />
              Filtrar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="border-slate-200 text-slate-600 hover:bg-slate-100 shadow-sm px-3"
              title="Resetear filtros"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
