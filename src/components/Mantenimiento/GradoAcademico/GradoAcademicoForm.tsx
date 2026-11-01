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
  createGrado,
  getGradoById,
  updateGrado,
} from "../../../services/gradoAcademicoService";
import {
  GradoAcademico,
  GradoAcademicoResponse,
} from "../../../interfaces/IGradoAcademico";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const loadNivelAcademico = async (): Promise<DetalleParametro[]> => {
  let tipos: DetalleParametro[] = [];

  const queryParams = `parametro_clase=${ParametroClase.NIVEL_ACADEMICO}&en_persona=false&en_empresa=false&estado=true`;

  try {
    const response = await getDetalles(queryParams);

    const { result, data } = response;

    if (result && data) {
      tipos = data as DetalleParametro[];
    }

    return tipos;
  } catch (error) {
    console.error("Error al obtener niveles académicos", error);
    return [];
  }
};

const formSchema = z.object({
  codigoNivelAcademico: z
    .string({
      message: "El tipo de periodo es requerido",
    })
    .min(1, "El tipo de periodo es requerido"),
  nombre: z.string().min(2, {
    message: "El nombre es requerido.",
  }),
});

export const GradoAcademicoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [niveles, setNiveles] = useState<DetalleParametro[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigoNivelAcademico: "",
      nombre: "",
    },
  });

  const { isSubmitting } = form.formState;

  const isEditMode = !!id;

  const handleGoBack = () => {
    navigate("/mantenimiento/grado-academico");
  };

  const resetForm = () => {
    form.reset({
      codigoNivelAcademico: "",
      nombre: "",
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      let messageError: string = "";
      let response: GradoAcademicoResponse;

      const payloadData: GradoAcademico = {
        codigo_nivel_academico: +values.codigoNivelAcademico,
        nombre: values.nombre,
        estado: true,
      };

      if (isEditMode && id) {
        messageError = "Error al actualizar grado académico";
        response = await updateGrado(+id, payloadData);
      } else {
        messageError = "Error al registrar grado académico";
        console.log({ payloadData });
        response = await createGrado(payloadData);
      }

      const { result, message, error, code } = response;
      const messageStr = message as string;

      if (result) {
        if (code === "PREVIOUSLY_REGISTERED") {
          showToast("warning", messageStr);
          return;
        } else {
          showToast("success", messageStr);
          navigate("/mantenimiento/grado-academico");
        }
      } else {
        showToast("error", error || messageError);
        return;
      }
    } catch (error) {
      console.error("Error al registrar grado académico", error);
      showToast("error", "Error al registrar grado académico");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listNiveles] = await Promise.all([loadNivelAcademico()]);
        setNiveles(listNiveles);

        if (isEditMode && id) {
          const responsePeriodo = await getGradoById(+id);

          const { result, data, message } = responsePeriodo;

          if (result && data) {
            const periodo = data as GradoAcademico;

            form.reset({
              codigoNivelAcademico:
                String(periodo.codigo_nivel_academico) || "",
              nombre: periodo.nombre,
            });
          } else {
            showToast("error", message || "grado académico no encontrado");
            navigate("/mantenimiento/grado-academico/nuevo");
          }
        }
      } catch (error) {
        console.error("Error al obtener datos", error);
        showToast(
          "error",
          "Error al cargar los nivele académicos del formulario.",
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
                ? "Actualización de grado académico"
                : "Registro de grado académico"}
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              {isEditMode
                ? "Actualización de información de grado académico"
                : "Complete la información para registrar un grado académico"}
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
                        placeholder="CUARTO DE PRIMARIA"
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
                name="codigoNivelAcademico"
                render={({ field, fieldState }) => (
                  <FormItem className="w-full">
                    <RequiredLabel isRequired={true}>
                      Nivel académico
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
                          <SelectValue placeholder="Seleccionar nivel académico" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white text-xs border border-slate-200 shadow-md outline-none">
                        {niveles.map((nivel) => (
                          <SelectItem
                            value={nivel.codigo.toString()}
                            key={nivel.codigo!.toString()}
                            className="cursor-pointer hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold transition-colors"
                          >
                            {nivel.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs font-medium text-red-500" />
                  </FormItem>
                )}
              />

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
