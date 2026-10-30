import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, parseISO } from "date-fns";
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
  FormDescription,
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

import {
  createPrograma,
  getProgramaById,
  updatePrograma,
} from "../../services/programaService";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RequiredLabel } from "../Common/RequiredLabel";
import { Programa, ProgramaResponse } from "../../interfaces/IPrograma";
import {
  ArrowLeft,
  CheckCircle2,
  Save,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { getDetalles } from "../../services/detalleParametroService";
import { DetalleParametro } from "../../interfaces/IDetalleParametro";
import { ParametroClase } from "../../params/parametroClase";
import {
  MAX_FILE_IMAGE_2M_SIZE,
  TIPO_PROGRAMA_ESPECIALIZACION,
  TIPO_PROGRAMA_CAPACITACION,
} from "../../params/constants";
import { parseDate } from "../../utils/dateUtils";
import { Textarea } from "@/components/ui/textarea";

const loadSegmentos = async () => {
  let listSegmentos: DetalleParametro[] = [];

  const queryParams = `parametro_clase=${ParametroClase.SEGMENTO}&en_persona=false&en_empresa=false&estado=true`;

  const response = await getDetalles(queryParams);

  const { result, data } = response;

  if (result && data) {
    listSegmentos = data as DetalleParametro[];
  }

  return listSegmentos;
};

const loadTipoProgramas = async () => {
  let listTipoProgramas: DetalleParametro[] = [];

  const queryParams = `parametro_clase=${ParametroClase.TIPO_PROGRAMA}&en_persona=false&en_empresa=false&estado=true`;

  const response = await getDetalles(queryParams);

  const { result, data } = response;

  if (result && data) {
    listTipoProgramas = data as DetalleParametro[];
  }

  return listTipoProgramas;
};

const formSchema = z
  .object({
    codigoSegmento: z
      .string({
        message: "El segmento es requerido",
      })
      .min(1, "El segmento es requerido"),
    codigoTipoPrograma: z
      .string({
        message: "El tipo de programa es requerido",
      })
      .min(1, "El tipo de programa es requerido"),
    titulo: z.string().min(10, {
      message: "El título es requerido",
    }),
    fechaInicio: z.date({
      message: "La fecha de inicio es requerida",
    }),
    fechaFinal: z.date({
      message: "La fecha final es requerida",
    }),
    duracion: z.string().optional().nullable(),
    horasAcademicas: z
      .number({ message: "Debe ser un número entero" })
      .int("Las horas académicas deben ser un número entero")
      .min(0, "El valor mínimo es 0")
      .optional()
      .nullable(),
    modulos: z
      .number({ message: "Debe ser un número" })
      .min(0, { message: "El valor mínimo es 0" }),
    plan_file: z
      .instanceof(File)
      .nullable()
      .optional()
      .refine(
        (file) => !file || file.size <= MAX_FILE_IMAGE_2M_SIZE,
        `El archivo debe ser menor a 2MB`,
      )
      .refine(
        (file) => !file || file.type === "application/pdf",
        `El archivo debe ser un PDF`,
      ),
    temario: z.string().optional(),
    modalidad: z
      .string({
        message: "La modalidad es requerida",
      })
      .min(1, "La modalidad es requerida"),
    isCapacitacion: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.fechaFinal <= data.fechaInicio) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha debe ser posterior a la fecha de inicio",
        path: ["fechaFinal"],
      });
    }

    // Validación condicional del campo temario si el tipo de programa es capacitación
    if (data.isCapacitacion && (!data.temario || data.temario.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El temario detallado es obligatorio",
        path: ["temario"],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  codigoSegmento: "",
  codigoTipoPrograma: "",
  titulo: "",
  fechaInicio: new Date(),
  fechaFinal: new Date(),
  duracion: "",
  horasAcademicas: null,
  modulos: 0,
  modalidad: "VIRTUAL",
  plan_file: null,
  temario: "",
  isCapacitacion: false,
};

export const ProgramaForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [segmentos, setSegmentos] = useState<DetalleParametro[]>([]);
  const [tipoProgramas, setTipoProgramas] = useState<DetalleParametro[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const isEditMode = !!id;

  const inputErrorClass = (invalid: boolean) =>
    invalid ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500";

  const handleGoBack = () => {
    const urlBack = `/programa-academico/`;
    navigate(urlBack);
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const watchFechaInicio = form.watch("fechaInicio");
  const watchFechaFinal = form.watch("fechaFinal");
  const watchcodigoTipoPrograma = form.watch("codigoTipoPrograma");

  // console.log({ watchcodigoTipoPrograma });

  const selectedTipo = tipoProgramas.find(
    (item) => item.codigo?.toString() === watchcodigoTipoPrograma,
  );

  const isEspecializacion =
    selectedTipo?.nombre_url?.toLowerCase() === TIPO_PROGRAMA_ESPECIALIZACION;

  const isCapacitacion =
    selectedTipo?.nombre_url?.toLowerCase() === TIPO_PROGRAMA_CAPACITACION;

  useEffect(() => {
    if (!isEspecializacion) {
      form.setValue("duracion", "", { shouldValidate: true });
      form.setValue("modulos", 0, { shouldValidate: true });
      return;
    }

    if (watchFechaInicio && watchFechaFinal) {
      // Cálculo de diferencia de meses
      const start = new Date(watchFechaInicio);
      const end = new Date(watchFechaFinal);

      let months = (end.getFullYear() - start.getFullYear()) * 12;
      months -= start.getMonth();
      months += end.getMonth();

      const diffMeses = months <= 0 ? 0 : months;

      if (diffMeses > 0) {
        const mesesFormateados =
          diffMeses < 10 ? `0${diffMeses}` : `${diffMeses}`;

        // Actualizar campos automáticamente
        form.setValue("duracion", `${mesesFormateados} MESES`, {
          shouldValidate: true,
        });
        form.setValue("modulos", diffMeses, { shouldValidate: true });
      } else {
        form.setValue("duracion", "", { shouldValidate: true });
        form.setValue("modulos", 0, { shouldValidate: true });
      }
    }
  }, [watchFechaFinal, watchFechaInicio, isEspecializacion, form]);

  useEffect(() => {
    form.setValue("isCapacitacion", isCapacitacion);
  }, [isCapacitacion, form]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);

      try {
        const [listSegmentos, listTipoProgramas] = await Promise.all([
          loadSegmentos(),
          loadTipoProgramas(),
        ]);

        setSegmentos(listSegmentos);
        setTipoProgramas(listTipoProgramas);

        if (isEditMode && id) {
          const responsePrograma = await getProgramaById(+id);
          // console.log({ responsePrograma });

          const { result, data } = responsePrograma;

          if (result && data) {
            const programa = data as Programa;

            // console.log({ programa });

            form.reset({
              codigoSegmento: programa.codigo_segmento?.toString() ?? "",
              codigoTipoPrograma:
                programa.codigo_tipoprograma?.toString() ?? "",
              titulo: programa.titulo ?? "",
              fechaInicio: parseDate(programa.fecha_inicio),
              fechaFinal: parseDate(programa.fecha_final),
              horasAcademicas: programa.horas_academicas ?? null,
              duracion: programa.duracion ?? "",
              modulos: programa.numero_modulos ?? 0,
              modalidad: programa.modalidad ?? "VIRTUAL",
              temario: programa.temario ?? "",
            });
          }
        }
      } catch (error) {
        console.error("Error al obtener datos", error);
        showToast("error", "Error al cargar los datos del formulario.");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  const resetForm = () => {
    const dataForm = defaultValues;

    form.reset(dataForm);
  };

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = new FormData();

      // console.log("---- values onSubmit ProgramaForm ----");
      // console.log({ values });

      const {
        codigoSegmento,
        codigoTipoPrograma,
        titulo,
        fechaInicio,
        fechaFinal,
        duracion,
        horasAcademicas,
        modulos,
        plan_file,
        temario,
        modalidad,
      } = values;

      const fechaInicioStr = format(fechaInicio, "yyyy-MM-dd");
      const fechaFinalStr = format(fechaFinal, "yyyy-MM-dd");

      // console.log({ fechaInicioStr });
      // console.log({ fechaFinalStr });

      if (isEditMode) {
        formData.append("_method", "PATCH");
      }

      formData.append("codigo_segmento", codigoSegmento);
      formData.append("codigo_tipoprograma", codigoTipoPrograma);
      formData.append("titulo", titulo);
      formData.append("fecha_inicio", fechaInicioStr);
      formData.append("fecha_final", fechaFinalStr);
      formData.append("duracion", duracion || "");

      if (horasAcademicas !== null && horasAcademicas !== undefined) {
        formData.append("horas_academicas", horasAcademicas.toString());
      } else {
        formData.append("horas_academicas", "");
      }

      formData.append("numero_modulos", modulos.toString());
      formData.append("is_vigente", "1");
      formData.append("estado", "1");
      formData.append("modalidad", modalidad || "");
      formData.append("temario", temario?.trim() || "");

      // Agregar el archivo si existe
      if (plan_file) {
        formData.append("plan", plan_file);
      }

      // console.log("--- formData ----");
      // console.log({ formData });

      let response = null;

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      // console.log({ isEditMode });

      if (isEditMode && id) {
        // console.log("---- actualizar programa ----");
        response = await updatePrograma(+id, formData, config);
      } else {
        // console.log("---- crear programa ----");
        response = await createPrograma(formData, config);
      }

      // console.log("response create/update", response);
      const { result, message, data } = response as ProgramaResponse;

      // console.log({ result });
      // console.log({ message });
      // console.log({ data });

      if (result && data) {
        showToast(
          "success",
          message ||
            (isEditMode ? "Programa actualizado" : "Programa registrado"),
        );
        navigate(`/programa-academico`);
      } else {
        showToast("error", message || "Error al registrar el programa");
        return;
      }
    } catch (error) {
      console.error("Error al registrar programa", error);
      showToast("error", "Error al registrar el programa");
    }
  };

  return (
    <Card className="shadow-xl border-none bg-white">
      <CardHeader className="border-b border-gray-100 p-6 flex flex-row items-center justify-between bg-gray-50/50 rounded-t-xl">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-extrabold text-slate-800 tracking-tight">
            {isEditMode ? "Editar programa" : "Nuevo Registro de programa"}
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            {isEditMode
              ? "Actualización de información de programa"
              : "Complete la información para registrar un programa"}
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={handleGoBack}
          className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </CardHeader>

      <CardContent className="px-6 sm:px-8 pb-6 relative">
        {isLoadingData && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10">
            <Spinner className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Grid de Inputs Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
              {/* Segmento */}
              <FormField
                control={form.control}
                name="codigoSegmento"
                render={({ field, fieldState }) => (
                  <FormItem className="w-full">
                    <RequiredLabel isRequired={true}>Segmento</RequiredLabel>
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
                          <SelectValue placeholder="Seleccionar segmento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white text-xs border border-slate-200 shadow-md outline-none">
                        {segmentos.map((segmento: any) => (
                          <SelectItem
                            value={segmento.codigo!.toString()}
                            key={segmento.codigo!.toString()}
                            className="cursor-pointer hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold transition-colors"
                          >
                            {segmento.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs font-medium text-red-500" />
                  </FormItem>
                )}
              />

              {/* Tipo Programa */}
              <FormField
                control={form.control}
                name="codigoTipoPrograma"
                render={({ field, fieldState }) => (
                  <FormItem className="w-full">
                    <RequiredLabel isRequired={true}>
                      Tipo Programa
                    </RequiredLabel>
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
                          <SelectValue placeholder="Seleccionar tipo programa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white text-xs border border-slate-200 shadow-md outline-none">
                        {tipoProgramas.map((tipoPrograma: any) => (
                          <SelectItem
                            value={tipoPrograma.codigo!.toString()}
                            key={tipoPrograma.codigo!.toString()}
                          >
                            {tipoPrograma.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs font-medium text-red-500" />
                  </FormItem>
                )}
              />

              {/* Título */}
              <FormField
                control={form.control}
                name="titulo"
                render={({ field, fieldState }) => (
                  <FormItem className="w-full">
                    <RequiredLabel isRequired={true}>Título</RequiredLabel>
                    <FormControl>
                      <Input
                        placeholder="ADMINISTRACIÓN EJECUTIVA"
                        autoComplete="off"
                        maxLength={100}
                        {...field}
                        value={field.value ?? ""}
                        // className={inputErrorClass(fieldState.invalid)}
                        className={`transition-all bg-white ${
                          fieldState.invalid
                            ? "border-red-400 focus-visible:ring-red-100"
                            : "border-slate-200 focus-visible:ring-blue-100 focus-visible:border-blue-500"
                        }`}
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-medium text-red-500" />
                  </FormItem>
                )}
              />

              {/* Fecha Inicio */}
              <FormField
                control={form.control}
                name="fechaInicio"
                render={({ field, fieldState }) => (
                  <FormItem className="w-full">
                    <RequiredLabel isRequired={true}>
                      Fecha Inicio
                    </RequiredLabel>
                    <FormControl>
                      <Input
                        type="date"
                        autoComplete="off"
                        value={
                          field.value instanceof Date &&
                          !isNaN(field.value.getTime())
                            ? format(field.value, "yyyy-MM-dd")
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseISO(e.target.value) : null,
                          )
                        }
                        className={`transition-all bg-white ${
                          fieldState.invalid
                            ? "border-red-400 focus-visible:ring-red-100"
                            : "border-slate-200 focus-visible:ring-blue-100 focus-visible:border-blue-500"
                        }`}
                        // className={inputErrorClass(fieldState.invalid)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fecha Final */}
              <FormField
                control={form.control}
                name="fechaFinal"
                render={({ field, fieldState }) => (
                  <FormItem className="w-full">
                    <RequiredLabel isRequired={true}>Fecha Final</RequiredLabel>
                    <FormControl>
                      <Input
                        type="date"
                        autoComplete="off"
                        value={
                          field.value instanceof Date &&
                          !isNaN(field.value.getTime())
                            ? format(field.value, "yyyy-MM-dd")
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseISO(e.target.value) : null,
                          )
                        }
                        className={`transition-all bg-white ${
                          fieldState.invalid
                            ? "border-red-400 focus-visible:ring-red-100"
                            : "border-slate-200 focus-visible:ring-blue-100 focus-visible:border-blue-500"
                        }`}
                        // className={inputErrorClass(fieldState.invalid)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Modalidad */}
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

              {/* Campos Condicionales de Especialización */}
              {isEspecializacion && (
                <>
                  <FormField
                    control={form.control}
                    name="duracion"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <label className="text-sm font-medium text-slate-700">
                          Duración
                        </label>
                        <FormControl>
                          <Input
                            placeholder="12 MESES"
                            autoComplete="off"
                            maxLength={20}
                            {...field}
                            value={field.value ?? ""}
                            className={inputErrorClass(fieldState.invalid)}
                          />
                        </FormControl>
                        <FormMessage className="text-xs font-medium text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="modulos"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <label className="text-sm font-medium text-slate-700">
                          Módulos
                        </label>
                        <FormControl>
                          <Input
                            placeholder="12"
                            autoComplete="off"
                            type="number"
                            min={0}
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === "" ? null : parseInt(value, 10),
                              );
                            }}
                            className={inputErrorClass(fieldState.invalid)}
                          />
                        </FormControl>
                        <FormMessage className="text-xs font-medium text-red-500" />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Horas Académicas */}
              <FormField
                control={form.control}
                name="horasAcademicas"
                render={({ field, fieldState }) => (
                  <FormItem className="w-full">
                    <label className="text-sm font-medium text-slate-700">
                      Horas académicas
                    </label>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="120"
                        step={1}
                        min={0}
                        autoComplete="off"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? null : parseInt(val, 10));
                        }}
                        className={`transition-all bg-white ${
                          fieldState.invalid
                            ? "border-red-400 focus-visible:ring-red-100"
                            : "border-slate-200 focus-visible:ring-blue-100 focus-visible:border-blue-500"
                        }`}
                        // className={inputErrorClass(fieldState.invalid)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Sección Inferior: Contenido Extenso (Temario & Documento Plan de Estudios) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
              {/* Textarea: Temario (Ocupa 2 columnas en Desktop) */}
              <FormField
                control={form.control}
                name="temario"
                render={({ field, fieldState }) => (
                  <FormItem className="lg:col-span-2 flex flex-col justify-between">
                    <div>
                      {isCapacitacion ? (
                        <RequiredLabel>Temario del programa</RequiredLabel>
                      ) : (
                        <label className="text-sm font-medium text-slate-700">
                          Temario del programa
                        </label>
                      )}
                      <FormControl className="mt-1.5">
                        <Textarea
                          {...field}
                          placeholder="Detalle los temas, unidades o contenido general del programa"
                          rows={6}
                          className={`min-h-40 resize-y ${inputErrorClass(fieldState.invalid)}`}
                        />
                      </FormControl>
                    </div>
                    <div className="space-y-1 mt-1.5">
                      <FormDescription className="text-xs text-slate-500">
                        Describa el contenido temático del programa.{" "}
                        {isCapacitacion && "(Obligatorio para Capacitación)"}
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              {/* File Upload: Plan de Estudios (Diseño Dropzone Profesional - Ocupa 1 columna) */}
              <FormField
                control={form.control}
                name="plan_file"
                render={({ field, fieldState }) => {
                  const selectedFile = field.value as File | null;

                  return (
                    <FormItem className="flex flex-col justify-between">
                      <div>
                        <RequiredLabel>Plan de estudios</RequiredLabel>
                        <FormControl className="mt-1.5">
                          <div className="relative">
                            <input
                              id="plan_file"
                              type="file"
                              accept=".pdf"
                              onChange={(e) =>
                                field.onChange(e.target.files?.[0] ?? null)
                              }
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div
                              className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all bg-slate-50/50 hover:bg-slate-100/60 min-h-40 ${
                                fieldState.invalid
                                  ? "border-red-400 bg-red-50/20"
                                  : selectedFile
                                    ? "border-emerald-400 bg-emerald-50/20"
                                    : "border-slate-300 hover:border-blue-400"
                              }`}
                            >
                              {selectedFile ? (
                                <div className="flex flex-col items-center space-y-2 p-2">
                                  <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-full">
                                    <CheckCircle2 className="h-6 w-6" />
                                  </div>
                                  <div className="space-y-0.5 max-w-[200px]">
                                    <p className="text-xs font-semibold text-slate-800 truncate">
                                      {selectedFile.name}
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                      {(
                                        selectedFile.size /
                                        (1024 * 1024)
                                      ).toFixed(2)}{" "}
                                      MB
                                    </p>
                                  </div>
                                  <span className="text-[11px] text-blue-600 font-medium hover:underline pt-1">
                                    Haga clic para cambiar archivo
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center space-y-2">
                                  <div className="p-3 bg-blue-50 text-blue-600 rounded-full group-hover:scale-105 transition-transform">
                                    <UploadCloud className="h-6 w-6" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-700">
                                      Haga clic o arrastre un archivo
                                    </p>
                                    <p className="text-[11px] text-slate-400">
                                      Soporta formato PDF (Máx. 2MB)
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </FormControl>
                      </div>
                      <div className="mt-1.5">
                        <FormMessage />
                      </div>
                    </FormItem>
                  );
                }}
              />
            </div>

            {/* Acciones del Formulario */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={resetForm}
                className="border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white transition-all min-w-[140px]"
              >
                {isSubmitting ? (
                  <Spinner className="h-4 w-4 mr-2 border-2 border-white/20 border-t-white" />
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
