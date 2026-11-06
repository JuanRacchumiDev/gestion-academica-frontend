import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useToast } from "../../context/ToastContext";
import { Spinner } from "../../components/Common/Spinner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RequiredLabel } from "../Common/RequiredLabel";
import { ArrowLeft, Save, XCircle } from "lucide-react";
import { createPrograma, updatePrograma } from "@/services/programaService";
import { ProgramaResponse } from "@/interfaces/IPrograma";

// Esquema Zod tipado explícitamente para evitar conflictos con zodResolver
const cursoSchema = z.object({
  //   sigla: z
  //     .string()
  //     .min(1, "La sigla es requerida (ej. MAT-101).")
  //     .max(10, "Máximo 10 caracteres."),
  titulo: z
    .string()
    .min(3, "El título del curso es requerido.")
    .max(100, "Máximo 100 caracteres."),
  descripcion: z
    .string()
    .max(150, "Máximo 150 caracteres.")
    .optional()
    .or(z.literal("")),
  //   creditos: z
  //     .number({ message: "Debe ser un número" })
  //     .min(1, "Debe tener al menos 1 crédito."),
  modalidad: z
    .string({
      message: "La modalidad es requerida",
    })
    .min(1, "La modalidad es requerida"),
  //   capacidadMinima: z
  //     .number({ message: "Debe ser un número" })
  //     .optional()
  //     .nullable(),
  //   capacidadMaxima: z
  //     .number({ message: "Debe ser un número" })
  //     .optional()
  //     .nullable(),
});

type CursoFormValues = z.infer<typeof cursoSchema>;

export const CursoForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [isLoadingData, setIsLoadingData] = useState(false);

  const isEditMode = !!id;

  const form = useForm<CursoFormValues>({
    resolver: zodResolver(cursoSchema),
    defaultValues: {
      //   sigla: "",
      titulo: "",
      descripcion: "",
      //   creditos: 3,
      modalidad: "PRESENCIAL",
      //   capacidadMinima: 10,
      //   capacidadMaxima: 35,
    },
  });

  useEffect(() => {
    if (isEditMode && id) {
      setIsLoadingData(true);
      // Simulación de carga para edición (reemplazar por getCursoById)
      setTimeout(() => {
        form.reset({
          //   sigla: "MAT-101",
          titulo: "Álgebra I",
          descripcion: "Curso básico de álgebra lineal.",
          //   creditos: 4,
          modalidad: "PRESENCIAL",
          //   capacidadMinima: 10,
          //   capacidadMaxima: 40,
        });
        setIsLoadingData(false);
      }, 300);
    }
  }, [id, isEditMode, form]);

  const onSubmit = async (values: CursoFormValues) => {
    const { titulo, descripcion, modalidad } = values;
    const formData = new FormData();

    if (isEditMode) {
      formData.append("_method", "PATCH");
    }

    formData.append("codigo_segmento", "30");
    formData.append("codigo_tipo_programa", "15");
    formData.append("titulo", titulo);
    formData.append("descripcion", descripcion);
    formData.append("is_vigente", "1");
    formData.append("estado", "1");
    formData.append("modalidad", modalidad || "");

    let response = null;

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    console.log({ formData });

    try {
      if (isEditMode && id) {
        // console.log("---- actualizar programa ----");
        response = await updatePrograma(+id, formData, config);
      } else {
        // console.log("---- crear programa ----");
        response = await createPrograma(formData, config);
      }

      const { result, message, data } = response as ProgramaResponse;

      if (result && data) {
        showToast(
          "success",
          message || (isEditMode ? "Curso actualizado" : "Curso registrado"),
        );
        navigate(`/curso`);
      } else {
        showToast("error", message || "Error al registrar el curso");
        return;
      }
    } catch (error) {
      console.error("Error al guardar curso", error);
      showToast("error", "Error al procesar la solicitud.");
    }
  };

  if (isLoadingData) {
    return (
      <Card className="shadow-xl border-none bg-white min-h-[400px] flex items-center justify-center">
        <Spinner className="h-8 w-8 text-blue-600 animate-spin" />
      </Card>
    );
  }

  const { isSubmitting } = form.formState;

  return (
    <Card className="shadow-xl border-none bg-white">
      <CardHeader className="border-b border-gray-100 p-6 flex flex-row items-center justify-between bg-gray-50/50 rounded-t-xl">
        <div>
          <CardTitle className="text-2xl font-extrabold text-slate-800 tracking-tight">
            {isEditMode ? "Editar Curso" : "Nuevo Registro de Curso"}
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            Complete los datos académicos esenciales del curso
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          type="button"
          onClick={() => navigate("/curso")}
          className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
      </CardHeader>

      <CardContent className="px-6 sm:px-8 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sigla */}
              {/* <FormField
                control={form.control}
                name="sigla"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <RequiredLabel isRequired>Sigla / Código</RequiredLabel>
                    <FormControl>
                      <Input
                        placeholder="MAT-101"
                        maxLength={10}
                        {...field}
                        className={fieldState.invalid ? "border-red-400" : ""}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              /> */}

              {/* Título */}
              <FormField
                control={form.control}
                name="titulo"
                render={({ field, fieldState }) => (
                  <FormItem className="md:col-span-2">
                    <RequiredLabel isRequired>Título del Curso</RequiredLabel>
                    <FormControl>
                      <Input
                        placeholder="Álgebra Superior"
                        maxLength={100}
                        {...field}
                        className={fieldState.invalid ? "border-red-400" : ""}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />

              {/* Créditos */}
              {/* <FormField
                control={form.control}
                name="creditos"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <RequiredLabel isRequired>Créditos</RequiredLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber || 0)
                        }
                        className={fieldState.invalid ? "border-red-400" : ""}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              /> */}

              {/* Modalidad (Sincronizado con el enum del backend: VIRTUAL, PRESENCIAL, MIXTO) */}
              <FormField
                control={form.control}
                name="modalidad"
                render={({ field, fieldState }) => (
                  <FormItem className="w-full">
                    <RequiredLabel isRequired={true}>Modalidad</RequiredLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={`w-full transition-all bg-white ${
                            fieldState.invalid
                              ? "border-red-400 focus:ring-red-100"
                              : "border-slate-200 focus:ring-blue-100 focus:border-blue-500"
                          }`}
                          // className={`${inputErrorClass(fieldState.invalid)} w-full`}
                        >
                          <SelectValue placeholder="Seleccionar modalidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white text-xs border border-slate-200 shadow-md outline-none">
                        <SelectItem value="VIRTUAL">VIRTUAL</SelectItem>
                        <SelectItem value="PRESENCIAL">PRESENCIAL</SelectItem>
                        <SelectItem value="MIXTA">MIXTA</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs font-medium text-red-500" />
                  </FormItem>
                )}
              />

              {/* Capacidad Mínima */}
              {/* <FormField
                control={form.control}
                name="capacidadMinima"
                render={({ field }) => (
                  <FormItem>
                    <RequiredLabel>Capacidad Mínima</RequiredLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.valueAsNumber
                              ? e.target.valueAsNumber
                              : null,
                          )
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              /> */}

              {/* Capacidad Máxima */}
              {/* <FormField
                control={form.control}
                name="capacidadMaxima"
                render={({ field }) => (
                  <FormItem>
                    <RequiredLabel>Capacidad Máxima</RequiredLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.valueAsNumber
                              ? e.target.valueAsNumber
                              : null,
                          )
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              /> */}

              {/* Descripción */}
              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem className="md:col-span-3">
                    <RequiredLabel>Descripción General</RequiredLabel>
                    <FormControl>
                      <Input
                        placeholder="Resumen del contenido y objetivos del curso..."
                        maxLength={150}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => navigate("/curso")}
                className="border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <XCircle className="h-4 w-4 mr-2" /> Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
              >
                {isSubmitting ? (
                  <Spinner className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isEditMode ? "Actualizar" : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
