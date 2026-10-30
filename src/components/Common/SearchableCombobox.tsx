import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../components/ui/command";
import { Button } from "../../components/ui/button";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { FormControl, FormItem } from "../../components/ui/form";
import { RequiredLabel } from "./RequiredLabel";

interface SearchableComboboxProps<T extends { [key: string]: any }> {
  label?: string;
  placeholder?: string;
  options?: T[];
  value?: string;
  onChange: (value: string) => void;
  displayKey?: keyof T;
  valueKey?: keyof T;
  searchKeys?: (keyof T)[];
  disabled?: boolean;
  isInvalid?: boolean;
  isLoading?: boolean;
  renderOption?: (option: T) => React.ReactNode;
}

const SearchableCombobox = <T extends { [key: string]: any }>({
  label,
  placeholder,
  options,
  value,
  onChange,
  displayKey,
  valueKey,
  searchKeys,
  disabled,
  isInvalid,
  isLoading,
  renderOption,
}: SearchableComboboxProps<T>) => {
  const [open, setOpen] = useState(false);

  const selectedOption = Array.isArray(options)
    ? options.find((option) => String(option[valueKey]) === value)
    : undefined;

  const displayValue = selectedOption
    ? (selectedOption[displayKey] as string)
    : placeholder;

  return (
    <FormItem className="w-full">
      {label && <RequiredLabel>{label}</RequiredLabel>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-full justify-between cursor-pointer min-h-10 h-auto px-3 py-2 text-left whitespace-normal",
                !value && "text-muted-foreground",
                isInvalid
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-blue-500",
                "focus:ring-2 focus:ring-offset-2 transition-all duration-300",
              )}
              disabled={disabled}
            >
              <span className="line-clamp-2 wrap-break-word pr-2 text-sm leading-snug flex-1">
                {isLoading ? "Cargando opciones..." : displayValue}
              </span>
              {isLoading ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground ml-auto" />
              ) : (
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 self-center ml-auto" />
              )}
            </Button>
          </FormControl>
        </PopoverTrigger>

        <PopoverContent
          className="w-(--radix-popover-trigger-width) min-w-[320px] p-0 bg-white"
          align="start"
        >
          <Command className="w-full">
            <CommandInput
              placeholder={`Buscar ${label ? label.toLowerCase() : ""}...`}
              className="h-9 px-3 border-b border-gray-200 focus:ring-0 w-full"
            />
            <CommandList className="max-h-[350px] overflow-y-auto w-full">
              {isLoading ? (
                <div className="py-6 flex items-center justify-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  Cargando...
                </div>
              ) : (
                <>
                  <CommandEmpty className="py-6 text-center text-sm">
                    No se encontraron resultados{" "}
                    {label ? label.toLowerCase() : ""}
                  </CommandEmpty>
                  <CommandGroup className="p-1 w-full">
                    {Array.isArray(options) &&
                      options.map((option) => {
                        const optionValue = String(option[valueKey]);

                        const searchValue = searchKeys
                          .map((key) => option[key])
                          .join(" ")
                          .toLowerCase();

                        return (
                          <CommandItem
                            key={optionValue}
                            value={String(searchValue)}
                            onSelect={() => {
                              onChange(optionValue);
                              setOpen(false);
                            }}
                            className={cn(
                              "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                              "hover:bg-blue-50 hover:text-blue-700",
                              value === optionValue &&
                                "bg-blue-50 font-medium text-blue-700",
                            )}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 shrink-0",
                                value === optionValue
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <div className="flex flex-col w-full whitespace-normal wrap-break-word">
                              {renderOption ? (
                                renderOption(option)
                              ) : (
                                <span className="block line-clamp-2">
                                  {option[displayKey] as string}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        );
                      })}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </FormItem>
  );
};

export default SearchableCombobox;
