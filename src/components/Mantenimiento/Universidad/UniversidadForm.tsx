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
import { ArrowLeft } from "lucide-react";
import { ParametroClase } from "../../../params/parametroClase";

const formSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre es requerido.",
  }),
  abreviatura: z.string().min(2, {
    message: "La abreviatura es requerida.",
  }),
});

export const UniversidadForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      abreviatura: "",
    },
  });

  const { isSubmitting } = form.formState;

  const isEditMode = !!id;

  const handleGoBack = () => {
    navigate("/mantenimiento/universidad");
  };

  const resetForm = () => {
    form.reset({
      nombre: "",
      abreviatura: "",
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // console.log("--- values universidad ----");
      // console.log({ values });

      let messageError: string = "";
      let response: DetalleParametroResponse;

      const payloadData: DetalleParametro = {
        ...values,
      };

      // console.log({ payloadData });

      if (isEditMode && id) {
        messageError = "Error al actualizar la universidad";
        response = await updateDetalle("universidad", +id, payloadData);
      } else {
        messageError = "Error al registrar la universidad";
        response = await createDetalle("universidad", payloadData);
      }

      const { result, message, error, code } = response;

      const messageStr = message as string;

      // console.log({ messageStr });

      // console.log({ code });

      if (result) {
        if (code === "PREVIOUSLY_REGISTERED") {
          showToast("warning", messageStr);
          return;
        } else {
          showToast("success", messageStr);
          navigate("/mantenimiento/universidad");
        }
      } else {
        showToast("error", error || messageError);
        return;
      }

      // if (result) {
      //   showToast("success", messageStr);

      //   navigate("/mantenimiento/universidad");
      // } else {
      //   showToast("error", error || messageError);
      //   return;
      // }
    } catch (error) {
      console.error("Error al registrar la universidad", error);
      showToast("error", "Error al registrar la universidad");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isEditMode) {
          const queryParams = `parametro_clase=${ParametroClase.UNIVERSIDAD}&codigo=${id}`;

          const responseUniversidad = await getDetalleByParams(queryParams);

          const { result, data, message } = responseUniversidad;

          if (result && data) {
            const universidad = data as DetalleParametro;

            form.reset({
              nombre: universidad.nombre,
              abreviatura: universidad.abreviatura,
            });
          } else {
            showToast("error", message || "universidad no encontrada");
            navigate("/mantenimiento/universidad/nuevo");
          }
        }
      } catch (error) {
        console.error("Error al obtener datos", error);
        showToast("error", "Error al cargar las universidades del formulario.");
      }
    };

    fetchData();
  }, [id, isEditMode, form, navigate, showToast]);

  return (
    <div className="flex justify-center w-full mx-auto max-w-md">
      <Card className="shadow-lg border-gray-200 w-full">
        <CardHeader className="border-b border-gray-200 flex flex-row items-center justify-between">
          <div className="shrink min-w-0">
            <CardTitle className="text-xl font-bold text-gray-800">
              {isEditMode
                ? "Actualización de universidad"
                : "Registro de universidad"}
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {isEditMode
                ? "Formulario de actualización de universidad"
                : "Complete el formulario para registrar nueva universidad"}
            </CardDescription>
          </div>
          <button
            onClick={handleGoBack}
            className="flex items-center text-sm font-semibold 
              text-blue-600 
              hover:text-blue-800 
              hover:bg-blue-50 
              transition-colors 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 
              rounded-md p-2 ml-4 
              cursor-pointer"
            aria-label="Volver al listado"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Volver
          </button>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}
              <FormField
                control={form.control}
                name="nombre"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <RequiredLabel>Nombre</RequiredLabel>
                    <FormControl>
                      <Input
                        placeholder="Universidad Nacional Pedro Ruiz Gallo"
                        autoComplete="off"
                        maxLength={100}
                        {...field}
                        value={field.value ?? ""}
                        className={`
                          ${
                            fieldState.invalid
                              ? "border-red-500 focus:ring-red-500"
                              : "focus:ring-blue-500"
                          }
                            transition-all duration-300 w-full placeholder-gray-400
                          `}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="abreviatura"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <RequiredLabel>Abreviatura</RequiredLabel>
                    <FormControl>
                      <Input
                        placeholder="UNPRG"
                        autoComplete="off"
                        maxLength={10}
                        {...field}
                        value={field.value ?? ""}
                        className={`
                          ${
                            fieldState.invalid
                              ? "border-red-500 focus:ring-red-500"
                              : "focus:ring-blue-500"
                          }
                            transition-all duration-300 w-full placeholder-gray-400
                          `}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
    </div>
  );
};
