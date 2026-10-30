import { Search, Calendar, RotateCcw, Filter } from "lucide-react";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export interface PagoFiltersData {
  search: string;
  fechaInicio: string;
  fechaFinal: string;
}

interface PagoFilterProps {
  onSearch: (filters: PagoFiltersData) => void;
}

export const PagoFilters: React.FC<PagoFilterProps> = ({ onSearch }) => {
  const [filters, setFilters] = useState<PagoFiltersData>({
    search: "",
    fechaInicio: "",
    fechaFinal: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ ...filters });
  };

  const handleReset = () => {
    const resetValues = {
      search: "",
      fechaInicio: "",
      fechaFinal: "",
    };
    setFilters(resetValues);
    onSearch(resetValues);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="p-4 bg-slate-50/50 border-b border-slate-200 rounded-xl w-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-4 space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-wider flex items-center gap-1">
            Buscar por nombre
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              name="search"
              placeholder="Nombre del alumno"
              value={filters.search}
              onChange={handleInputChange}
              autoComplete="off"
              className="pl-9 bg-white border-slate-200 focus:ring-blue-500 w-full"
            />
          </div>
        </div>

        <div className="md:col-span-3 space-y-1.5">
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

        <div className="md:col-span-3 space-y-1.5">
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
            title="Resetear filtros"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </form>
  );
};
