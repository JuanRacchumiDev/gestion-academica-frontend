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

import { createEvento, getEventoById } from "../../services/eventoService";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RequiredLabel } from "../Common/RequiredLabel";
import { Evento, EventoResponse } from "@/interfaces/IEvento";
import { ArrowLeft } from "lucide-react";
import { getDetalles } from "../../services/detalleParametroService";
import {
  DetalleParametro,
  DetalleParametroFilters,
} from "@/interfaces/IDetalleParametro";
import { Textarea } from "../ui/textarea";
import { ParametroClase } from "@/params/parametroClase";

const formSchema = z
  .object({
    idTipoEvento: z
      .string({
        message: "Seleccione un tipo de evento.",
      })
      .min(1, "Seleccione un tipo de evento."),
    idCategoriaEvento: z
      .string({
        message: "Seleccione una categoría de evento.",
      })
      .min(1, "Seleccione una categoría de evento."),
    titulo: z.string().min(2, {
      message: "El título es obligatorio",
    }),
    descripcion: z.string().optional(),
    temario: z.string().min(10, {
      message: "El temario es obligatorio",
    }),
    fechaInicio: z
      .date({
        message: "La fecha de inicio es requerida",
      })
      .nullable()
      .refine((val) => val !== null, {
        message: "La fecha de inicio es requerida",
      }),
    fechaFinal: z
      .date({
        message: "La fecha final es requerida",
      })
      .nullable()
      .refine((val) => val !== null, {
        message: "La fecha final es requerida",
      }),
    duracion: z.string().min(2, {
      message: "La duración es requerida.",
    }),
    modalidad: z
      .string({
        message: "Seleccione una modalidad.",
      })
      .min(1, "Seleccione una modalidad."),
    // precio: z.preprocess(
    //   (val) => (val === "" ? undefined : val),
    //   z.string().optional()
    // ),
    // capacidadMinima: z.preprocess(
    //   (val) => (val === "" ? undefined : val),
    //   z.string().optional()
    // ),
    // capacidadMaxima: z.preprocess(
    //   (val) => (val === "" ? undefined : val),
    //   z.string().optional()
    // ),
    precio: z.string().optional(),
    capacidadMinima: z.string().optional(),
    capacidadMaxima: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.fechaInicio &&
      data.fechaFinal &&
      data.fechaFinal < data.fechaInicio
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha final no puede ser menor que la fecha de inicio.",
        path: ["fechaFinal"], // Muestra el error en el campo fechaFinal
      });
    }
  });

type TEvento = {
  idTipoEvento?: string;
  idCategoriaEvento?: string;
  titulo?: string;
  descripcion?: string;
  temario?: string;
  fechaInicio?: Date | null;
  fechaFinal?: Date | null;
  duracion?: string;
  modalidad?: string;
  precio?: string;
  capacidadMaxima?: string;
  capacidadMinima?: string;
};

export const EventoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [tipoEventos, setTipoEventos] = useState<DetalleParametro[]>([]);
  const [categoriaEventos, setCategoriaEventos] = useState<DetalleParametro[]>(
    [],
  );

  const isEditMode = !!id;

  const handleGoBack = () => {
    const urlBack = `/evento/`;
    navigate(urlBack);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idTipoEvento: "",
      idCategoriaEvento: "",
      titulo: "",
      descripcion: "",
      temario: "",
      fechaInicio: null,
      fechaFinal: null,
      duracion: "",
      modalidad: "VIRTUAL",
      precio: "",
      capacidadMinima: "",
      capacidadMaxima: "",
    },
  });

  const resetForm = () => {
    const dataForm: TEvento = {
      idTipoEvento: "",
      idCategoriaEvento: "",
      titulo: "",
      descripcion: "",
      temario: "",
      fechaInicio: null,
      fechaFinal: null,
      duracion: "",
      modalidad: "VIRTUAL",
      precio: "",
      capacidadMinima: "",
      capacidadMaxima: "",
    };

    form.reset(dataForm);
  };

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // console.log({ values });

      const {
        idTipoEvento,
        idCategoriaEvento,
        titulo,
        descripcion,
        temario,
        fechaInicio,
        fechaFinal,
        duracion,
        modalidad,
        precio,
        capacidadMinima,
        capacidadMaxima,
      } = values;

      const fechaInicioToString: string | null = fechaInicio
        ? fechaInicio.toISOString()
        : null;

      // console.log({ fechaInicioToString });

      const partsFechaInicio: string[] = fechaInicioToString!.split("T");

      // console.log({ partsFechaInicio });

      const fechaInicioStr: string = partsFechaInicio[0];

      // console.log({ fechaInicioStr });

      const fechaFinalToString: string | null = fechaFinal
        ? fechaFinal.toISOString()
        : null;

      // console.log({ fechaFinalToString });

      const partsFechaFinal: string[] = fechaFinalToString!.split("T");

      // console.log({ partsFechaFinal });

      const fechaFinalStr: string = partsFechaFinal[0];

      // console.log({ fechaFinalStr });

      let payload: Evento = {
        id_tipoevento: +idTipoEvento,
        id_categoriaevento: +idCategoriaEvento,
        titulo,
        descripcion,
        temario,
        fecha_inicio: fechaInicioStr,
        fecha_final: fechaFinalStr,
        duracion,
        modalidad,
        estado: true,
      };

      if (precio && precio.trim() !== "") {
        // Asegúrate de usar parseFloat si 'precio' puede tener decimales
        payload.precio = parseFloat(precio);
      }

      if (capacidadMinima && capacidadMinima.trim() !== "") {
        // Asegúrate de usar parseInt para capacidades
        payload.capacidad_minima = parseInt(capacidadMinima, 10);
      }

      if (capacidadMaxima && capacidadMaxima.trim() !== "") {
        payload.capacidad_maxima = parseInt(capacidadMaxima, 10);
      }

      // console.log("payload new evento");
      // console.log({ payload });

      const response = await createEvento(payload);

      // console.log("response create", response);

      const { result, message, data } = response as EventoResponse;

      // console.log({ result });

      // console.log({ message });

      // console.log({ data });

      if (result && data) {
        showToast("success", message as string);

        navigate(`/evento`);
      } else {
        showToast("error", message || "Error al registrar al evento");
        return;
      }
    } catch (error) {
      console.error("Error al registrar evento", error);
      // showToast("error", error);
      showToast("error", "Error al registrar el evento");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let listTipoEventos: DetalleParametro[] = [];

        let listCategoriaEventos: DetalleParametro[] = [];

        const queryParamsTipoEvento = `parametro_clase=${ParametroClase.TIPO_PROGRAMA}&en_persona=true&en_empresa=false&estado=true`;
        const queryParamsCategoriaEvento = `parametro_clase=${ParametroClase.CATEGORIA_PROGRAMA}&en_persona=true&en_empresa=false&estado=true`;

        const [responseTipoEventos, responseCategoriaEventos] =
          await Promise.all([
            getDetalles(queryParamsTipoEvento),
            getDetalles(queryParamsCategoriaEvento),
          ]);

        // console.log({ responseTipoEventos });

        // console.log({ responseCategoriaEventos });

        const { result: resultTipoEventos, data: dataTipoEventos } =
          responseTipoEventos;

        const { result: resultCategoriaEventos, data: dataCategoriaEventos } =
          responseCategoriaEventos;

        if (resultTipoEventos && dataTipoEventos) {
          listTipoEventos = dataTipoEventos as DetalleParametro[];
        }

        if (resultCategoriaEventos && dataCategoriaEventos) {
          listCategoriaEventos = dataCategoriaEventos as DetalleParametro[];
        }

        setTipoEventos(listTipoEventos);
        setCategoriaEventos(listCategoriaEventos);

        if (id) {
          const responseEvento = await getEventoById(+id);
          // console.log({ responseEvento });

          const { result, data, message } = responseEvento;

          if (result && data) {
            let dataForm: TEvento = {};
            const evento = data as Evento;

            const {
              id_tipoevento,
              id_categoriaevento,
              titulo,
              descripcion,
              temario,
              fecha_inicio,
              fecha_final,
              duracion,
              modalidad,
              precio,
              capacidad_minima,
              capacidad_maxima,
            } = evento;

            if (id_tipoevento) {
              dataForm.idTipoEvento = id_tipoevento.toString();
            }

            if (id_categoriaevento) {
              dataForm.idCategoriaEvento = id_categoriaevento.toString();
            }

            dataForm.titulo = titulo;
            dataForm.descripcion = descripcion || "";
            dataForm.temario = temario;
            dataForm.fechaInicio = fecha_inicio ? parseISO(fecha_inicio) : null;
            dataForm.fechaFinal = fecha_final ? parseISO(fecha_final) : null;
            dataForm.duracion = duracion;
            dataForm.modalidad = modalidad;
            dataForm.precio = precio?.toString() || "";
            dataForm.capacidadMinima = capacidad_minima?.toString() || "";
            dataForm.capacidadMaxima = capacidad_maxima?.toString() || "";
            form.reset(dataForm);
          } else {
            showToast("error", message || "Evento no encontrado");
            navigate("/evento/nuevo");
          }
        }
      } catch (error) {
        console.error("Error al obtener datos", error);
        showToast("error", "Error al cargar los datos del formulario.");
      }
    };

    fetchData();
  }, [id, form]);

  return (
    <>
      <Card className="shadow-lg border-gray-200">
        <CardHeader className="border-b border-gray-200 p-4 sm:p-6 flex flex-row items-center justify-between">
          <div className="shrink min-w-0">
            <CardTitle className="text-xl font-bold text-gray-800 truncate">
              {isEditMode ? `Actualización de evento` : `Registro de evento`}
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {isEditMode
                ? `Formulario de actualización de evento`
                : `Complete el formulario para registrar un evento`}
            </CardDescription>
          </div>
          <button
            onClick={handleGoBack}
            className="
              flex items-center text-sm font-semibold 
              text-blue-600 
              hover:text-blue-800 
              hover:bg-blue-50 
              transition-colors 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 
              rounded-md p-2 ml-4 
              cursor-pointer
            "
            aria-label="Volver al listado"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </button>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <fieldset className="border border-gray-300 p-4 rounded-md">
                <legend className="text-base font-semibold text-gray-800 px-2">
                  Información de evento
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="idTipoEvento"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Tipo de Evento</RequiredLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
                        >
                          <FormControl>
                            <SelectTrigger
                              className={`
                                ${
                                  fieldState.invalid
                                    ? "border-red-500 focus:ring-red-500"
                                    : "focus:ring-blue-500"
                                }
                                  focus:ring-2 focus:ring-offset-2 transition-all duration-300 cursor-pointer
                              `}
                            >
                              <SelectValue placeholder="Seleccionar tipo de evento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-400 placeholder-gray-400">
                            {tipoEventos.map((tipoEvento) => (
                              <SelectItem
                                value={tipoEvento.codigo!.toString()}
                                key={tipoEvento.codigo!.toString()}
                                className="cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                {tipoEvento.nombre}
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
                    name="idCategoriaEvento"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Categoría de Evento</RequiredLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
                        >
                          <FormControl>
                            <SelectTrigger
                              className={`
                                ${
                                  fieldState.invalid
                                    ? "border-red-500 focus:ring-red-500"
                                    : "focus:ring-blue-500"
                                }
                                  focus:ring-2 focus:ring-offset-2 transition-all duration-300 cursor-pointer
                              `}
                            >
                              <SelectValue placeholder="Seleccionar categoría de evento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-400 placeholder-gray-400">
                            {categoriaEventos.map((categoriaEvento) => (
                              <SelectItem
                                value={categoriaEvento.codigo!.toString()}
                                key={categoriaEvento.codigo!.toString()}
                                className="cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                {categoriaEvento.nombre}
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
                    name="titulo"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Título</RequiredLabel>
                        <FormControl>
                          <Input
                            placeholder="Gestión de recursos humanos"
                            autoComplete="off"
                            maxLength={100}
                            {...field}
                            className={`
                              ${
                                fieldState.invalid
                                  ? "border-red-500 focus:ring-red-500"
                                  : "focus:ring-blue-500"
                              }
                                transition-all duration-300
                                placeholder-gray-400
                            `}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="descripcion"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Descripción</RequiredLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Evento sobre la importancia de una correcta gestión de recursos humanos"
                            autoComplete="off"
                            maxLength={255}
                            rows={3}
                            {...field}
                            // disabled={!camposHabilitadosPersona}
                            className={`
                              ${
                                fieldState.invalid
                                  ? "border-red-500 focus:ring-red-500"
                                  : "focus:ring-blue-500"
                              }
                                transition-all duration-300
                                placeholder-gray-400
                            `}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fechaInicio"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Fecha Inicio</RequiredLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={
                              field.value
                                ? format(field.value, "yyyy-MM-dd")
                                : ""
                            }
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseISO(e.target.value)
                                  : null,
                              )
                            }
                            className={`
                              ${
                                fieldState.invalid
                                  ? "border-red-500 focus:ring-red-500"
                                  : "focus:ring-blue-500"
                              }
                                transition-all duration-300
                            `}
                            autoComplete="off"
                            // disabled={!camposHabilitadosPersona}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fechaFinal"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Fecha Final</RequiredLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={
                              field.value
                                ? format(field.value, "yyyy-MM-dd")
                                : ""
                            }
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseISO(e.target.value)
                                  : null,
                              )
                            }
                            className={`
                              ${
                                fieldState.invalid
                                  ? "border-red-500 focus:ring-red-500"
                                  : "focus:ring-blue-500"
                              }
                                transition-all duration-300
                            `}
                            autoComplete="off"
                            // disabled={!camposHabilitadosPersona}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duracion"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Duración</RequiredLabel>
                        <FormControl>
                          <Input
                            placeholder="120 horas"
                            autoComplete="off"
                            maxLength={20}
                            {...field}
                            className={`
                              ${
                                fieldState.invalid
                                  ? "border-red-500 focus:ring-red-500"
                                  : "focus:ring-blue-500"
                              }
                                transition-all duration-300
                                placeholder-gray-400
                            `}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="modalidad"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Modalidad</RequiredLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
                        >
                          <FormControl>
                            <SelectTrigger
                              className={`
                                ${
                                  fieldState.invalid
                                    ? "border-red-500 focus:ring-red-500"
                                    : "focus:ring-blue-500"
                                }
                                  focus:ring-2 focus:ring-offset-2 transition-all duration-300 cursor-pointer
                              `}
                            >
                              <SelectValue placeholder="Seleccionar una modalidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-400 placeholder-gray-400">
                            <SelectItem
                              value={"VIRTUAL"}
                              key={"VIRTUAL"}
                              className="cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                              VIRTUAL
                            </SelectItem>
                            <SelectItem
                              value={"PRESENCIAL"}
                              key={"PRESENCIAL"}
                              className="cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                              PRESENCIAL
                            </SelectItem>
                            <SelectItem
                              value={"MIXTO"}
                              key={"MIXTO"}
                              className="cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                              MIXTO
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="precio"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Precio</RequiredLabel>
                        <FormControl>
                          <Input
                            placeholder="50.00"
                            autoComplete="off"
                            maxLength={20}
                            {...field}
                            className={`
                              ${
                                fieldState.invalid
                                  ? "border-red-500 focus:ring-red-500"
                                  : "focus:ring-blue-500"
                              }
                                transition-all duration-300
                                placeholder-gray-400
                            `}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="capacidadMinima"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Capacidad mínima</RequiredLabel>
                        <FormControl>
                          <Input
                            placeholder="20"
                            autoComplete="off"
                            type="number"
                            min={0}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === "" ? null : parseInt(value, 10),
                              );
                            }}
                            className={`
                              ${
                                fieldState.invalid
                                  ? "border-red-500 focus:ring-red-500"
                                  : "focus:ring-blue-500"
                              }
                                transition-all duration-300
                                placeholder-gray-400
                            `}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="capacidadMaxima"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Capacidad máxima</RequiredLabel>
                        <FormControl>
                          <Input
                            placeholder="100"
                            autoComplete="off"
                            type="number"
                            min={1}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === "" ? null : parseInt(value, 10),
                              );
                            }}
                            className={`
                              ${
                                fieldState.invalid
                                  ? "border-red-500 focus:ring-red-500"
                                  : "focus:ring-blue-500"
                              }
                                transition-all duration-300
                                placeholder-gray-400
                            `}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 gap-6 mt-4">
                  <FormField
                    control={form.control}
                    name="temario"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Temario</RequiredLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detalle de los módulos y temas del evento"
                            autoComplete="off"
                            maxLength={1000}
                            rows={6}
                            {...field}
                            // disabled={!camposHabilitadosPersona}
                            className={`
                              ${
                                fieldState.invalid
                                  ? "border-red-500 focus:ring-red-500"
                                  : "focus:ring-blue-500"
                              }
                                transition-all duration-300
                                placeholder-gray-400
                            `}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </fieldset>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 hover: cursor-pointer text-white transition-colors duration-300"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? "Actualizando..." : "Registrando..."}
                    </>
                  ) : isEditMode ? (
                    "Actualizar"
                  ) : (
                    "Registrar"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => resetForm()}
                  className="hover:bg-gray-200 hover: cursor-pointer transition-colors duration-300"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};
