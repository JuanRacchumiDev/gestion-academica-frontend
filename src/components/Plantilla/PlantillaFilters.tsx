import React, { useEffect, useState } from "react";
import { Search, RotateCcw, Filter } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Institucion } from "../../interfaces/IInstitucion";
import { DetalleParametro } from "../../interfaces/IDetalleParametro";
import { useToast } from "@/context/ToastContext";
import { FormProvider, useForm } from "react-hook-form";
import { getInstituciones } from "@/services/institucionService";
import { getDetalles } from "@/services/detalleParametroService";
import { ParametroClase } from "../../params/parametroClase";
import SearchableCombobox from "../Common/SearchableCombobox";

interface PlantillaFilterProps {
  onSearch: (filters: PlantillaFiltersData) => void;
}

export interface PlantillaFiltersData {
  codigo_tipoprograma?: string;
  id_sucursal?: string;
  id_institucion?: string;
  search?: string;
}

const loadTipoProgramas = async (): Promise<DetalleParametro[]> => {
  let tipoProgramas: DetalleParametro[] = [];

  try {
    const queryParams = `parametro_clase=${ParametroClase.TIPO_PROGRAMA}&estado=true`;

    const response = await getDetalles(queryParams);

    const { result, data } = response;

    if (result && data) {
      tipoProgramas = data as DetalleParametro[];
    }

    return tipoProgramas;
  } catch (error) {
    console.error("Error al obtener tipo de programas", error);
    return [];
  }
};

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

const defaultValues: PlantillaFiltersData = {
  codigo_tipoprograma: "",
  id_sucursal: "",
  id_institucion: "",
  search: "",
};

export const PlantillaFilters: React.FC<PlantillaFilterProps> = ({
  onSearch,
}) => {
  const { showToast } = useToast();
  const methods = useForm<PlantillaFiltersData>({
    defaultValues,
  });

  const [tipoProgramas, setTipoProgramas] = useState<DetalleParametro[]>([]);
  const [sucursales, setSucursales] = useState<Institucion[]>([]);
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);

  const [filters, setFilters] = useState<PlantillaFiltersData>(defaultValues);

  const handleSelectChange = (
    key: keyof PlantillaFiltersData,
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

    const cleanFilters: PlantillaFiltersData = {
      ...filters,
      codigo_tipoprograma:
        filters.codigo_tipoprograma === "all"
          ? ""
          : filters.codigo_tipoprograma,
      id_sucursal: filters.id_sucursal === "all" ? "" : filters.id_sucursal,
      id_institucion:
        filters.id_institucion === "all" ? "" : filters.id_institucion,
    };

    onSearch(cleanFilters);
  };

  const handleReset = () => {
    setFilters(defaultValues);
    methods.reset(defaultValues);

    const cleanResetValues: PlantillaFiltersData = {
      codigo_tipoprograma: "",
      id_sucursal: "",
      id_institucion: "",
      search: "",
    };
    onSearch(cleanResetValues);
  };

  // Carga de catálogos iniciales
  useEffect(() => {
    const fetchdata = async () => {
      try {
        const [listTipoProgramas, listSucursales, listInstituciones] =
          await Promise.all([
            loadTipoProgramas(),
            loadSucursales(),
            loadInstituciones(),
          ]);

        setTipoProgramas(listTipoProgramas);
        setSucursales(listSucursales);
        setInstituciones(listInstituciones);
      } catch (error) {
        console.error("Error al obtener datos", error);
        showToast("error", "Error al cargar los datos iniciales.");
      }
    };

    fetchdata();
  }, [showToast]);

  const institucionConTodos = [
    { id: "all", nombre: "Todos" },
    ...instituciones,
  ];

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSearch}
        className="p-4 bg-slate-50/50 border-b border-slate-200 w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Select: Tipo de Programa */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-wider flex items-center gap-1">
              Tipo de Programa
            </label>
            <Select
              value={filters.codigo_tipoprograma}
              onValueChange={(value) =>
                handleSelectChange("codigo_tipoprograma", value)
              }
            >
              <SelectTrigger className="bg-white border-slate-200 w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {tipoProgramas.map((item) => (
                  <SelectItem
                    key={item.codigo}
                    value={item.codigo.toString() || ""}
                  >
                    {item.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Select: Sucursal */}
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
            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-wider flex items-center gap-1">
              Buscar por nombre
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                name="search"
                placeholder="Nombre de la plantilla"
                autoComplete="off"
                value={filters.search}
                onChange={handleInputChange}
                className="pl-9 bg-white border-slate-200 focus:ring-blue-500 w-full"
              />
            </div>
          </div>

          {/* Botones de Acción */}
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
