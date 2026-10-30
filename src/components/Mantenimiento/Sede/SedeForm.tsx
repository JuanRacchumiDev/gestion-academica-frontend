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
  createDetalle,
  getDetalleByParams,
  updateDetalle,
} from "../../../services/detalleParametroService";
import {
  DetalleParametro,
  DetalleParametroResponse,
} from "../../../interfaces/IDetalleParametro";
import { useToast } from "../../../context/ToastContext";
import { RequiredLabel } from "../../../components/Common/RequiredLabel";
import { useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { ParametroClase } from "../../../params/parametroClase";

const formSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre es requerido.",
  }),
  descripcion: z.string().nullable().optional(),
});

export const SedeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      descripcion: null,
    },
  });

  const { isSubmitting } = form.formState;

  const isEditMode = !!id;

  const handleGoBack = () => {
    navigate("/mantenimiento/sede");
  };

  const resetForm = () => {
    form.reset({
      nombre: "",
      descripcion: null,
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // console.log({ values });

      let messageError: string = "";
      let response: DetalleParametroResponse;

      const payloadData: DetalleParametro = {
        nombre: values.nombre,
        estado: true,
      };

      if (values.descripcion && values.descripcion.length > 0) {
        payloadData["descripcion"] = values.descripcion;
      }

      if (isEditMode && id) {
        messageError = "Error al actualizar la sede";
        response = await updateDetalle("sede", +id, payloadData);
      } else {
        messageError = "Error al registrar la sede";
        response = await createDetalle("sede", payloadData);
      }

      // console.log({ response });

      const { result, message, error, code } = response;

      const messageStr = message as string;

      if (result) {
        if (code === "PREVIOUSLY_REGISTERED") {
          showToast("warning", messageStr);
          return;
        } else {
          showToast("success", messageStr);
          navigate("/mantenimiento/sede");
        }
        // showToast("success", messageStr);
        // navigate("/mantenimiento/sede");
      } else {
        showToast("error", error || messageError);
        return;
      }
    } catch (error) {
      console.error("Error al registrar la sede", error);
      showToast("error", "Error al registrar la sede");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isEditMode) {
          const queryParams = `parametro_clase=${ParametroClase.SEDE}&codigo=${id}`;

          const responseSede = await getDetalleByParams(queryParams);

          const { result, data, message } = responseSede;

          if (result && data) {
            const sede = data as DetalleParametro;

            form.reset({
              nombre: sede.nombre,
              descripcion: sede.descripcion,
            });
          } else {
            showToast("error", message || "sede no encontrado");
            navigate("/mantenimiento/sede/nuevo");
          }
        }
      } catch (error) {
        console.error("Error al obtener datos", error);
        showToast("error", "Error al cargar las sedes del formulario.");
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
              {isEditMode ? "Editar sede" : "Nuevo Registro de sede"}
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              {isEditMode
                ? "Actualización de información de sede"
                : "Complete el formulario para registrar nueva sede"}
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
              <FormField
                control={form.control}
                name="nombre"
                render={({ field, fieldState }) => (
                  <FormItem>
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

              <FormField
                control={form.control}
                name="descripcion"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <RequiredLabel>Descripción</RequiredLabel>
                    <FormControl>
                      <Input
                        placeholder="Descripción dla sede"
                        autoComplete="off"
                        maxLength={120}
                        {...field}
                        value={field.value ?? ""}
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

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => resetForm()}
                  className="hover:bg-gray-200 hover: cursor-pointer transition-colors duration-300"
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
