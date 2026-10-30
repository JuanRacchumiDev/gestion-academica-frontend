import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { FileText, Download, ExternalLink, Loader2 } from "lucide-react";
import { downloadModuloPlan } from "../../services/programaService";
import { useToast } from "@/context/ToastContext";
import { Button } from "../ui/button";

interface ModuloAccordionItemProps {
  index: number;
  fieldId: string;
  programaId: number;
  form: UseFormReturn<any>;
}

export const ModuloAccordionItem: React.FC<ModuloAccordionItemProps> = ({
  index,
  fieldId,
  programaId,
  form,
}) => {
  const { showToast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  // Observamos únicamente los campos correspondientes a este ítem
  const moduloId = form.watch(`modulos.${index}.id`);
  const tituloActual = form.watch(`modulos.${index}.titulo`);
  const planFile = form.watch(`modulos.${index}.plan`);
  const planExiste = form.watch(`modulos.${index}.plan_existe`);

  const tienePlan = Boolean(planFile) || Boolean(planExiste);

  const handleModuloPlan = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!moduloId && !programaId) {
      showToast("error", "No se puede descargar el plan del módulo actual.");
      return;
    }

    setIsDownloading(true);

    try {
      await downloadModuloPlan(programaId, moduloId);
      showToast("success", "Plan de módulo descargado con éxito.");
    } catch (error: any) {
      console.error("Error descargando el archivo:", error);
      showToast(
        "error",
        error?.response?.data?.message ||
          "Ocurrió un error al descargar el plan del módulo.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AccordionItem
      key={fieldId}
      value={`item-${index}`}
      className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 overflow-hidden transition-all hover:border-blue-200"
    >
      <AccordionTrigger className="hover:no-underline py-3 text-left flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 font-bold text-xs px-2.5 py-1 rounded-md shrink-0">
            Mód. {index + 1}
          </span>
          <span className="text-xs font-semibold text-slate-800 leading-snug truncate">
            {tituloActual?.trim() ? (
              tituloActual
            ) : (
              <span className="text-slate-400 italic">
                Pendiente de título...
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 pr-1">
          {tienePlan ? (
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] gap-1 py-0 px-2 font-medium"
            >
              <FileText className="h-3 w-3 text-emerald-600" />
              PDF
            </Badge>
          ) : (
            <span className="text-[10px] text-slate-400 font-normal hidden sm:inline-block">
              Sin PDF
            </span>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent className="pt-3 pb-4 border-t border-slate-100 space-y-4 mt-1">
        {/* CAMPO: Título */}
        <FormField
          control={form.control}
          name={`modulos.${index}.titulo`}
          render={({ field: inputField }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>
                  Título del Módulo <span className="text-red-500">*</span>
                </span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. Fundamentos Técnicos e Introducción"
                  autoComplete="off"
                  {...inputField}
                  className="border-slate-200 text-xs focus:ring-blue-500 focus:border-blue-500"
                />
              </FormControl>
              <FormMessage className="text-[11px]" />
            </FormItem>
          )}
        />

        {/* CAMPO: Temario */}
        <FormField
          control={form.control}
          name={`modulos.${index}.temario`}
          render={({ field: textareaField }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold text-slate-700">
                Temario / Contenido
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Escribe los temas detallados del módulo"
                  {...textareaField}
                  value={textareaField.value || ""}
                  autoComplete="off"
                  className="border-slate-200 text-xs focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[70px]"
                />
              </FormControl>
              <FormMessage className="text-[11px]" />
            </FormItem>
          )}
        />

        {/* CAMPO: Subida de Plan (PDF) */}
        <FormField
          control={form.control}
          name={`modulos.${index}.plan`}
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="text-xs font-bold text-slate-700">
                  Plan del Módulo (PDF)
                </FormLabel>
                {planExiste && moduloId && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleModuloPlan}
                    disabled={isDownloading}
                    className="h-auto p-0 px-2 py-0.5 text-[11px] font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded border border-blue-100 transition-colors"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin text-blue-600" />
                        <span>Descargando...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-3 w-3 mr-1 text-blue-600" />
                        <span>Descargar plan actual</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
              <FormControl>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    onChange(file);
                  }}
                  {...fieldProps}
                  className="border-slate-200 text-xs focus:ring-blue-500 focus:border-blue-500"
                />
              </FormControl>
              <FormMessage className="text-[11px]" />
            </FormItem>
          )}
        />
      </AccordionContent>
    </AccordionItem>
  );
};
