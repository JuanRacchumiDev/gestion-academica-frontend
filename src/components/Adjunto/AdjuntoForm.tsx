import { useEffect, useState, useRef } from "react";
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
import { RequiredLabel } from "../../components/Common/RequiredLabel";
import {
  ArrowLeft,
  Save,
  XCircle,
  UploadCloud,
  FileCheck,
  FileText,
  Download,
  Youtube,
  HardDrive,
  Link2,
  Paperclip,
} from "lucide-react";

import { getProgramas } from "../../services/programaService";
import { getModulosByPrograma } from "../../services/moduloService";
import {
  createAdjunto,
  getAdjuntoById,
  downloadAdjunto,
  updateAdjunto,
} from "../../services/adjuntoService";
import { Programa } from "@/interfaces/IPrograma";
import { Modulo } from "@/interfaces/IModulo";
import { Adjunto, TipoAdjunto } from "@/interfaces/IAdjunto";
import SearchableCombobox from "../../components/Common/SearchableCombobox";
import { formatInTimeZone } from "date-fns-tz";
import {
  TIMEZONE_AMERICA_LIMA,
  MAX_FILE_IMAGE_5M_SIZE,
} from "@/params/constants";

const formSchema = z
  .object({
    idPrograma: z
      .string({ message: "El programa es requerido" })
      .min(1, "El programa es requerido"),
    idModulo: z.string().optional().nullable(),
    nombre: z
      .string({ message: "El nombre es requerido" })
      .min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
    tipo: z.enum(["FILE", "YOUTUBE", "DRIVE", "URL"]),
    adjunto_file: z
      .instanceof(File)
      .nullable()
      .optional()
      .refine(
        (file) => !file || file.size <= MAX_FILE_IMAGE_5M_SIZE,
        `El archivo debe ser menor a 5MB`,
      ),
    url: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipo !== "FILE") {
      if (!data.url || data.url.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El enlace o URL externa es requerido",
          path: ["url"],
        });
      } else {
        try {
          new URL(data.url);
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ingrese una URL válida (Ej: https://...)",
            path: ["url"],
          });
        }
      }
    }
  });

export const AdjuntoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const [programas, setProgramas] = useState<Programa[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [
    programaSeleccionadoTieneModulos,
    setProgramaSeleccionadoTieneModulos,
  ] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  // Archivo previo subido
  const [existingFilepath, setExistingFilepath] = useState<string | null>(null);
  const [existingOriginalName, setExistingOriginalName] = useState<
    string | null
  >(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const isEditMode = !!id;

  const inputErrorClass = (invalid: boolean) =>
    invalid
      ? "border-red-500 focus-visible:ring-red-500 bg-red-50/10 focus:border-red-500"
      : "border-slate-200 focus-visible:ring-blue-600 focus:border-blue-600 transition-all duration-200";

  const handleGoBack = () => {
    navigate(`/adjunto/`);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!id) return;

    try {
      setIsDownloading(true);
      const response = await getAdjuntoById(+id);
      const { result, data, message } = response;
      if (result && data) {
        const adjunto = data as Adjunto;
        const { filename } = adjunto;
        if (filename) {
          await downloadAdjunto(+id, filename);
          showToast("success", message || "Descarga iniciada correctamente");
        }
      } else {
        showToast(
          "error",
          message || "Error al procesar la descarga del archivo",
        );
      }
    } catch (error) {
      console.error("Error al descargar el archivo", error);
      showToast("error", "No se pudo descargar el archivo actual.");
    } finally {
      setIsDownloading(false);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idPrograma: "",
      idModulo: null,
      nombre: "",
      tipo: "FILE",
      adjunto_file: null,
      url: "",
    },
  });

  const watchIdPrograma = form.watch("idPrograma");
  const watchTipoAdjunto = form.watch("tipo");
  const watchFile = form.watch("adjunto_file");
  const { isSubmitting } = form.formState;

  useEffect(() => {
    const handleProgramaChange = async () => {
      if (!watchIdPrograma) {
        setModulos([]);
        setProgramaSeleccionadoTieneModulos(false);
        form.setValue("idModulo", null);
        return;
      }

      try {
        const response = await getModulosByPrograma(+watchIdPrograma);
        const { result, data } = response;

        if (result && data && data.length > 0) {
          setModulos(data);
          setProgramaSeleccionadoTieneModulos(true);
        } else {
          setModulos([]);
          setProgramaSeleccionadoTieneModulos(false);
          form.setValue("idModulo", null);
        }
      } catch (error) {
        console.error("Error al cargar módulos", error);
        showToast(
          "error",
          "Ocurrió un error inesperado al buscar los módulos del programa.",
        );
        setModulos([]);
        setProgramaSeleccionadoTieneModulos(false);
        form.setValue("idModulo", null);
      }
    };

    handleProgramaChange();
  }, [watchIdPrograma, form, showToast]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoadingData(true);
      try {
        const responseProgramas = await getProgramas();
        if (responseProgramas.result && responseProgramas.data) {
          setProgramas(responseProgramas.data as Programa[]);
        }

        if (isEditMode && id) {
          const responseAdjunto = await getAdjuntoById(+id);
          const { result, data } = responseAdjunto;

          if (result && data) {
            const adjunto = data as Adjunto;

            setExistingFilepath(adjunto.filepath || null);
            setExistingOriginalName(adjunto.originalname || null);

            form.reset({
              idPrograma: adjunto.id_programa?.toString() || "",
              idModulo: adjunto.id_modulo?.toString() || null,
              nombre: adjunto.titulo,
              tipo: adjunto.tipo || "FILE",
              url: adjunto.url || "",
              adjunto_file: null,
            });
          }
        }
      } catch (error) {
        console.error("Error al obtener datos iniciales", error);
        showToast("error", "Error al cargar los datos del formulario.");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchInitialData();
  }, [id, isEditMode, form, showToast]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      form.setValue("adjunto_file", e.dataTransfer.files[0], {
        shouldValidate: true,
      });
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const fechaActual = formatInTimeZone(
      new Date(),
      TIMEZONE_AMERICA_LIMA,
      "yyyy-MM-dd",
    );

    try {
      const formData = new FormData();
      const { idPrograma, idModulo, nombre, tipo, url, adjunto_file } = values;

      if (isEditMode && id) {
        formData.append("fecha_actualiza", fechaActual);
        formData.append("_method", "PATCH");
      } else {
        formData.append("fecha_crea", fechaActual);
      }

      formData.append("titulo", nombre);
      formData.append("id_programa", idPrograma);
      formData.append("tipo", tipo);

      if (programaSeleccionadoTieneModulos && idModulo) {
        formData.append("id_modulo", idModulo);
      } else {
        formData.append("id_modulo", "");
      }

      if (tipo === "FILE") {
        if (adjunto_file) {
          formData.append("file", adjunto_file);
        }
      } else if (url) {
        formData.append("url", url);
      }

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      const response =
        isEditMode && id
          ? await updateAdjunto(+id, formData, config)
          : await createAdjunto(formData, config);

      const { result, message } = response;

      if (response && result) {
        showToast(
          "success",
          message ||
            (isEditMode ? "Adjunto actualizado" : "Adjunto registrado"),
        );
        navigate(`/adjunto`);
      } else {
        showToast("error", message || "Error al procesar el adjunto");
      }
    } catch (error) {
      console.error("Error al registrar adjunto", error);
      showToast("error", "Error crítico al registrar el adjunto");
    }
  };

  const tiposOpciones: {
    id: TipoAdjunto;
    label: string;
    sublabel: string;
    icon: React.ElementType;
    color: string;
  }[] = [
    {
      id: "FILE",
      label: "Documento Local",
      sublabel: "PDF, Word, Excel",
      icon: Paperclip,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      id: "YOUTUBE",
      label: "Video de YouTube",
      sublabel: "Enlace o URL de video",
      icon: Youtube,
      color: "text-red-600 bg-red-50 border-red-200",
    },
    {
      id: "DRIVE",
      label: "Google Drive",
      sublabel: "Carpeta o archivo en la nube",
      icon: HardDrive,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      id: "URL",
      label: "Enlace Externo",
      sublabel: "URL descargable o web",
      icon: Link2,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto py-5 px-4 sm:px-6">
      <Card className="shadow-sm border border-slate-200/80 bg-white rounded-xl overflow-hidden">
        {/* Cabecera */}
        <CardHeader className="border-b border-slate-100 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-50/50 gap-3">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-semibold text-slate-800 tracking-tight flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                <FileText className="h-4 w-4" />
              </span>
              {isEditMode ? "Editar Adjunto" : "Nuevo Recurso / Adjunto"}
            </CardTitle>
            <CardDescription className="text-slate-500 text-[11px] font-normal pl-8">
              {isEditMode
                ? "Modifique el archivo, enlace o ubicación del recurso"
                : "Asigne un documento o enlace externo a un programa académico"}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={handleGoBack}
            className="border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg px-3 h-8 text-xs font-medium transition-colors shadow-none"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
            Volver al listado
          </Button>
        </CardHeader>

        <CardContent className="px-6 sm:px-8 relative pt-6">
          {isLoadingData && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10">
              <Spinner className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Sección 01: Relación Institucional */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] font-semibold">
                    1
                  </span>
                  <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Relación Institucional y Metadatos
                  </h3>
                  <div className="h-px bg-slate-100 flex-1"></div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="idPrograma"
                    render={({ field, fieldState }) => (
                      <FormItem className="w-full">
                        <RequiredLabel isRequired={true}>
                          Programa académico Programa académico
                        </RequiredLabel>
                        <SearchableCombobox<Programa>
                          placeholder="Buscar un programa"
                          options={programas}
                          value={field.value}
                          onChange={field.onChange}
                          displayKey="titulo"
                          valueKey="id"
                          searchKeys={["titulo"]}
                          isInvalid={fieldState.invalid}
                          renderOption={(programa) => (
                            <span className="text-xs font-medium text-slate-800">
                              {programa.titulo} |{" "}
                              {programa.tipo_programa.nombre}
                            </span>
                          )}
                        />
                        <FormMessage className="text-xs font-medium text-red-500" />
                      </FormItem>
                    )}
                  />

                  {programaSeleccionadoTieneModulos && (
                    <FormField
                      control={form.control}
                      name="idModulo"
                      render={({ field, fieldState }) => (
                        <FormItem className="w-full">
                          <RequiredLabel isRequired={true}>
                            Módulo del Programa
                          </RequiredLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? ""}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={`h-9 rounded-lg shadow-none w-full text-left ${inputErrorClass(fieldState.invalid)}`}
                              >
                                <SelectValue placeholder="Seleccione el módulo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-lg shadow-md border-slate-200 max-h-52">
                              {modulos.map((m) => (
                                <SelectItem
                                  value={m.id.toString()}
                                  key={m.id}
                                  className="cursor-pointer text-xs focus:bg-slate-50 rounded-md py-1.5"
                                >
                                  {m.titulo || `Módulo ${m.id}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs font-medium text-red-500" />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field, fieldState }) => (
                      <FormItem className="w-full">
                        <RequiredLabel isRequired={true}>
                          Nombre o Título del Recurso
                        </RequiredLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej. Sílabo del curso, Grabación Clase 1, Carpeta Drive"
                            autoComplete="off"
                            maxLength={150}
                            {...field}
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
                </div>
              </div>

              {/* Sección 02: Tipo y Origen del Recurso */}
              <div className="space-y-4 pt-1">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] font-semibold">
                    2
                  </span>
                  <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Tipo y Origen del Adjunto
                  </h3>
                  <div className="h-px bg-slate-100 flex-1"></div>
                </div>

                {/* Selector de tipo de adjunto */}
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {tiposOpciones.map((tipo) => {
                          const Icon = tipo.icon;
                          const isSelected = field.value === tipo.id;
                          return (
                            <button
                              type="button"
                              key={tipo.id}
                              onClick={() => field.onChange(tipo.id)}
                              className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20 shadow-xs"
                                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                              }`}
                            >
                              <div
                                className={`p-2 rounded-lg mb-2 border ${tipo.color}`}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <span className="text-xs font-semibold text-slate-800">
                                {tipo.label}
                              </span>
                              <span className="text-[10px] text-slate-500 leading-tight mt-0.5">
                                {tipo.sublabel}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </FormItem>
                  )}
                />

                {/* Renderizado condicional según tipo de adjunto */}
                {watchTipoAdjunto === "FILE" ? (
                  <FormField
                    control={form.control}
                    name="adjunto_file"
                    render={({ field, fieldState }) => (
                      <FormItem className="w-full animate-in fade-in duration-200">
                        <FormControl>
                          <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative border border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group text-center
                              ${isDragActive ? "border-blue-500 bg-blue-50/30" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"}
                              ${fieldState.invalid ? "border-red-300 bg-red-50/10 hover:border-red-400" : ""}
                            `}
                          >
                            <input
                              ref={fileInputRef}
                              type="file"
                              className="hidden"
                              accept=".pdf,.docx,.xlsx"
                              onChange={(e) =>
                                field.onChange(e.target.files?.[0] ?? null)
                              }
                            />

                            {watchFile ? (
                              <>
                                <div className="p-2.5 rounded-full bg-emerald-50 text-emerald-600 shadow-none">
                                  <FileCheck className="h-6 w-6" />
                                </div>
                                <div className="space-y-0.5">
                                  <p className="text-xs font-medium text-slate-800 line-clamp-1 max-w-md px-4">
                                    {watchFile.name}
                                  </p>
                                  <p className="text-[11px] text-slate-400 font-medium">
                                    Tamaño: {formatBytes(watchFile.size)}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    field.onChange(null);
                                    if (fileInputRef.current)
                                      fileInputRef.current.value = "";
                                  }}
                                  className="mt-0.5 h-7 rounded-md text-red-500 hover:text-red-600 hover:bg-red-50 text-[11px] px-2.5 font-medium shadow-none"
                                >
                                  Quitar archivo seleccionado
                                </Button>
                              </>
                            ) : existingFilepath ? (
                              <>
                                <div className="p-2.5 rounded-full bg-blue-50 text-blue-600 shadow-none">
                                  <FileText className="h-6 w-6" />
                                </div>
                                <div className="space-y-0.5">
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                    Archivo actualmente guardado:
                                  </p>
                                  <p className="text-xs font-medium text-slate-700 line-clamp-1 max-w-md px-4">
                                    {existingOriginalName ||
                                      "Ver archivo actual"}
                                  </p>

                                  <Button
                                    type="button"
                                    variant="link"
                                    disabled={isDownloading}
                                    onClick={handleDownload}
                                    className="inline-flex items-center gap-1 mt-1 text-[11px] text-blue-600 hover:text-blue-800 underline font-medium h-auto p-0 shadow-none"
                                  >
                                    {isDownloading ? (
                                      <>
                                        <Spinner className="h-3 w-3 animate-spin text-blue-600" />
                                        Descargando...
                                      </>
                                    ) : (
                                      <>
                                        Descargar archivo actual{" "}
                                        <Download className="h-3 w-3 ml-0.5" />
                                      </>
                                    )}
                                  </Button>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1 italic">
                                  Arrastre o haga clic aquí si desea{" "}
                                  <span className="font-medium text-slate-500">
                                    reemplazar
                                  </span>{" "}
                                  este archivo.
                                </p>
                              </>
                            ) : (
                              <>
                                <div className="p-2.5 rounded-full bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors shadow-none">
                                  <UploadCloud className="h-6 w-6" />
                                </div>
                                <div className="space-y-0.5">
                                  <p className="text-xs font-medium text-slate-700">
                                    Suelte su archivo aquí o{" "}
                                    <span className="text-blue-600 group-hover:text-blue-700 underline underline-offset-2">
                                      explore localmente
                                    </span>
                                  </p>
                                  <p className="text-[11px] text-slate-400 font-normal">
                                    Soporta PDF, Word (.docx) o Excel (.xlsx) de
                                    hasta 5MB.
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage className="text-[11px] text-red-500 font-medium mt-1" />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field, fieldState }) => (
                      <FormItem className="flex flex-col gap-1 w-full animate-in fade-in duration-200">
                        <RequiredLabel>
                          <span className="text-xs font-medium text-slate-700">
                            {watchTipoAdjunto === "YOUTUBE" &&
                              "Enlace del Video de YouTube"}
                            {watchTipoAdjunto === "DRIVE" &&
                              "Enlace de Compartición de Google Drive"}
                            {watchTipoAdjunto === "URL" &&
                              "Enlace de Descarga / URL Externa"}
                          </span>
                        </RequiredLabel>
                        <FormControl>
                          <div className="relative flex items-center">
                            <Input
                              placeholder={
                                watchTipoAdjunto === "YOUTUBE"
                                  ? "https://www.youtube.com/watch?v=..."
                                  : watchTipoAdjunto === "DRIVE"
                                    ? "https://drive.google.com/file/d/..."
                                    : "https://ejemplo.com/recurso.pdf"
                              }
                              autoComplete="off"
                              {...field}
                              className={`h-9 pl-9 rounded-lg shadow-none placeholder:text-slate-400 text-xs ${inputErrorClass(fieldState.invalid)}`}
                            />
                            <div className="absolute left-3 pointer-events-none text-slate-400">
                              {watchTipoAdjunto === "YOUTUBE" && (
                                <Youtube className="h-4 w-4 text-red-500" />
                              )}
                              {watchTipoAdjunto === "DRIVE" && (
                                <HardDrive className="h-4 w-4 text-emerald-500" />
                              )}
                              {watchTipoAdjunto === "URL" && (
                                <Link2 className="h-4 w-4 text-amber-500" />
                              )}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-[11px] text-red-500 font-medium" />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSubmitting}
                  onClick={() => {
                    form.reset();
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Limpiar campos
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
                  {isEditMode ? "Guardar Cambios" : "Registrar"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
