import React, { useState } from "react";
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
import { DetalleParametro } from "../../interfaces/IDetalleParametro";

interface ProgramaFilterProps {
  onSearch: (filters: ProgramaFiltersData) => void;
  segmentos: DetalleParametro[];
  tipoProgramas: DetalleParametro[];
}

export interface ProgramaFiltersData {
  titulo: string;
  codigo_segmento: string;
  codigo_tipoprograma: string;
}

export const ProgramaFilters: React.FC<ProgramaFilterProps> = ({
  onSearch,
  segmentos,
  tipoProgramas,
}) => {
  const [filters, setFilters] = useState({
    titulo: "",
    codigo_segmento: "all",
    codigo_tipoprograma: "all",
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
      codigo_segmento:
        filters.codigo_segmento === "all" ? "" : filters.codigo_segmento,
      codigo_tipoprograma:
        filters.codigo_tipoprograma === "all"
          ? ""
          : filters.codigo_tipoprograma,
    };
    onSearch(cleanFilters);
  };

  const handleReset = () => {
    const resetValues = {
      titulo: "",
      codigo_segmento: "all",
      codigo_tipoprograma: "all",
    };
    setFilters(resetValues);

    const cleanResetValues = {
      titulo: "",
      codigo_segmento: "",
      codigo_tipoprograma: "",
    };
    onSearch(cleanResetValues);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="p-4 bg-slate-50/50 border-b border-slate-200 w-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        {/* Input: Título del Programa */}
        <div className="md:col-span-4 space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-wider flex items-center gap-1">
            Buscar por nombre
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              name="titulo"
              placeholder="Nombre del programa"
              autoComplete="off"
              value={filters.titulo}
              onChange={handleInputChange}
              className="pl-9 bg-white border-slate-200 focus:ring-blue-500 w-full"
            />
          </div>
        </div>

        {/* Select: Segmento */}
        <div className="md:col-span-3 space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-wider flex items-center gap-1">
            Segmento
          </label>
          <Select
            value={filters.codigo_segmento}
            onValueChange={(value) =>
              handleSelectChange("codigo_segmento", value)
            }
          >
            <SelectTrigger className="bg-white border-slate-200 w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los segmentos</SelectItem>
              {segmentos.map((item) => (
                <SelectItem
                  key={item.codigo}
                  value={item.codigo?.toString() || ""}
                >
                  {item.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Select: Tipo de Programa */}
        <div className="md:col-span-3 space-y-1.5">
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
  );
};
