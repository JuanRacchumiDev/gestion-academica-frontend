import React, { useEffect, useState } from "react";
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
import { ArrowLeft, Save, XCircle } from "lucide-react";
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

const formSchema = z.object({
  codigoTipoDocumento: z
    .string({
      message: "El tipo de documento es requerido.",
    })
    .min(1, "El tipo de documento es requerido."),
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
  // fechaNacimiento: z
  //   .date({
  //     message: "La fecha de nacimiento es requerida",
  //   })
  //   .nullable()
  //   .refine((val) => val !== null, {
  //     message: "La fecha de nacimiento es requerida",
  //   })
  //   .optional(),
  sexo: z.string().min(1, {
    message: "El sexo es requerido",
  }),
  email: z.string().email({
    message: "Por favor ingrese un email válido",
  }),
  // email: z.string().nullable().optional(),
  telefono: z.string().nullable().optional(),
});

const defaultValues = {
  codigoTipoDocumento: "1",
  numeroDocumento: "",
  nombres: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  fechaNacimiento: null,
  email: "",
  sexo: "",
  telefono: "",
};

export const PersonaForm: React.FC<PersonaFormProps> = ({ nombreGrupo }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [tipoDocumentos, setTipoDocumentos] = useState<DetalleParametro[]>([]);
  const [camposHabilitados, setCamposHabilitados] = useState(false);
  const [campoFecNacHabilitado, setCampoFecNacHabilitado] = useState(false);
  const [idPersona, setIdPersona] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(false);

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
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);

      try {
        let listTipoDocumentos: DetalleParametro[] = [];

        const queryParmas = `parametro_clase=${ParametroClase.TIPO_DOCUMENTO}&en_persona=true&en_empresa=false&estado=true`;

        const [responseTipoDocumentos] = await Promise.all([
          getDetalles(queryParmas),
        ]);

        const { result, data } = responseTipoDocumentos;
        if (result && data) {
          listTipoDocumentos = data as DetalleParametro[];
        }
        setTipoDocumentos(listTipoDocumentos);

        if (isEditMode && id) {
          const responsePersona = await getPersonaById(+id);
          const { result: resPers, data: dataPers } = responsePersona;

          if (resPers && dataPers) {
            const persona = dataPers as Persona;
            if (persona.id) setIdPersona(persona.id);
            setCamposHabilitados(true);
            setCampoFecNacHabilitado(true);

            form.reset({
              codigoTipoDocumento: String(persona.codigo_tipodocumento),
              numeroDocumento: persona.numero_documento,
              nombres: persona.nombres,
              apellidoPaterno: persona.apellido_paterno,
              apellidoMaterno: persona.apellido_materno,
              email: persona.email,
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
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [id, isEditMode, form]);

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const {
        codigoTipoDocumento,
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
        codigo_tipodocumento: +codigoTipoDocumento,
        numero_documento: numeroDocumento,
        nombres,
        apellido_paterno: apellidoPaterno,
        apellido_materno: apellidoMaterno,
        nombre_completo: nombreCompleto,
        fecha_nacimiento: fechaNacimientoStr,
        email,
        sexo,
        nombre_grupo: `grupo-${nombreGrupo}`,
        telefono,
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
        {isLoadingData && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10">
            <Spinner className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative">
              <div className="flex items-center gap-4 mb-5">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">
                  01
                </span>
                <h3 className="text-lg font-bold text-slate-800">
                  Información Personal
                </h3>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>
            </div>

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

              {/* N° de Documento */}
              <FormField
                control={form.control}
                name="numeroDocumento"
                render={({ field, fieldState }) => (
                  <FormItem className="w-full">
                    <RequiredLabel isRequired={true}>
                      N° de documento
                    </RequiredLabel>
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
                            if (!field.value) return;
                            try {
                              showToast("success", "Buscando datos...");
                              const idTipoDoc = form.getValues(
                                "codigoTipoDocumento",
                              );
                              const tipoDocumento =
                                idTipoDoc === "1" ? "DNI" : "CE";
                              const descGrupo = `grupo-${nombreGrupo}`;

                              const responsePersona = await getPersonaByApi(
                                tipoDocumento,
                                field.value,
                                descGrupo,
                              );

                              // console.log({ responsePersona });

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

                                setIdPersona(id);

                                form.setValue("nombres", nombres, {
                                  shouldValidate: true,
                                });

                                form.setValue(
                                  "apellidoPaterno",
                                  apellido_paterno,
                                  { shouldValidate: true },
                                );

                                form.setValue(
                                  "apellidoMaterno",
                                  apellido_materno,
                                  { shouldValidate: true },
                                );

                                if (fecha_nacimiento) {
                                  form.setValue(
                                    "fechaNacimiento",
                                    parseISO(fecha_nacimiento),
                                    { shouldValidate: true },
                                  );
                                  setCampoFecNacHabilitado(false);
                                } else {
                                  form.setValue("fechaNacimiento", null, {
                                    shouldValidate: true,
                                  });
                                  setCampoFecNacHabilitado(true);
                                }

                                showToast("success", message as string);
                              } else {
                                setCamposHabilitados(true);

                                setCampoFecNacHabilitado(true);

                                showToast(
                                  "warning",
                                  "No se encontraron registros previos. Complete los datos manualmente.",
                                );
                              }
                            } catch (error) {
                              setCamposHabilitados(true);
                              setCampoFecNacHabilitado(true);

                              showToast(
                                "error",
                                "Error al consultar el documento.",
                              );
                            }
                          }
                        }}
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
                        disabled={!campoFecNacHabilitado || isSubmitting}
                        className={`transition-all ${
                          fieldState.invalid
                            ? "border-red-400 focus-visible:ring-red-100"
                            : "border-slate-200 focus-visible:ring-blue-100 focus-visible:border-blue-500"
                        } ${!campoFecNacHabilitado ? "bg-slate-50 text-slate-500 cursor-not-allowed" : "bg-white"}`}
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
