import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../../ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Spinner } from "../../Common/Spinner";
import {
  createPeriodo,
  getPeriodoById,
  updatePeriodo,
} from "../../../services/periodoEvaluacionService";
import {
  PeriodoEvaluacion,
  PeriodoEvaluacionResponse,
} from "../../../interfaces/IPeriodoEvaluacion";
import { DetalleParametro } from "../../../interfaces/IDetalleParametro";
import { useToast } from "../../../context/ToastContext";
import { RequiredLabel } from "../../../components/Common/RequiredLabel";
import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import {
  getDetalleByParams,
  getDetalles,
} from "@/services/detalleParametroService";
import { ParametroClase } from "@/params/parametroClase";
import { PeriodoAcademico } from "@/interfaces/IPeriodoAcademico";
import { getPeriodos } from "../../../services/periodoAcademicoService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const loadPeriodos = async (): Promise<PeriodoAcademico[]> => {
  let periodos: PeriodoAcademico[] = [];

  const queryParams = `estado=true`;
  try {
    const response = await getPeriodos(queryParams);

    const { result, data } = response;

    if (result && data) {
      periodos = data as PeriodoAcademico[];
    }

    return periodos;
  } catch (error) {
    console.error("Error al obtener periodos académicos", error);
    return [];
  }
};

const loadTipoPeriodos = async (): Promise<DetalleParametro[]> => {
  let tipos: DetalleParametro[] = [];

  const queryParams = `parametro_clase=${ParametroClase.TIPO_PERIODO_ACADEMICO}&en_persona=false&en_empresa=false&estado=true`;

  try {
    const response = await getDetalles(queryParams);

    const { result, data } = response;

    if (result && data) {
      tipos = data as DetalleParametro[];
    }

    return tipos;
  } catch (error) {
    console.error("Error al obtener grupo de personas", error);
    return [];
  }
};

const getCodigoTipoPeriodocademico = async (): Promise<number> => {
  let codigoEstado: number = 0;
  const queryParams = `parametro_clase=${ParametroClase.TIPO_PERIODO_ACADEMICO}&nombre_url=activo`;
  console.log({ queryParams });
  const responseDetalle = await getDetalleByParams(queryParams);
  console.log({ responseDetalle });
  const { result, data } = responseDetalle;
  if (result && data) {
    const detalle = data as DetalleParametro;
    const { codigo } = detalle;
    codigoEstado = codigo;
  }
  return codigoEstado;
};

const formSchema = z.object({
  idPeriodoAcademico: z
    .string({
      message: "El periodo es requerido",
    })
    .min(1, "La institución es requerida"),
  codigoTipoPeriodo: z
    .string({
      message: "El tipo de periodo es requerido",
    })
    .min(1, "El tipo de periodo es requerido"),
  nombre: z.string().min(2, {
    message: "El nombre es requerido.",
  }),
  fecha_inicio: z
    .string({ message: "La fecha de inicio es requerida" })
    .min(1, {
      message: "La fecha de inicio es requerida.",
    }),
  fecha_final: z.string({ message: "La fecha final es requerida" }).min(1, {
    message: "La fecha final es requerida.",
  }),
});

export const PeriodoEvaluacionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([]);
  const [tipoPeriodos, setTipoPeriodos] = useState<DetalleParametro[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idPeriodoAcademico: "",
      codigoTipoPeriodo: "",
      nombre: "",
      fecha_inicio: "",
      fecha_final: "",
    },
  });

  const { isSubmitting } = form.formState;

  const isEditMode = !!id;

  const handleGoBack = () => {
    navigate("/mantenimiento/periodo-evaluacion");
  };

  const resetForm = () => {
    form.reset({
      idPeriodoAcademico: "",
      codigoTipoPeriodo: "",
      nombre: "",
      fecha_inicio: "",
      fecha_final: "",
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      let messageError: string = "";
      let response: PeriodoEvaluacionResponse;

      const payloadData: PeriodoEvaluacion = {
        id_periodo_academico: +values.idPeriodoAcademico,
        codigo_tipo_periodo_academico: +values.codigoTipoPeriodo,
        nombre: values.nombre,
        fecha_inicio: values.fecha_inicio,
        fecha_final: values.fecha_final,
        estado: true,
      };

      if (isEditMode && id) {
        messageError = "Error al actualizar período de evaluación";
        response = await updatePeriodo(+id, payloadData);
      } else {
        messageError = "Error al registrar período de evaluación";
        const codigoEstado = await getCodigoTipoPeriodocademico();
        if (codigoEstado !== 0) {
          payloadData.codigo_tipo_periodo_academico = codigoEstado;
        }
        console.log({ payloadData });
        response = await createPeriodo(payloadData);
      }

      const { result, message, error, code } = response;
      const messageStr = message as string;

      if (result) {
        if (code === "PREVIOUSLY_REGISTERED") {
          showToast("warning", messageStr);
          return;
        } else {
          showToast("success", messageStr);
          navigate("/mantenimiento/periodo-evaluacion");
        }
      } else {
        showToast("error", error || messageError);
        return;
      }
    } catch (error) {
      console.error("Error al registrar período de evaluación", error);
      showToast("error", "Error al registrar período de evaluación");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listPeriodo, listTipoPeriodo] = await Promise.all([
          loadPeriodos(),
          loadTipoPeriodos(),
        ]);
        setPeriodos(listPeriodo);
        setTipoPeriodos(listTipoPeriodo);

        if (isEditMode && id) {
          const responsePeriodo = await getPeriodoById(+id);

          const { result, data, message } = responsePeriodo;

          if (result && data) {
            const periodo = data as PeriodoEvaluacion;

            form.reset({
              idPeriodoAcademico: String(periodo.id_periodo_academico) || "",
              codigoTipoPeriodo:
                String(periodo.codigo_tipo_periodo_academico) || "",
              nombre: periodo.nombre,
              fecha_inicio: periodo.fecha_inicio || "",
              fecha_final: periodo.fecha_final || "",
            });
          } else {
            showToast(
              "error",
              message || "período de evaluación no encontrado",
            );
            navigate("/mantenimiento/periodo-evaluacion/nuevo");
          }
        }
      } catch (error) {
        console.error("Error al obtener datos", error);
        showToast(
          "error",
          "Error al cargar los períodos de evaluaciones del formulario.",
        );
      }
    };

    fetchData();
  }, [id, isEditMode]);

  return (
    <div className="flex justify-center w-full mx-auto max-w-lg">
      <Card className="shadow-xl border-none bg-white w-full">
        <CardHeader className="border-b border-gray-100 p-6 flex flex-row items-center justify-between bg-gray-50/50 rounded-t-xl">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {isEditMode
                ? "Actualización de período de evaluación"
                : "Registro de período de evaluación"}
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              {isEditMode
                ? "Actualización de información de período de evaluación"
                : "Complete la información para registrar un período de evaluación"}
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
              {/* Campo Nombre */}
              <FormField
                control={form.control}
                name="nombre"
                render={({ field, fieldState }) => (
                  <FormItem className="w-full">
                    <RequiredLabel isRequired={true}>Nombre</RequiredLabel>
                    <FormControl>
                      <Input
                        placeholder="I BEMESTRE"
                        autoComplete="off"
                        maxLength={100}
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

              <FormField
                control={form.control}
                name="idPeriodoAcademico"
                render={({ field, fieldState }) => (
                  <FormItem className="w-full">
                    <RequiredLabel isRequired={true}>
                      Periodo Académico
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
                        >
                          <SelectValue placeholder="Seleccionar periodo académico" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white text-xs border border-slate-200 shadow-md outline-none">
                        {periodos.map((periodo) => (
                          <SelectItem
                            value={periodo.id!.toString()}
                            key={periodo.id!.toString()}
                            className="cursor-pointer hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold transition-colors"
                          >
                            {periodo.nombre}
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
                name="codigoTipoPeriodo"
                render={({ field, fieldState }) => (
                  <FormItem className="w-full">
                    <RequiredLabel isRequired={true}>
                      Tipo periodo
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
                        >
                          <SelectValue placeholder="Seleccionar tipo periodo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white text-xs border border-slate-200 shadow-md outline-none">
                        {tipoPeriodos.map((tipoPeriodo) => (
                          <SelectItem
                            value={tipoPeriodo.codigo.toString()}
                            key={tipoPeriodo.codigo!.toString()}
                            className="cursor-pointer hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold transition-colors"
                          >
                            {tipoPeriodo.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs font-medium text-red-500" />
                  </FormItem>
                )}
              />

              {/* Contenedor de Fechas alineadas en fila (Grid de 2 columnas) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Campo Fecha Inicio */}
                <FormField
                  control={form.control}
                  name="fecha_inicio"
                  render={({ field, fieldState }) => (
                    <FormItem className="w-full">
                      <RequiredLabel isRequired={true}>
                        Fecha de Inicio
                      </RequiredLabel>
                      <FormControl>
                        <Input
                          type="date"
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

                {/* Campo Fecha Final */}
                <FormField
                  control={form.control}
                  name="fecha_final"
                  render={({ field, fieldState }) => (
                    <FormItem className="w-full">
                      <RequiredLabel isRequired={true}>
                        Fecha Final
                      </RequiredLabel>
                      <FormControl>
                        <Input
                          type="date"
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

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => resetForm()}
                  className="border-slate-200 text-slate-700 hover:bg-slate-50"
                >
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
    </div>
  );
};
