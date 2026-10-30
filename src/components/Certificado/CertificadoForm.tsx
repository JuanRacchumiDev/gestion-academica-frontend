import { useEffect, useRef, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  Certificado,
  CertificadoResponseGeneral,
} from "../../interfaces/ICertificado";

// Componentes UI de Shadcn
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

// Iconos Lucide
import {
  Award,
  Users,
  BookOpen,
  Layers,
  Building2,
  FileCheck,
  Type,
  ArrowLeft,
  Save,
  Loader2,
  RotateCcw,
  ImageIcon,
  FileSpreadsheet,
  Eye,
  XCircle,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "../ui/form";
import { RequiredLabel } from "../Common/RequiredLabel";
import SearchableCombobox from "../Common/SearchableCombobox";

// Interfaces
import {
  DetalleParametro,
  DetalleParametroFilters,
} from "../../interfaces/IDetalleParametro";
import { Institucion } from "../../interfaces/IInstitucion";
import { Persona } from "../../interfaces/IPersona";
import { Programa } from "../../interfaces/IPrograma";
import { Modulo } from "../../interfaces/IModulo";
import { Plantilla } from "../../interfaces/IPlantilla";

// Servicios
import {
  createCertificado,
  getCertificadoById,
  updateCertificado,
} from "../../services/certificadoService";
import {
  getDetalles,
  getDetalleByParams,
} from "../../services/detalleParametroService";
import { getInstituciones } from "../../services/institucionService";
import { getPersonas } from "../../services/personaService";
import { getProgramas } from "../../services/programaService";
import { getModulosByPrograma } from "../../services/moduloService";
import { getPlantillas } from "../../services/plantillaService";
import { ParametroClase } from "../../params/parametroClase";
import z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Spinner } from "../Common/Spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { capitalize, getStorageUrl } from "@/utils/stringUtils";

const loadGrupoPersonas = async (): Promise<DetalleParametro[]> => {
  let grupos: DetalleParametro[] = [];

  const queryParams = `parametro_clase=${ParametroClase.GRUPO}&estado=true`;

  try {
    const response = await getDetalles(queryParams);

    const { result, data } = response;

    if (result && data) {
      grupos = data as DetalleParametro[];
    }

    return grupos;
  } catch (error) {
    console.error("Error al obtener grupo de personas", error);
    return [];
  }
};

const loadPersonas = async (nombreGrupo?: string): Promise<Persona[]> => {
  if (!nombreGrupo) return [];

  let personas: Persona[] = [];

  try {
    const response = await getPersonas(nombreGrupo);

    const { result, data } = response;

    if (result && data) {
      personas = data as Persona[];
    }

    return personas;
  } catch (error) {
    console.error("Error al obtener personas", error);
    return [];
  }
};

const loadTipoProgramas = async (): Promise<DetalleParametro[]> => {
  let tipoProgramas: DetalleParametro[] = [];

  const queryParams = `parametro_clase=${ParametroClase.TIPO_PROGRAMA}&estado=true`;

  try {
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

const loadInstituciones = async (): Promise<Institucion[]> => {
  let instituciones: Institucion[] = [];

  const queryParams = `is_cliente=true`;

  try {
    const response = await getInstituciones(queryParams);

    const { result, data } = response;

    if (result && data) {
      instituciones = data as Institucion[];
    }

    return instituciones;
  } catch (error) {
    console.error("Error al obtener instituciones", error);
    return [];
  }
};

const loadTipoCertificados = async (): Promise<DetalleParametro[]> => {
  let tipoCertificados: DetalleParametro[] = [];
  const queryParams = `parametro_clase=${ParametroClase.TIPO_CERTIFICADO}&estado=true`;

  try {
    const response = await getDetalles(queryParams);

    const { result, data } = response;

    if (result && data) {
      tipoCertificados = data as DetalleParametro[];
    }

    return tipoCertificados;
  } catch (error) {
    console.error("Error al obtener tipo de certificados", error);
    return [];
  }
};

const loadSucursales = async (): Promise<Institucion[]> => {
  let sucursales: Institucion[] = [];

  const queryParams = `is_cliente=false&estado=true`;

  try {
    const response = await getInstituciones(queryParams);

    const { result, data } = response;

    if (result && data) {
      sucursales = data as Institucion[];
    }

    return sucursales;
  } catch (error) {
    console.error("Error al obtener instituciones", error);
    return [];
  }
};

const formSchema = z.object({
  idGrupoPersona: z
    .string({
      message: "El grupo es requerido",
    })
    .min(1, "El grupo es requerido"),
  codigoTipoCertificado: z
    .string({
      message: "El tipo de certificado es requerido",
    })
    .min(1, "El tipo de certificado es requerido"),
  idPersona: z
    .string({
      message: "La persona es requerida",
    })
    .min(1, "La persona es requerida"),
  idInstitucion: z
    .string({
      message: "La institución es requerida",
    })
    .min(1, "La institución es requerida"),
  codigoTipoPrograma: z
    .string({
      message: "El tpo de programa es requerido",
    })
    .min(1, "El tipo de programa es requerido"),
  idPrograma: z
    .string({
      message: "El programa es requerido",
    })
    .optional(),
  idModulo: z
    .string({
      message: "El módulo es requerido",
    })
    .nullable()
    .optional(),
  idPlantilla: z
    .string({
      message: "Seleccione una plantilla",
    })
    .min(1, "Seleccione una plantilla"),
  nombreImpresion: z
    .string({ message: "El nombre de impresión es requerido" })
    .min(1, "El nombre de impresión es requerido"),
  idSucursal: z
    .string({
      message: "La sucursal es requerida",
    })
    .min(1, "La sucursal es requerida"),
});

type TFormValues = z.infer<typeof formSchema>;

const defaultValues: TFormValues = {
  idGrupoPersona: "",
  codigoTipoCertificado: "",
  idPersona: "",
  idInstitucion: "",
  codigoTipoPrograma: "",
  idPrograma: "",
  idModulo: "",
  idPlantilla: "",
  nombreImpresion: "",
  idSucursal: "",
};

export const CertificadoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  // Flag para evitar reseteos de campos cuando se están poblando datos iniciales en modo edición
  const isInitialLoading = useRef(false);

  // Estados
  const [grupoPersonas, setGrupoPersonas] = useState<DetalleParametro[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [tipoProgramas, setTipoProgramas] = useState<DetalleParametro[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [tipoCertificados, setTipoCertificados] = useState<DetalleParametro[]>(
    [],
  );
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [sucursales, setSucursales] = useState<Institucion[]>([]);

  // Estados de carga
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingPersonas, setIsLoadingPersonas] = useState(false);
  const [isLoadingProgramas, setIsLoadingProgramas] = useState(false);
  const [isLoadingPlantillas, setIsLoadingPlantillas] = useState(false);

  // Modales y vistas previas
  const [previewPlantilla, setPreviewPlantilla] = useState<Plantilla | null>(
    null,
  );

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const isEditMode = !!id;

  const inputErrorClass = (invalid: boolean) =>
    invalid ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500";

  const handleGoBack = () => {
    navigate(`/certificado/`);
  };

  const form = useForm<TFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const selectedGrupoId = useWatch({
    control: form.control,
    name: "idGrupoPersona",
  });

  const selectedTipoProgramaCodigo = useWatch({
    control: form.control,
    name: "codigoTipoPrograma",
  });

  const selectedPersonaId = useWatch({
    control: form.control,
    name: "idPersona",
  });

  const selectedInstitucionId = useWatch({
    control: form.control,
    name: "idInstitucion",
  });

  const selectedPlantillaId = useWatch({
    control: form.control,
    name: "idPlantilla",
  });

  const selectedSucursalId = useWatch({
    control: form.control,
    name: "idSucursal",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      if (isEditMode) isInitialLoading.current = true;

      try {
        const [
          listGrupoPersonas,
          listTipoProgramas,
          listInstituciones,
          listTipoCertificados,
          listSucursales,
        ] = await Promise.all([
          loadGrupoPersonas(),
          loadTipoProgramas(),
          loadInstituciones(),
          loadTipoCertificados(),
          loadSucursales(),
        ]);

        setGrupoPersonas(listGrupoPersonas);
        setTipoProgramas(listTipoProgramas);
        setInstituciones([
          { id: "none" as any, nombre: "Ninguno" },
          ...listInstituciones,
        ]);
        setTipoCertificados(listTipoCertificados);
        setSucursales(listSucursales);

        if (isEditMode && id) {
          const responseCertificado = await getCertificadoById(+id);

          const { result, data } = responseCertificado;

          if (result && data) {
            const certificado = data as Certificado;

            console.log({ certificado });

            // Extraer grupo persona
            const grupoPersonas = certificado.persona.grupos[0];
            const { codigo: codigoGrupo, nombre_url: nombreGrupo } =
              grupoPersonas;
            console.log({ codigoGrupo });

            // Cargar la lista de personas para este grupo
            if (codigoGrupo) {
              const listPersonas = await loadPersonas(nombreGrupo);
              setPersonas(listPersonas);
            }

            // Precargar plantillas antes de resetear el formulario para que el Select encuentre la opción
            const codigoTipoProg =
              certificado.programa?.codigo_tipoprograma?.toString() || "";
            const idInst =
              certificado.plantilla?.id_institucion?.toString() || "none";

            if (codigoTipoProg) {
              const filters: Record<string, any> = {
                codigo_tipoprograma: codigoTipoProg,
              };

              if (idInst && idInst !== "none") {
                filters.id_institucion = idInst;
              }

              console.log("---- filters list plantillas ----");
              console.log({ filters });

              const responsePlantillas = await getPlantillas(filters);
              console.log({ responsePlantillas });

              const { result, data } = responsePlantillas;

              if (result && data) {
                setPlantillas(data as Plantilla[]);
              }
            }

            form.reset({
              idGrupoPersona: codigoGrupo.toString(),
              idPersona: certificado.id_persona?.toString() || "",
              nombreImpresion: certificado.nombre_impresion || "",
              codigoTipoCertificado:
                certificado.codigo_tipocertificado?.toString() || "",
              idInstitucion:
                certificado.plantilla?.id_institucion?.toString() || "none",
              codigoTipoPrograma:
                certificado.programa?.codigo_tipoprograma?.toString() || "",
              idPrograma: certificado.id_programa?.toString() || "",
              idPlantilla: certificado.id_plantilla?.toString() || "",
              idSucursal: certificado.id_sucursal?.toString() || "",
            });
          }
        }
      } catch (error) {
        console.error("Error al obtener datos", error);
        showToast("error", "Error al cargar los datos del formulario.");
      } finally {
        setIsLoadingData(false);
        isInitialLoading.current = false;
      }
    };

    fetchData();
  }, [id, isEditMode]);

  // Cargar plantillas desde el endpoint
  useEffect(() => {
    if (isInitialLoading.current) return;

    const fetchPlantillas = async () => {
      if (!selectedTipoProgramaCodigo) {
        setPlantillas([]);
        form.setValue("idPlantilla", "");
        return;
      }

      setIsLoadingPlantillas(true);

      try {
        // Construimos el objeto de filtros
        const filters: Record<string, any> = {
          codigo_tipoprograma: selectedTipoProgramaCodigo,
        };

        // Si se seleccionó una institución (y no es la opción nula "none")
        if (selectedInstitucionId && selectedInstitucionId !== "none") {
          filters.id_institucion = selectedInstitucionId;
        }

        // Si se seleccionó una sucursal
        if (selectedSucursalId) {
          filters.id_sucursal = selectedSucursalId;
        }

        console.log("---- filters plantillas ----");
        console.log({ filters });

        const response = await getPlantillas(filters);

        const { result, data } = response;

        if (result && data) {
          setPlantillas(data as Plantilla[]);
        } else {
          setPlantillas([]);
        }
      } catch (error) {
        console.error("Error cargando plantillas:", error);
        showToast("error", "Ocurrió un error al obtener las plantillas.");
        setPlantillas([]);
      } finally {
        setIsLoadingPlantillas(false);
        if (!isInitialLoading.current && !isEditMode) {
          form.setValue("idPlantilla", "");
        }
      }
    };

    fetchPlantillas();
  }, [
    selectedTipoProgramaCodigo,
    selectedInstitucionId,
    selectedSucursalId,
    form,
  ]);

  // Visualizador modal de plantilla
  const handleOpenPreview = () => {
    const selectPlantilla = plantillas.find(
      (p) => p.id?.toString() === selectedPlantillaId?.toString(),
    );

    if (selectPlantilla) {
      setPreviewPlantilla(selectPlantilla);
      setIsPreviewOpen(true);
    }
  };

  // Actualizar automáticamente el nombre de impresión al seleccionar persona
  useEffect(() => {
    if (!isEditMode && !id) {
      if (selectedPersonaId && !isInitialLoading.current) {
        const personaSeleccionada = personas.find(
          (p) => p.id?.toString() === selectedPersonaId.toString(),
        );
        if (personaSeleccionada?.nombre_completo) {
          const nombreCapitalized = capitalize(
            personaSeleccionada.nombre_completo,
          );

          form.setValue("nombreImpresion", nombreCapitalized, {
            shouldValidate: true,
          });
        }
      }
    }
  }, [selectedPersonaId, personas, form]);

  // Efecto reactivo: Carga programas según el tipo de programa
  useEffect(() => {
    const fetchProgramasByTipo = async () => {
      if (!selectedTipoProgramaCodigo) {
        setProgramas([]);
        return;
      }

      // console.log({ selectedTipoProgramaCodigo });

      setIsLoadingProgramas(true);

      // Buscar el objeto del tipo de programa
      const selectTipoPrograma = tipoProgramas.find(
        (tipo) => tipo.codigo?.toString() === selectedTipoProgramaCodigo,
      );

      // console.log({ selectTipoPrograma });

      if (selectTipoPrograma) {
        const { programas_por_tipo } = selectTipoPrograma;

        setProgramas((programas_por_tipo || []) as Programa[]);
      } else {
        setProgramas([]);
      }

      setIsLoadingProgramas(false);
    };

    fetchProgramasByTipo();
  }, [selectedTipoProgramaCodigo, tipoProgramas]);

  // Efecto reactivo: Carga personas dinámicamente según el grupo seleccionado
  useEffect(() => {
    const fetchPersonasByGrupo = async () => {
      if (isInitialLoading.current) return;

      if (!selectedGrupoId) {
        setPersonas([]);
        return;
      }

      // Buscar el objeto grupo correspondiente para obtener su nombre o parámetro necesario
      const selectGrupo = grupoPersonas.find(
        (grupo) => grupo.codigo.toString() === selectedGrupoId,
      );

      const nombreGrupo = selectGrupo.nombre_url;
      // console.log({ nombreGrupo });

      setIsLoadingPersonas(true);

      try {
        const listPersonas = await loadPersonas(nombreGrupo);
        setPersonas(listPersonas);
      } catch (error) {
        console.error("Error al cargar personas por grupo", error);
        showToast("error", "No se pudieron obtener las personas del grupo.");
      } finally {
        setIsLoadingPersonas(false);
      }
    };

    fetchPersonasByGrupo();
  }, [selectedGrupoId, grupoPersonas]);

  const resetForm = () => {
    form.reset(defaultValues);
    setPersonas([]);
    setProgramas([]);
    setPlantillas([]);
  };

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: TFormValues) => {
    const {
      codigoTipoCertificado,
      idPersona,
      idPrograma,
      idPlantilla,
      nombreImpresion,
      idSucursal,
    } = values;

    let payload: Certificado = {
      id_persona: +idPersona,
      codigo_tipocertificado: +codigoTipoCertificado,
      id_sucursal: +idSucursal,
      id_plantilla: +idPlantilla,
      id_programa: +idPrograma,
      nombre_impresion: nombreImpresion,
      estado: true,
    };

    console.log("---- payload certificado ----");
    console.log({ payload });

    try {
      let response: CertificadoResponseGeneral;

      if (isEditMode && id) {
        response = await updateCertificado(+id, payload);
      } else {
        response = await createCertificado(payload);
      }

      console.log("---- response certificado ----");
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
      console.error("Error guardando certificado:", error);
      showToast("error", "Error inesperado al guardar el certificado.");
    }
  };

  return (
    <>
      <Card className="shadow-lg border border-slate-200 bg-white rounded-xl">
        <CardHeader className="border-b border-slate-100 p-6 flex flex-row items-center justify-between bg-slate-50/50 rounded-t-xl">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {isEditMode
                ? `Editar certificado`
                : `Nuevo registro de certificado`}
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              {isEditMode
                ? `Actualización de información del certificado`
                : `Complete los campos necesarios para emitir un certificado`}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </CardHeader>

        <CardContent className="pb-6 sm:pb-6 relative">
          {isLoadingData && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10">
              <Spinner className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Sección 1: Información del Destinatario e Institución */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] font-semibold">
                    1
                  </span>
                  <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Información del Destinatario y Tipo
                  </h3>
                  <div className="h-px bg-slate-100 flex-1"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Grupo Persona */}
                  <FormField
                    control={form.control}
                    name="idGrupoPersona"
                    render={({ field, fieldState }) => (
                      <FormItem className="w-full">
                        <RequiredLabel isRequired={true}>
                          Grupo Persona
                        </RequiredLabel>
                        <Select
                          onValueChange={(val) => {
                            field.onChange(val);
                            if (!isInitialLoading.current) {
                              form.setValue("idPersona", "");
                              form.setValue("nombreImpresion", "");
                            }
                          }}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger
                              className={`w-full ${inputErrorClass(fieldState.invalid)}`}
                            >
                              <SelectValue placeholder="Seleccionar grupo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="w-full">
                            {grupoPersonas.map((grupo) => (
                              <SelectItem
                                value={grupo.codigo!.toString()}
                                key={grupo.codigo}
                              >
                                {grupo.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="idPersona"
                    render={({ field, fieldState }) => (
                      <FormItem className="w-full">
                        <RequiredLabel isRequired={true}>Alumno</RequiredLabel>
                        <SearchableCombobox<Persona>
                          placeholder="Buscar un alumno"
                          options={personas}
                          value={field.value}
                          onChange={field.onChange}
                          displayKey="nombre_completo"
                          valueKey="id"
                          searchKeys={["nombre_completo"]}
                          isInvalid={fieldState.invalid}
                          isLoading={isLoadingPersonas}
                          renderOption={(alumno) => (
                            <span className="font-semibold text-gray-900">
                              {alumno.nombre_completo}
                            </span>
                          )}
                        />
                        <FormMessage className="text-xs font-medium text-red-500" />
                      </FormItem>
                    )}
                  />

                  {/* Nombre de Impresión */}
                  <FormField
                    control={form.control}
                    name="nombreImpresion"
                    render={({ field, fieldState }) => (
                      <FormItem className="w-full">
                        <RequiredLabel isRequired={true}>
                          Nombre de Impresión
                        </RequiredLabel>
                        <FormControl>
                          <div className="relative">
                            <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                              {...field}
                              placeholder="Nombre para el certificado"
                              className={`transition-all bg-white ${
                                fieldState.invalid
                                  ? "border-red-400 focus-visible:ring-red-100"
                                  : "border-slate-200 focus-visible:ring-blue-100 focus-visible:border-blue-500"
                              }`}
                              // className={`pl-9 w-full ${inputErrorClass(fieldState.invalid)}`}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="codigoTipoCertificado"
                    render={({ field, fieldState }) => (
                      <FormItem className="w-full">
                        <RequiredLabel isRequired={true}>
                          Tipo Certificado
                        </RequiredLabel>
                        <Select
                          onValueChange={(val) => {
                            field.onChange(val);
                            if (!isInitialLoading.current) {
                              form.setValue("idPrograma", "");
                              form.setValue("idModulo", "");
                            }
                          }}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger
                              className={`w-full transition-all bg-white ${
                                fieldState.invalid
                                  ? "border-red-400 focus:ring-red-100"
                                  : "border-slate-200 focus:ring-blue-100 focus:border-blue-500"
                              }`}
                              // className={`w-full ${inputErrorClass(
                              //   fieldState.invalid,
                              // )}`}
                            >
                              <SelectValue placeholder="Seleccionar tipo certificado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white text-xs border border-slate-200 shadow-md outline-none">
                            {tipoCertificados.map((tipo) => (
                              <SelectItem
                                value={tipo.codigo!.toString()}
                                key={tipo.codigo}
                                className="cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                {tipo.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs font-medium text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Sección 2: Información Académica y Plantilla */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] font-semibold">
                    2
                  </span>
                  <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Contexto Académico y Diseño
                  </h3>
                  <div className="h-px bg-slate-100 flex-1"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Institución */}
                  <FormField
                    control={form.control}
                    name="idInstitucion"
                    render={({ field, fieldState }) => (
                      <FormItem className="w-full">
                        <RequiredLabel isRequired={true}>
                          Institución
                        </RequiredLabel>
                        <SearchableCombobox<Institucion>
                          placeholder="Buscar o seleccionar institución"
                          options={instituciones}
                          value={field.value || ""}
                          onChange={field.onChange}
                          displayKey="nombre"
                          valueKey="id"
                          searchKeys={["nombre"]}
                          isInvalid={fieldState.invalid}
                        />
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
                          onValueChange={(val) => {
                            field.onChange(val);
                            if (!isInitialLoading.current) {
                              form.setValue("idPrograma", "");
                              form.setValue("idModulo", "");
                            }
                          }}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger
                              className={`w-full transition-all bg-white ${
                                fieldState.invalid
                                  ? "border-red-400 focus:ring-red-100"
                                  : "border-slate-200 focus:ring-blue-100 focus:border-blue-500"
                              }`}
                            >
                              <SelectValue placeholder="Seleccionar tipo programa" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white text-xs border border-slate-200 shadow-md outline-none">
                            {tipoProgramas.map((tipo) => (
                              <SelectItem
                                value={tipo.codigo!.toString()}
                                key={tipo.codigo}
                                className="cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                {tipo.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs font-medium text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="idPrograma"
                    render={({ field, fieldState }) => (
                      <FormItem className="w-full">
                        <RequiredLabel isRequired={true}>
                          Programa
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
                          isLoading={isLoadingProgramas}
                          renderOption={(programa) => (
                            <span className="font-semibold text-gray-900">
                              {programa.titulo}
                            </span>
                          )}
                        />
                        <FormMessage className="text-xs font-medium text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="idSucursal"
                    render={({ field, fieldState }) => (
                      <FormItem className="w-full">
                        <RequiredLabel isRequired={true}>
                          Sucursal
                        </RequiredLabel>
                        <div className="flex gap-2">
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={`w-full transition-all bg-white ${
                                  fieldState.invalid
                                    ? "border-red-400 focus:ring-red-100"
                                    : "border-slate-200 focus:ring-blue-100 focus:border-blue-500"
                                }`}
                              >
                                <SelectValue placeholder="Seleccione una sucursal" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white text-xs border border-slate-200 shadow-md outline-none">
                              {sucursales.map((sucursal) => (
                                <SelectItem
                                  key={sucursal.id}
                                  value={sucursal.id?.toString() || ""}
                                  className="cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                  {sucursal.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <FormMessage className="text-xs font-medium text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="idPlantilla"
                    render={({ field, fieldState }) => (
                      <FormItem className="w-full">
                        <RequiredLabel isRequired={true}>
                          Plantilla
                        </RequiredLabel>
                        <div className="flex gap-2">
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={`w-full transition-all bg-white ${
                                  fieldState.invalid
                                    ? "border-red-400 focus:ring-red-100"
                                    : "border-slate-200 focus:ring-blue-100 focus:border-blue-500"
                                }`}
                              >
                                <SelectValue placeholder="Seleccione una plantilla" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white text-xs border border-slate-200 shadow-md outline-none">
                              {plantillas.map((plantilla) => (
                                <SelectItem
                                  key={plantilla.id}
                                  value={plantilla.id?.toString() || ""}
                                  className="cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                  {plantilla.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={!selectedPlantillaId}
                            onClick={handleOpenPreview}
                            title="Previsualizar Plantilla"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                        </div>
                        <FormMessage className="text-xs font-medium text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isSubmitting}
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
                  {isEditMode ? "Guardar Cambios" : "Registrar"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Modal de Vista Previa */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl bg-white p-6 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-blue-600" />
              Vista Previa de Plantilla
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Diseño final estimado con el cual se emitirá el documento.
            </DialogDescription>
          </DialogHeader>

          <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center p-4 min-h-[300px]">
            {previewPlantilla?.path_imagen_publica ? (
              <img
                src={getStorageUrl(previewPlantilla.path_imagen_publica)}
                alt={`Vista previa - ${previewPlantilla.nombre}`}
                className="max-h-[450px] w-auto object-contain rounded shadow-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 space-y-2 py-12">
                <FileSpreadsheet className="h-12 w-12 stroke-[1.5]" />
                <span className="text-xs font-medium">
                  Vista previa no disponible para esta plantilla
                </span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
