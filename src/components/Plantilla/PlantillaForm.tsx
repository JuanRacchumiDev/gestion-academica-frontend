import { getInstituciones } from "@/services/institucionService";
import { Institucion } from "../../interfaces/IInstitucion";
import z from "zod";
import { MAX_FILE_IMAGE_2M_SIZE, MAX_FILE_PDF_SIZE } from "@/params/constants";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/context/ToastContext";
import { useEffect, useState } from "react";
import { DetalleParametro } from "@/interfaces/IDetalleParametro";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ParametroClase } from "@/params/parametroClase";
import { getDetalles } from "@/services/detalleParametroService";
import {
  createPlantilla,
  getPlantillaById,
  updatePlantilla,
} from "@/services/plantillaService";
import { Plantilla, PlantillaResponse } from "@/interfaces/IPlantilla";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  ImageIcon,
  Save,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { Spinner } from "../Common/Spinner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { RequiredLabel } from "../Common/RequiredLabel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import SearchableCombobox from "../Common/SearchableCombobox";
import { Input } from "../ui/input";

interface PlantillaTemp {
  plantilla: {
    institucion: {
      id: number;
    };
    sucursal: {
      id: number;
    };
    tipoPrograma: {
      codigo: number;
    };
    nombre: string;
    disenioDefault: string;
    tipoDisenio: string;
    pathImagenFondo: string;
    pathImagenPublica: string;
    pathPdfFondo: string;
  };
  hasImagenFondo?: boolean;
  hasImagenPublica?: boolean;
  hasPdfFondo?: boolean;
}

const loadInstituciones = async () => {
  let listInstituciones: Institucion[] = [];
  const queryParams = `is_cliente=true&estado=true`;
  const response = await getInstituciones(queryParams);
  const { result, data } = response;

  if (result && data) {
    listInstituciones = data as Institucion[];
  }

  return listInstituciones;
};

const loadSucursales = async () => {
  let listSucursales: Institucion[] = [];
  const queryParams = `is_cliente=false&estado_true`;
  const response = await getInstituciones(queryParams);
  const { result, data } = response;

  if (result && data) {
    listSucursales = data as Institucion[];
  }

  return listSucursales;
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

const formSchema = z.object({
  idSucursal: z
    .string({
      message: "La sucursal es requerida",
    })
    .min(1, "La sucursal es requerida"),
  idInstitucion: z.string().optional().or(z.literal("")),
  codigoTipoPrograma: z
    .string({
      message: "El tipo de programa es requerido",
    })
    .min(1, "El tipo de programa es requerido"),
  disenioDefault: z
    .string({
      message: "El nombre de diseño por defecto es requerido",
    })
    .min(3, { message: "El nombre de diseño por defecto es requerido" }),
  tipoDisenio: z
    .string({
      message: "El tipo de diseño es requerido",
    })
    .min(3, { message: "El tipo de diseño es requerido" }),
  nombre: z
    .string({
      message: "El nombre es obligatorio (mínimo 3 caracteres)",
    })
    .min(3, {
      message: "El nombre es obligatorio (mínimo 3 caracteres)",
    }),
  imgFondo: z
    .instanceof(File)
    .nullable()
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_FILE_IMAGE_2M_SIZE,
      `El archivo debe ser menor a 2MB`,
    )
    .refine(
      (file) =>
        !file ||
        file.type === "image/png" ||
        file.type === "image/jpeg" ||
        file.type === "image/jpg",
      `El archivo debe ser una imagen válida (PNG, JPG)`,
    ),
  imgPublica: z
    .instanceof(File)
    .nullable()
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_FILE_IMAGE_2M_SIZE,
      `El archivo debe ser menor a 2MB`,
    )
    .refine(
      (file) =>
        !file ||
        file.type === "image/png" ||
        file.type === "image/jpeg" ||
        file.type === "image/jpg",
      `El archivo debe ser una imagen válida (PNG, JPG)`,
    ),
  pdfFondo: z
    .instanceof(File)
    .nullable()
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_FILE_PDF_SIZE,
      `El archivo debe ser menor a 50MB`,
    )
    .refine(
      (file) => !file || file.type === "application/pdf",
      `El archivo debe ser un formato PDF`,
    ),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  idInstitucion: "",
  idSucursal: "",
  codigoTipoPrograma: "",
  disenioDefault: "",
  tipoDisenio: "",
  nombre: "",
  imgFondo: null,
  imgPublica: null,
  pdfFondo: null,
};

export const PlantillaForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [sucursales, setSucursales] = useState<Institucion[]>([]);
  const [tipoProgramas, setTipoProgramas] = useState<DetalleParametro[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const isEditMode = !!id;

  // Estados para almacenar las rutas y flags de archivos existentes en el backend
  const [fileStatus, setFileStatus] = useState({
    hasImagenFondo: false,
    pathImagenFondo: "",
    hasImagenPublica: false,
    pathImagenPublica: "",
    hasPdfFondo: false,
    pathPdfFondo: "",
  });

  const handleGoBack = () => {
    const urlBack = `/plantilla/`;
    navigate(urlBack);
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);

      try {
        const [listInstituciones, listSucursales, listTipoProgramas] =
          await Promise.all([
            loadInstituciones(),
            loadSucursales(),
            loadTipoProgramas(),
          ]);

        setInstituciones(listInstituciones);
        setSucursales(listSucursales);
        setTipoProgramas(listTipoProgramas);

        if (isEditMode && id) {
          const responsePlantilla = await getPlantillaById(+id);

          console.log({ responsePlantilla });

          const { status, statusText, data } = responsePlantilla;

          if ((status === 200 || status === 201) && statusText === "OK") {
            const plantillaTemp = data as PlantillaTemp;
            const { plantilla, hasImagenFondo, hasImagenPublica, hasPdfFondo } =
              plantillaTemp;

            form.reset({
              idInstitucion: plantilla.institucion?.id.toString() ?? "",
              idSucursal: plantilla.sucursal?.id.toString() ?? "",
              codigoTipoPrograma:
                plantilla.tipoPrograma?.codigo.toString() ?? "",
              nombre: plantilla.nombre ?? "",
              disenioDefault: plantilla.disenioDefault ?? "",
              tipoDisenio: plantilla.tipoDisenio ?? "",
            });

            // Guardar el estado de los archivos adjuntos
            setFileStatus({
              hasImagenFondo: !!hasImagenFondo,
              pathImagenFondo: plantilla.pathImagenFondo ?? "",
              hasImagenPublica: !!hasImagenPublica,
              pathImagenPublica: plantilla.pathImagenPublica ?? "",
              hasPdfFondo: !!hasPdfFondo,
              pathPdfFondo: plantilla.pathPdfFondo ?? "",
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
  }, [id, isEditMode, form, showToast]);

  const STORAGE_URL =
    import.meta.env.VITE_NEST_API_URL || "http://localhost:3004";

  const resetForm = () => {
    form.reset(defaultValues);
  };

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = new FormData();
      const {
        idInstitucion,
        idSucursal,
        codigoTipoPrograma,
        disenioDefault,
        tipoDisenio,
        nombre,
        imgFondo,
        imgPublica,
        pdfFondo,
      } = values;

      if (idInstitucion) {
        formData.append("id_institucion", idInstitucion);
      }
      formData.append("id_sucursal", idSucursal);
      formData.append("codigo_tipoprograma", codigoTipoPrograma);
      formData.append("disenio_default", disenioDefault);
      formData.append("tipo_disenio", tipoDisenio);
      formData.append("nombre", nombre);

      if (imgFondo) {
        formData.append("path_imagen_fondo", imgFondo);
      }
      if (imgPublica) {
        formData.append("path_imagen_publica", imgPublica);
      }
      if (pdfFondo) {
        formData.append("path_pdf_fondo", pdfFondo);
      }

      formData.append("estado", "true");

      let response = null;
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      if (isEditMode && id) {
        response = await updatePlantilla(+id, formData, config);
      } else {
        response = await createPlantilla(formData, config);
      }

      console.log({ response });

      const { status, statusText } = response;

      if (status === 200 || status === 201) {
        showToast(
          "success",
          isEditMode
            ? "Certificado actualizado correctamente"
            : "Certificado registrado correctamente.",
        );
        handleGoBack();
      } else {
        showToast("error", statusText || "Error al guardar el certificado.");
      }
    } catch (error) {
      console.error("Error al registrar plantilla", error);
      showToast("error", "Error al registrar la plantilla");
    }
  };

  // Opciones para el SearchableCombobox incluyendo la opción "Ninguno"
  const institucionesConNinguno: Institucion[] = [
    { id: "" as any, nombre: "Ninguno" },
    ...instituciones,
  ];

  return (
    <Card className="shadow-xl border-none bg-white">
      <CardHeader className="border-b border-gray-100 p-6 flex flex-row items-center justify-between bg-gray-50/50 rounded-t-xl">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-extrabold text-slate-800 tracking-tight">
            {isEditMode ? "Editar plantilla" : "Nuevo Registro de plantilla"}
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            {isEditMode
              ? "Actualización de información de plantilla"
              : "Complete la información para registrar una plantilla"}
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

      <CardContent className="px-6 sm:px-8 pb-6 pt-6 relative">
        {isLoadingData && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10">
            <Spinner className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* AGRUPACIÓN 1: CAMPOS GENERALES / TEXTO / SELECTS */}
            <fieldset className="border border-slate-200 rounded-xl p-5 bg-slate-50/30">
              <legend className="text-sm font-bold text-slate-700 px-3 bg-white border border-slate-200 rounded-md shadow-sm">
                Información General
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 mt-3">
                {/* SUCURSAL */}
                <FormField
                  control={form.control}
                  name="idSucursal"
                  render={({ field, fieldState }) => (
                    <FormItem className="w-full">
                      <RequiredLabel isRequired={true}>Sucursal</RequiredLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={`w-full h-10 transition-all bg-white ${
                              fieldState.invalid
                                ? "border-red-400 focus:ring-red-100"
                                : "border-slate-200 focus:ring-blue-100 focus:border-blue-500"
                            }`}
                          >
                            <SelectValue placeholder="Seleccionar sucursal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white text-xs border border-slate-200 shadow-md outline-none">
                          {sucursales.map((sucursal: any) => (
                            <SelectItem
                              value={sucursal.id!.toString()}
                              key={sucursal.id!.toString()}
                              className="cursor-pointer hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold transition-colors"
                            >
                              {sucursal.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs font-medium text-red-500" />
                    </FormItem>
                  )}
                />

                {/* INSTITUCIÓN - SearchableCombobox con opción "Ninguno" */}
                <FormField
                  control={form.control}
                  name="idInstitucion"
                  render={({ field, fieldState }) => (
                    <FormItem className="w-full">
                      <RequiredLabel isRequired={false}>
                        Institución
                      </RequiredLabel>
                      <div className="[&>div>button]:h-10 [&>div>button]:py-2">
                        <SearchableCombobox<Institucion>
                          placeholder="Buscar una institución o Ninguno"
                          options={institucionesConNinguno}
                          value={field.value}
                          onChange={field.onChange}
                          displayKey="nombre"
                          valueKey="id"
                          searchKeys={["nombre"]}
                          isInvalid={fieldState.invalid}
                          renderOption={(institucion) => (
                            <span
                              className={`font-semibold ${
                                institucion.nombre === "Ninguno"
                                  ? "text-slate-400 italic"
                                  : "text-gray-900"
                              }`}
                            >
                              {institucion.nombre}
                            </span>
                          )}
                        />
                      </div>
                      <FormMessage className="text-xs font-medium text-red-500" />
                    </FormItem>
                  )}
                />

                {/* TIPO PROGRAMA */}
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
                            className={`w-full h-10 transition-all bg-white ${
                              fieldState.invalid
                                ? "border-red-400 focus:ring-red-100"
                                : "border-slate-200 focus:ring-blue-100 focus:border-blue-500"
                            }`}
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

                {/* DISEÑO POR DEFECTO */}
                <FormField
                  control={form.control}
                  name="disenioDefault"
                  render={({ field, fieldState }) => (
                    <FormItem className="w-full">
                      <RequiredLabel isRequired={true}>
                        Nombre diseño por defecto
                      </RequiredLabel>
                      <FormControl>
                        <Input
                          placeholder="Plantilla Oficial 2026"
                          autoComplete="off"
                          maxLength={120}
                          {...field}
                          value={field.value ?? ""}
                          className={`h-10 transition-all bg-white ${
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

                {/* TIPO DE DISEÑO */}
                <FormField
                  control={form.control}
                  name="tipoDisenio"
                  render={({ field, fieldState }) => (
                    <FormItem className="w-full">
                      <RequiredLabel isRequired={true}>
                        Tipo de diseño
                      </RequiredLabel>
                      <FormControl>
                        <Input
                          placeholder="Plantilla Oficial 2026"
                          autoComplete="off"
                          maxLength={120}
                          {...field}
                          value={field.value ?? ""}
                          className={`h-10 transition-all bg-white ${
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

                {/* NOMBRE */}
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field, fieldState }) => (
                    <FormItem className="w-full md:col-span-2 lg:col-span-2">
                      <RequiredLabel isRequired={true}>
                        Nombre de Plantilla
                      </RequiredLabel>
                      <FormControl>
                        <Input
                          placeholder="Plantilla Oficial 2026"
                          autoComplete="off"
                          maxLength={120}
                          {...field}
                          value={field.value ?? ""}
                          className={`h-10 transition-all bg-white ${
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
            </fieldset>

            {/* AGRUPACIÓN 2: CAMPOS DE ARCHIVOS / MULTIPART FILES */}
            <fieldset className="border border-slate-200 rounded-xl p-5 bg-slate-50/30">
              <legend className="text-sm font-bold text-slate-700 px-3 bg-white border border-slate-200 rounded-md shadow-sm">
                Archivos y Recursos Multimedia
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 mt-3">
                {/* 1. IMAGEN DE FONDO (IMG) */}
                <FormField
                  control={form.control}
                  name="imgFondo"
                  render={({ field, fieldState }) => {
                    const selectedFile = field.value as File | null;
                    return (
                      <FormItem className="flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <RequiredLabel>Imagen de Fondo</RequiredLabel>
                            {fileStatus.hasImagenFondo && (
                              <a
                                href={`${STORAGE_URL}/${fileStatus.pathImagenFondo}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-[11px] font-semibold transition-colors"
                                title="Ver archivo actual"
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                                Ver actual
                              </a>
                            )}
                          </div>

                          <FormControl>
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={(e) =>
                                  field.onChange(e.target.files?.[0] ?? null)
                                }
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <div
                                className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all bg-white hover:bg-slate-50 min-h-[140px] ${
                                  fieldState.invalid
                                    ? "border-red-400 bg-red-50/20"
                                    : selectedFile
                                      ? "border-emerald-400 bg-emerald-50/20"
                                      : "border-slate-300 hover:border-blue-400"
                                }`}
                              >
                                {selectedFile ? (
                                  <div className="flex flex-col items-center space-y-2 p-1">
                                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
                                      <CheckCircle2 className="h-5 w-5" />
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
                                    <span className="text-[11px] text-blue-600 font-medium hover:underline">
                                      Cambiar imagen
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center space-y-1.5">
                                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-full">
                                      <UploadCloud className="h-5 w-5" />
                                    </div>
                                    <p className="text-xs font-semibold text-slate-700">
                                      Subir imagen de fondo
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                      PNG, JPG (Máx. 2MB)
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </FormControl>
                        </div>
                        <FormMessage className="text-xs font-medium text-red-500 mt-1" />
                      </FormItem>
                    );
                  }}
                />

                {/* 2. IMAGEN PÚBLICA (IMG) */}
                <FormField
                  control={form.control}
                  name="imgPublica"
                  render={({ field, fieldState }) => {
                    const selectedFile = field.value as File | null;
                    return (
                      <FormItem className="flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <RequiredLabel>Imagen Pública</RequiredLabel>
                            {fileStatus.hasImagenPublica && (
                              <a
                                href={`${STORAGE_URL}/${fileStatus.pathImagenPublica}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-[11px] font-semibold transition-colors"
                                title="Ver archivo actual"
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                                Ver actual
                              </a>
                            )}
                          </div>

                          <FormControl>
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={(e) =>
                                  field.onChange(e.target.files?.[0] ?? null)
                                }
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <div
                                className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all bg-white hover:bg-slate-50 min-h-[140px] ${
                                  fieldState.invalid
                                    ? "border-red-400 bg-red-50/20"
                                    : selectedFile
                                      ? "border-emerald-400 bg-emerald-50/20"
                                      : "border-slate-300 hover:border-blue-400"
                                }`}
                              >
                                {selectedFile ? (
                                  <div className="flex flex-col items-center space-y-2 p-1">
                                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
                                      <CheckCircle2 className="h-5 w-5" />
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
                                    <span className="text-[11px] text-blue-600 font-medium hover:underline">
                                      Cambiar imagen
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center space-y-1.5">
                                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-full">
                                      <UploadCloud className="h-5 w-5" />
                                    </div>
                                    <p className="text-xs font-semibold text-slate-700">
                                      Subir imagen pública
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                      PNG, JPG (Máx. 2MB)
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </FormControl>
                        </div>
                        <FormMessage className="text-xs font-medium text-red-500 mt-1" />
                      </FormItem>
                    );
                  }}
                />

                {/* 3. FONDO PDF (PDF) */}
                <FormField
                  control={form.control}
                  name="pdfFondo"
                  render={({ field, fieldState }) => {
                    const selectedFile = field.value as File | null;
                    return (
                      <FormItem className="flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <RequiredLabel>Fondo en PDF</RequiredLabel>
                            {fileStatus.hasPdfFondo && (
                              <a
                                href={`${STORAGE_URL}/${fileStatus.pathPdfFondo}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-[11px] font-semibold transition-colors"
                                title="Ver archivo actual"
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                                Ver PDF actual
                              </a>
                            )}
                          </div>

                          <FormControl>
                            <div className="relative">
                              <input
                                type="file"
                                accept="application/pdf"
                                onChange={(e) =>
                                  field.onChange(e.target.files?.[0] ?? null)
                                }
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <div
                                className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all bg-white hover:bg-slate-50 min-h-[140px] ${
                                  fieldState.invalid
                                    ? "border-red-400 bg-red-50/20"
                                    : selectedFile
                                      ? "border-emerald-400 bg-emerald-50/20"
                                      : "border-slate-300 hover:border-blue-400"
                                }`}
                              >
                                {selectedFile ? (
                                  <div className="flex flex-col items-center space-y-2 p-1">
                                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
                                      <CheckCircle2 className="h-5 w-5" />
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
                                    <span className="text-[11px] text-blue-600 font-medium hover:underline">
                                      Cambiar PDF
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center space-y-1.5">
                                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-full">
                                      <UploadCloud className="h-5 w-5" />
                                    </div>
                                    <p className="text-xs font-semibold text-slate-700">
                                      Subir documento PDF
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                      Formato PDF (Máx. 50MB)
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </FormControl>
                        </div>
                        <FormMessage className="text-xs font-medium text-red-500 mt-1" />
                      </FormItem>
                    );
                  }}
                />
              </div>
            </fieldset>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex items-center justify-end gap-3 pt-4">
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
