import { Filter, RotateCcw, Search } from "lucide-react";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export interface DPFilterProps {
  onSearch: (filters: DPFiltersData) => void;
}

export interface DPFiltersData {
  search: string;
}

export const DetalleParametroFilters: React.FC<DPFilterProps> = ({
  onSearch,
}) => {
  const [filters, setFilters] = useState<DPFiltersData>({
    search: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    const resetValues = { search: "" };
    setFilters(resetValues);
    onSearch(resetValues);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-wrap items-end gap-4"
    >
      <div className="flex-1 min-w-[250px] space-y-1.5">
        <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-wider">
          Buscar por nombre
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            name="search"
            placeholder="Ej. Juan Perez"
            autoComplete="off"
            value={filters.search}
            onChange={handleInputChange}
            className="pl-9 bg-white border-slate-200 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm"
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
    </form>
  );
};
