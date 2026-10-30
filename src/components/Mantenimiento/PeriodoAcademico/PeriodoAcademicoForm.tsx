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
} from "../../../services/periodoAcademicoService";
import {
  PeriodoAcademico,
  PeriodoAcademicoResponse,
} from "../../../interfaces/IPeriodoAcademico";
import { DetalleParametro } from "../../../interfaces/IDetalleParametro";
import { useToast } from "../../../context/ToastContext";
import { RequiredLabel } from "../../../components/Common/RequiredLabel";
import { useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { getDetalleByParams } from "@/services/detalleParametroService";
import { ParametroClase } from "@/params/parametroClase";

const getCodigoEstadoAcademico = async (): Promise<number> => {
  let codigoEstado: number = 0;
  const queryParams = `parametro_clase=${ParametroClase.ESTADO_PERIODO_ACADEMICO}&nombre_url=activo`;
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

export const PeriodoAcademicoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      fecha_inicio: "",
      fecha_final: "",
    },
  });

  const { isSubmitting } = form.formState;

  const isEditMode = !!id;

  const handleGoBack = () => {
    navigate("/mantenimiento/periodo-academico");
  };

  const resetForm = () => {
    form.reset({
      nombre: "",
      fecha_inicio: "",
      fecha_final: "",
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      let messageError: string = "";
      let response: PeriodoAcademicoResponse;

      const payloadData: PeriodoAcademico = {
        nombre: values.nombre,
        fecha_inicio: values.fecha_inicio,
        fecha_final: values.fecha_final,
        estado: true,
      };

      if (isEditMode && id) {
        messageError = "Error al actualizar período académico";
        response = await updatePeriodo(+id, payloadData);
      } else {
        messageError = "Error al registrar período académico";
        const codigoEstado = await getCodigoEstadoAcademico();
        if (codigoEstado !== 0) {
          payloadData.codigo_estado_periodo_academico = codigoEstado;
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
          navigate("/mantenimiento/periodo-academico");
        }
      } else {
        showToast("error", error || messageError);
        return;
      }
    } catch (error) {
      console.error("Error al registrar período académico", error);
      showToast("error", "Error al registrar período académico");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isEditMode) {
          const responsePeriodo = await getPeriodoById(+id);

          const { result, data, message } = responsePeriodo;

          if (result && data) {
            const periodo = data as PeriodoAcademico;

            form.reset({
              nombre: periodo.nombre,
              fecha_inicio: periodo.fecha_inicio || "",
              fecha_final: periodo.fecha_final || "",
            });
          } else {
            showToast("error", message || "período académico no encontrado");
            navigate("/mantenimiento/periodo-academico/nuevo");
          }
        }
      } catch (error) {
        console.error("Error al obtener datos", error);
        showToast(
          "error",
          "Error al cargar los período académicos del formulario.",
        );
      }
    };

    fetchData();
  }, [id, isEditMode, form, navigate, showToast]);

  return (
    <div className="flex justify-center w-full mx-auto max-w-lg">
      <Card className="shadow-xl border-none bg-white w-full">
        <CardHeader className="border-b border-gray-100 p-6 flex flex-row items-center justify-between bg-gray-50/50 rounded-t-xl">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {isEditMode
                ? "Actualización de período académico"
                : "Registro de período académico"}
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              {isEditMode
                ? "Actualización de información de período académico"
                : "Complete la información para registrar un período académico"}
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
                        placeholder="Economía"
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
