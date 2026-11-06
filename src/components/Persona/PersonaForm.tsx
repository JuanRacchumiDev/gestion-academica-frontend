import React, { useCallback, useEffect, useState } from "react";
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
  DetalleParametro,
  DetalleParametroFilters,
} from "../../interfaces/IDetalleParametro";
import { getDetalles } from "../../services/detalleParametroService";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RequiredLabel } from "../Common/RequiredLabel";
import { Persona, PersonaResponse } from "@/interfaces/IPersona";
import {
  ArrowLeft,
  Save,
  Search,
  Upload,
  UserCheck,
  XCircle,
} from "lucide-react";
import {
  createPersona,
  getPersonaById,
  updatePersona,
} from "../../services/personaService";
import { getPersonaByApi } from "../../services/personaApiService";
import { ParametroClase } from "@/params/parametroClase";

interface PersonaFormProps {
  nombreGrupo?: string;
}

const loadTipoDocumentos = async (): Promise<DetalleParametro[]> => {
  let dataTipoDocumentos: DetalleParametro[] = [];

  const queryParmas = `parametro_clase=${ParametroClase.TIPO_DOCUMENTO}&en_persona=true&en_empresa=false&estado=true`;

  const response = await getDetalles(queryParmas);

  const { result, data } = response;

  if (result && data) {
    dataTipoDocumentos = data as DetalleParametro[];
  }

  return dataTipoDocumentos;
};

const loadPerfiles = async (): Promise<DetalleParametro[]> => {
  let dataPerfiles: DetalleParametro[] = [];

  try {
    const queryParams = `parametro_clase=${ParametroClase.PERFIL}&en_persona=false&en_empresa=false&estado=true`;
    const response = await getDetalles(queryParams);

    const { result, data } = response;

    if (result && data) {
      dataPerfiles = data as DetalleParametro[];
    }

    return dataPerfiles;
  } catch (error) {
    console.error("Error al cargar perfiles:", error);
    return [];
  }
};

const formSchema = z.object({
  codigoTipoDocumento: z
    .string({
      message: "El tipo de documento es requerido.",
    })
    .min(1, "El tipo de documento es requerido."),
  codigoPerfil: z
    .string({
      message: "El perfil es requerido",
    })
    .min(1, "El perfil es requerido"),
  numeroDocumento: z.string().min(8, {
    message: "El número de documento debe tener al menos 8 caracteres.",
  }),
  nombres: z.string().min(2, {
    message: "Los nombres son requeridos.",
  }),
  apellidoPaterno: z.string().min(2, {
    message: "El apellido paterno es requerido.",
  }),
  apellidoMaterno: z.string().min(2, {
    message: "El apellido materno es requerido.",
  }),
  fechaNacimiento: z.date().nullable().optional(),
  sexo: z.string().min(1, {
    message: "El sexo es requerido",
  }),
  email: z
    .string()
    .email({ message: "Por favor ingrese un email válido" })
    .optional()
    .or(z.literal("")),
  // email: z.string().email({
  //   message: "Por favor ingrese un email válido",
  // }),
  telefono: z.string().nullable().optional(),
  fotoFile: z.any().optional(),
});

const defaultValues = {
  codigoTipoDocumento: "1",
  codigoPerfil: "",
  numeroDocumento: "",
  nombres: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  fechaNacimiento: null,
  email: "",
  sexo: "",
  telefono: "",
  fotoFile: null,
};

export const PersonaForm: React.FC<PersonaFormProps> = ({ nombreGrupo }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [tipoDocumentos, setTipoDocumentos] = useState<DetalleParametro[]>([]);
  const [perfiles, setPerfiles] = useState<DetalleParametro[]>([]);
  const [camposHabilitados, setCamposHabilitados] = useState(false);
  const [campoFecNacHabilitado, setCampoFecNacHabilitado] = useState(false);
  const [idPersona, setIdPersona] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const isEditMode = !!id;

  const handleGoBack = () => {
    navigate(`/personas/${nombreGrupo}`);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const resetForm = () => {
    form.reset(defaultValues);
    setCamposHabilitados(false);
    setCampoFecNacHabilitado(false);
    setIdPersona(0);
    setSelectedFileName(null);
  };

  const handleEnableManualMode = () => {
    setCamposHabilitados(true);
    setCampoFecNacHabilitado(true);
    showToast(
      "success",
      "Modo manual habilitado. Complete los campos requeridos.",
    );
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoadingData(true);

      try {
        const [listTipoDocumentos, listPerfiles] = await Promise.all([
          loadTipoDocumentos(),
          loadPerfiles(),
        ]);

        if (!isMounted) return;

        setTipoDocumentos(listTipoDocumentos);
        setPerfiles(listPerfiles);

        console.log({ perfiles });

        // Si hay una única opción en perfiles, seleccionarla por defecto
        if (listPerfiles.length === 1 && listPerfiles[0].codigo) {
          form.setValue("codigoPerfil", listPerfiles[0].codigo.toString(), {
            shouldValidate: true,
          });
        }

        if (isEditMode && id) {
          const responsePersona = await getPersonaById(+id);
          const { result: resPers, data: dataPers } = responsePersona;

          if (resPers && dataPers) {
            const persona = dataPers as Persona;
            if (persona.id) setIdPersona(persona.id);
            setCamposHabilitados(true);
            setCampoFecNacHabilitado(true);

            form.reset({
              codigoTipoDocumento: String(persona.codigo_tipo_documento),
              codigoPerfil: persona.codigo_perfil
                ? String(persona.codigo_perfil)
                : "",
              numeroDocumento: persona.numero_documento,
              nombres: persona.nombres,
              apellidoPaterno: persona.apellido_paterno,
              apellidoMaterno: persona.apellido_materno,
              email: persona.email || "",
              sexo: persona.sexo,
              fechaNacimiento: persona.fecha_nacimiento
                ? parseISO(persona.fecha_nacimiento as string)
                : null,
              telefono: persona.telefono || "",
            });
          }
        }
      } catch (error) {
        console.error("Error al obtener datos", error);
        showToast("error", "Error al cargar los datos del formulario.");
      } finally {
        if (isMounted) {
          setIsLoadingData(false); // <--- Oculta el loading una sola vez al terminar la carga inicial
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleConsultApi = useCallback(
    async (numeroDoc?: string) => {
      const docNumber = numeroDoc || form.getValues("numeroDocumento");
      if (!docNumber || docNumber.length < 8) {
        showToast(
          "warning",
          "Ingrese un número de documento válido de al menos 8 dígitos.",
        );
        return;
      }

      setIsSearchingApi(true);
      try {
        showToast("success", "Consultando datos...");
        const idTipoDoc = form.getValues("codigoTipoDocumento");
        const tipoDocumento = idTipoDoc === "1" ? "DNI" : "CE";
        const descGrupo = `grupo-${nombreGrupo}`;

        const responsePersona = await getPersonaByApi(
          tipoDocumento,
          docNumber,
          descGrupo,
        );

        const { result, data, message } = responsePersona;

        if (result && data) {
          const persona = data as Persona;
          const {
            id,
            nombres,
            apellido_paterno,
            apellido_materno,
            fecha_nacimiento,
          } = persona;

          setIdPersona(id || 0);
          setCamposHabilitados(true);

          form.setValue("nombres", nombres, { shouldValidate: true });
          form.setValue("apellidoPaterno", apellido_paterno, {
            shouldValidate: true,
          });
          form.setValue("apellidoMaterno", apellido_materno, {
            shouldValidate: true,
          });

          if (fecha_nacimiento) {
            form.setValue("fechaNacimiento", parseISO(fecha_nacimiento), {
              shouldValidate: true,
            });
            setCampoFecNacHabilitado(false); // Bloqueado si viene de RENIEC
          } else {
            form.setValue("fechaNacimiento", null, { shouldValidate: true });
            setCampoFecNacHabilitado(true); // Habilitado si falta la fecha en API
          }

          showToast(
            "success",
            (message as string) || "Datos obtenidos correctamente.",
          );
        } else {
          setCamposHabilitados(true);
          setCampoFecNacHabilitado(true);
          showToast(
            "warning",
            "No se encontraron registros previos. Complete los datos manualmente.",
          );
        }
      } catch (error) {
        console.error("Error en consulta API", error);
        setCamposHabilitados(true);
        setCampoFecNacHabilitado(true);
        showToast("error", "Error al consultar el documento en línea.");
      } finally {
        setIsSearchingApi(false);
      }
    },
    [form, nombreGrupo, showToast],
  );

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const {
        codigoTipoDocumento,
        codigoPerfil,
        numeroDocumento,
        nombres,
        apellidoMaterno,
        apellidoPaterno,
        fechaNacimiento,
        email,
        sexo,
        telefono,
      } = values;

      const nombreCompleto = `${nombres} ${apellidoPaterno} ${apellidoMaterno}`;
      const fechaNacimientoStr = fechaNacimiento
        ? fechaNacimiento.toISOString().split("T")[0]
        : "";

      const payload: Persona = {
        codigo_tipo_documento: +codigoTipoDocumento,
        codigo_perfil: +codigoPerfil,
        numero_documento: numeroDocumento,
        nombres,
        apellido_paterno: apellidoPaterno,
        apellido_materno: apellidoMaterno,
        nombre_completo: nombreCompleto,
        fecha_nacimiento: fechaNacimientoStr,
        email: email || "",
        sexo,
        nombre_grupo: `grupo-${nombreGrupo}`,
        telefono: telefono || "",
        estado: true,
      };

      let resultOperation = false;
      let messageOperation = "";
      let codeOperation = "";

      if (!isEditMode) {
        if (idPersona) {
          const response = await updatePersona(idPersona, payload);
          const { result, message, code } = response as PersonaResponse;
          resultOperation = result as boolean;
          messageOperation = message as string;
          codeOperation = code as string;
        } else {
          payload.origen = "WEB";
          const response = await createPersona(payload);
          const { result, message, code } = response as PersonaResponse;
          resultOperation = result as boolean;
          messageOperation = message as string;
          codeOperation = code as string;
        }
      } else {
        const response = await updatePersona(idPersona, payload);
        const { result, message, code } = response as PersonaResponse;
        resultOperation = result as boolean;
        messageOperation = message as string;
        codeOperation = code as string;
      }

      if (resultOperation) {
        if (codeOperation === "PREVIOUSLY_REGISTERED") {
          showToast("warning", messageOperation);
          return;
        } else {
          const messageCreate = nombreGrupo
            ? `${nombreGrupo.toLocaleUpperCase()} registrado (a) exitosamente`
            : messageOperation.toLocaleUpperCase();

          showToast("success", messageCreate);
          navigate(`/personas/${nombreGrupo}`);
        }
      } else {
        showToast("error", messageOperation || "Error al registrar la persona");
      }
    } catch (error) {
      console.error("Error al registrar la persona", error);
      showToast("error", "Error al registrar la persona");
    }
  };

  if (isLoadingData) {
    return (
      <Card className="shadow-xl border-none bg-white min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-10 w-10 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">
            Cargando formulario...
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-none bg-white">
      <CardHeader className="border-b border-gray-100 p-6 flex flex-row items-center justify-between bg-gray-50/50 rounded-t-xl">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-extrabold text-slate-800 tracking-tight">
            {isEditMode
              ? `Editar ${nombreGrupo}`
              : `Nuevo Registro de ${nombreGrupo}`}
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            {isEditMode
              ? `Actualización de información de ${nombreGrupo}`
              : `Complete la información para registrar un ${nombreGrupo}`}
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          type="button"
          disabled={isSubmitting}
          onClick={handleGoBack}
          className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </CardHeader>

      <CardContent className="px-6 sm:px-8 relative">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Banner superior de opciones */}
            {!isEditMode && (
              <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-blue-900 text-sm">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-5 w-5 text-blue-600 shrink-0" />
                  <span>
                    Ingrese el documento y pulse{" "}
                    <strong>"Consultar API"</strong> o haga clic en{" "}
                    <strong>Registro Manual</strong> para rellenar los datos
                    libremente.
                  </span>
                </div>
                {!camposHabilitados && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleEnableManualMode}
                    className="border-blue-200 bg-white text-blue-700 hover:bg-blue-100 shrink-0 text-xs font-semibold"
                  >
                    Registro Manual
                  </Button>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              {/* Tipo de Documento */}
              <FormField
                control={form.control}
                name="codigoTipoDocumento"
                render={({ field, fieldState }) => (
                  <FormItem className="w-full">
                    <RequiredLabel isRequired={true}>
                      Tipo de Documento
                    </RequiredLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                      disabled={isSubmitting || isEditMode}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={`w-full transition-all bg-white ${
                            fieldState.invalid
                              ? "border-red-400 focus:ring-red-100"
                              : "border-slate-200 focus:ring-blue-100 focus:border-blue-500"
                          }`}
                        >
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white text-xs border border-slate-200 shadow-md outline-none">
                        {tipoDocumentos.map((tipo) => (
                          <SelectItem
                            value={tipo.codigo!.toString()}
                            key={tipo.codigo!.toString()}
                            className="cursor-pointer hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold transition-colors"
                          >
                            {tipo.descripcion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs font-medium text-red-500" />
                  </FormItem>
                )}
              />

              {/* Perfil del Usuario */}
              <FormField
                control={form.control}
                name="codigoPerfil"
                render={({ field, fieldState }) => (
                  <FormItem className="w-full">
                    <RequiredLabel isRequired={true}>Perfil</RequiredLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                      disabled={isSubmitting || perfiles.length === 1}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={`w-full transition-all bg-white ${
                            fieldState.invalid
                              ? "border-red-400 focus:ring-red-100"
                              : "border-slate-200 focus:ring-blue-100 focus:border-blue-500"
                          }`}
                        >
                          <SelectValue placeholder="Seleccionar perfil" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white text-xs border border-slate-200 shadow-md outline-none">
                        {perfiles.map((perfil) => (
                          <SelectItem
                            value={perfil.codigo!.toString()}
                            key={perfil.codigo!.toString()}
                            className="cursor-pointer hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold transition-colors"
                          >
                            {perfil.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs font-medium text-red-500" />
                  </FormItem>
                )}
              />

              {/* N° de Documento */}
              <FormField
                control={form.control}
                name="numeroDocumento"
                render={({ field, fieldState }) => (
                  <FormItem className="w-full">
                    <RequiredLabel isRequired={true}>
                      N° de documento
                    </RequiredLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="12345678"
                          autoComplete="off"
                          maxLength={8}
                          disabled={isSubmitting || isEditMode}
                          {...field}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleConsultApi(field.value);
                            }
                          }}
                          className={`transition-all bg-white ${
                            fieldState.invalid
                              ? "border-red-400 focus-visible:ring-red-100"
                              : "border-slate-200 focus-visible:ring-blue-100 focus-visible:border-blue-500"
                          }`}
                        />
                      </FormControl>
                      {!isEditMode && (
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={
                            isSubmitting || isSearchingApi || !field.value
                          }
                          onClick={() => handleConsultApi(field.value)}
                          title="Consultar en API RENIEC"
                          className="bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 transition-all shrink-0 px-3"
                        >
                          {isSearchingApi ? (
                            <Spinner className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>

                    <FormMessage className="text-xs font-medium text-red-500" />
                  </FormItem>
                )}
              />

              {/* Nombres */}
              <FormField
                control={form.control}
                name="nombres"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <RequiredLabel isRequired={true}>Nombres</RequiredLabel>
                    <FormControl>
                      <Input
                        placeholder="María Angélica"
                        autoComplete="off"
                        maxLength={40}
                        {...field}
                        disabled={!camposHabilitados || isSubmitting}
                        className={`transition-all ${
                          fieldState.invalid
                            ? "border-red-400 focus-visible:ring-red-100"
                            : "border-slate-200 focus-visible:ring-blue-100 focus-visible:border-blue-500"
                        } ${!camposHabilitados ? "bg-slate-50 text-slate-500 cursor-not-allowed" : "bg-white"}`}
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-medium text-red-500" />
                  </FormItem>
                )}
              />

              {/* Apellido Paterno */}
              <FormField
                control={form.control}
                name="apellidoPaterno"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <RequiredLabel isRequired={true}>
                      Apellido Paterno
                    </RequiredLabel>
                    <FormControl>
                      <Input
                        placeholder="Pérez"
                        autoComplete="off"
                        maxLength={40}
                        {...field}
                        disabled={!camposHabilitados || isSubmitting}
                        className={`transition-all ${
                          fieldState.invalid
                            ? "border-red-400 focus-visible:ring-red-100"
                            : "border-slate-200 focus-visible:ring-blue-100 focus-visible:border-blue-500"
                        } ${!camposHabilitados ? "bg-slate-50 text-slate-500 cursor-not-allowed" : "bg-white"}`}
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-medium text-red-500" />
                  </FormItem>
                )}
              />

              {/* Apellido Materno */}
              <FormField
                control={form.control}
                name="apellidoMaterno"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <RequiredLabel isRequired={true}>
                      Apellido Materno
                    </RequiredLabel>
                    <FormControl>
                      <Input
                        placeholder="Vallejos"
                        autoComplete="off"
                        maxLength={40}
                        {...field}
                        disabled={!camposHabilitados || isSubmitting}
                        className={`transition-all ${
                          fieldState.invalid
                            ? "border-red-400 focus-visible:ring-red-100"
                            : "border-slate-200 focus-visible:ring-blue-100 focus-visible:border-blue-500"
                        } ${!camposHabilitados ? "bg-slate-50 text-slate-500 cursor-not-allowed" : "bg-white"}`}
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-medium text-red-500" />
                  </FormItem>
                )}
              />

              {/* Fecha de Nacimiento */}
              <FormField
                control={form.control}
                name="fechaNacimiento"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <RequiredLabel>Fecha de Nacimiento</RequiredLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={
                          field.value ? format(field.value, "yyyy-MM-dd") : ""
                        }
                        autoComplete="off"
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseISO(e.target.value) : null,
                          )
                        }
                        disabled={
                          (!campoFecNacHabilitado && !isEditMode) ||
                          isSubmitting
                        }
                        className={`transition-all ${
                          fieldState.invalid
                            ? "border-red-400 focus-visible:ring-red-100"
                            : "border-slate-200 focus-visible:ring-blue-100 focus-visible:border-blue-500"
                        } ${!campoFecNacHabilitado && !isEditMode ? "bg-slate-50 text-slate-500 cursor-not-allowed" : "bg-white"}`}
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-medium text-red-500" />
                  </FormItem>
                )}
              />

              {/* Correo Electrónico */}
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <RequiredLabel isRequired={true}>
                      Correo electrónico
                    </RequiredLabel>
                    <FormControl>
                      <Input
                        placeholder="maria.lopez@empresa.com"
                        autoComplete="off"
                        maxLength={60}
                        {...field}
                        value={field.value ?? ""}
                        disabled={isSubmitting}
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

              {/* Sexo */}
              <FormField
                control={form.control}
                name="sexo"
                render={({ field, fieldState }) => (
                  <FormItem className="w-full">
                    <RequiredLabel isRequired={true}>Sexo</RequiredLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={`w-full transition-all bg-white ${
                            fieldState.invalid
                              ? "border-red-400 focus:ring-red-100"
                              : "border-slate-200 focus:ring-blue-100 focus:border-blue-500"
                          }`}
                        >
                          <SelectValue placeholder="Seleccionar sexo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="F">Femenino</SelectItem>
                        <SelectItem value="M">Masculino</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs font-medium text-red-500" />
                  </FormItem>
                )}
              />

              {/* Teléfono */}
              <FormField
                control={form.control}
                name="telefono"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <RequiredLabel>Teléfono</RequiredLabel>
                    <FormControl>
                      <Input
                        placeholder="997755662"
                        autoComplete="off"
                        maxLength={9}
                        {...field}
                        value={field.value ?? ""}
                        disabled={isSubmitting}
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

              <FormField
                control={form.control}
                name="fotoFile"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem className="w-full">
                    <RequiredLabel isRequired={false}>Fotografía</RequiredLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <label className="flex-1 flex items-center justify-between px-3 py-2 border border-slate-200 rounded-md bg-white cursor-pointer hover:bg-slate-50 transition-colors">
                          <span className="text-xs text-slate-500 truncate">
                            {selectedFileName || "Seleccionar imagen..."}
                          </span>
                          <Upload className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setSelectedFileName(file.name);
                                onChange(file);
                              }
                            }}
                            {...rest}
                          />
                        </label>
                        {selectedFileName && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedFileName(null);
                              onChange(null);
                            }}
                            className="text-red-500 hover:bg-red-50 px-2"
                            title="Quitar archivo"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs font-medium text-red-500" />
                  </FormItem>
                )}
              />
            </div>

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
