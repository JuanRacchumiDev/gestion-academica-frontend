import { Calendar, Filter, RotateCcw } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { DetalleParametro } from "../../interfaces/IDetalleParametro";
import { getDetalles } from "../../services/detalleParametroService";
import { ParametroClase } from "../../params/parametroClase";
import { useToast } from "../../context/ToastContext";

export interface AdjuntoFiltersData {
  codigoTipoPrograma: string;
  fechaInicio: string;
  fechaFinal: string;
  search: string;
}

interface AdjuntoFiltersProps {
  onSearch: (filters: AdjuntoFiltersData) => void;
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

export const AdjuntoFilters: React.FC<AdjuntoFiltersProps> = ({ onSearch }) => {
  const { showToast } = useToast();
  const [tipoProgramas, setTipoProgramas] = useState<DetalleParametro[]>([]);
  const [filters, setFilters] = useState<AdjuntoFiltersData>({
    codigoTipoPrograma: "all",
    fechaInicio: "",
    fechaFinal: "",
    search: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Limpiamos los valores "all" antes de enviar al servicio
    const cleanFilters = {
      ...filters,
      codigoTipoPrograma:
        filters.codigoTipoPrograma === "all" ? "" : filters.codigoTipoPrograma,
    };
    onSearch(cleanFilters);
  };

  const handleReset = () => {
    const resetValues = {
      codigoTipoPrograma: "all",
      fechaInicio: "",
      fechaFinal: "",
      search: "",
    };

    setFilters(resetValues);

    onSearch({
      codigoTipoPrograma: "",
      fechaInicio: "",
      fechaFinal: "",
      search: "",
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const listTipoProgramas = await loadTipoProgramas();
        setTipoProgramas(listTipoProgramas);
      } catch (error) {
        console.error("Error al obtener datos", error);
        showToast("error", "Error al cargar los datos del formulario.");
      }
    };

    fetchData();
  }, []);

  return (
    <form
      onSubmit={handleSearch}
      className="p-4 bg-slate-50/50 border-b border-slate-200 rounded-xl w-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-3 space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-wider flex items-center gap-1">
            Tipo Programa
          </label>
          <Select
            value={filters.codigoTipoPrograma}
            onValueChange={(value) =>
              handleSelectChange("codigoTipoPrograma", value)
            }
          >
            <SelectTrigger className="bg-white border-slate-200 w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {tipoProgramas.map((tipo) => (
                <SelectItem key={tipo.codigo} value={tipo.codigo.toString()}>
                  {tipo.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-3 space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-wider flex items-center gap-1">
            PROGRAMA
          </label>
          <Input
            id="search"
            name="search"
            autoComplete="off"
            value={filters.search || ""}
            onChange={handleInputChange}
            placeholder="Ejm: Cuidado de cuyes"
            className="md:col-span-3 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Fecha de Inicio
          </label>
          <div className="relative">
            <Input
              type="date"
              name="fechaInicio"
              placeholder="Fecha de Inicio"
              value={filters.fechaInicio}
              onChange={handleInputChange}
              autoComplete="off"
              className="bg-white border-slate-200 focus:ring-blue-500 w-full"
            />
          </div>
        </div>

        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Fecha Final
          </label>
          <div className="relative">
            <Input
              type="date"
              name="fechaFinal"
              placeholder="Fecha Final"
              value={filters.fechaFinal}
              onChange={handleInputChange}
              autoComplete="off"
              className="bg-white border-slate-200 focus:ring-blue-500 w-full"
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
            onClick={handleReset}
            variant="outline"
            className="border-slate-200 text-slate-600 hover:bg-slate-100 shadow-sm px-3"
            title="Restear filtros"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </form>
  );
};
