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
  descripcion: z.string().optional(),
});

export const CategoriaEventoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
    },
  });

  const { isSubmitting } = form.formState;

  const isEditMode = !!id;

  const handleGoBack = () => {
    navigate("/mantenimiento/categoria-evento");
  };

  const resetForm = () => {
    form.reset({
      nombre: "",
      descripcion: "",
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      let messageError: string = "";
      let response: DetalleParametroResponse;

      const payloadData: DetalleParametro = {
        ...values,
        estado: true,
      };

      if (isEditMode && id) {
        messageError = "Error al actualizar el categoría de evento";
        response = await updateDetalle("categoria-evento", +id, payloadData);
      } else {
        messageError = "Error al registrar el categoría de evento";
        response = await createDetalle("categoria-evento", payloadData);
      }

      const { result, message, error } = response;

      if (result) {
        const messageStr = message as string;

        showToast("success", messageStr);

        navigate("/mantenimiento/categoria-evento");
      } else {
        showToast("error", error || messageError);
        return;
      }
    } catch (error) {
      console.error("Error al registrar la categoría de evento", error);
      showToast("error", "Error al registrar la categoría de evento");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isEditMode) {
          const queryParams = `parametro_clase=${ParametroClase.CATEGORIA_PROGRAMA}&codigo=${id}`;

          const responseCategoriaEvento = await getDetalleByParams(queryParams);

          const { result, data, message } = responseCategoriaEvento;

          if (result && data) {
            const categoriaEvento = data as DetalleParametro;

            form.reset({
              nombre: categoriaEvento.nombre,
              descripcion: categoriaEvento.descripcion,
            });
          } else {
            showToast("error", message || "categoría de evento no encontrado");
            navigate("/mantenimiento/categoria-evento/nuevo");
          }
        }
      } catch (error) {
        console.error("Error al obtener datos", error);
        showToast(
          "error",
          "Error al cargar los categoría de eventos del formulario.",
        );
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
                ? "Actualización de categoría de evento"
                : "Registro de categoría de evento"}
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {isEditMode
                ? "Formulario de actualización de categoría de evento"
                : "Complete el formulario para registrar nuevo categoría de evento"}
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
                        placeholder="Humanidades"
                        autoComplete="off"
                        maxLength={100}
                        {...field}
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
                name="descripcion"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <RequiredLabel>Descripción</RequiredLabel>
                    <FormControl>
                      <Input
                        placeholder="Descripción de categoría de evento"
                        autoComplete="off"
                        maxLength={120}
                        {...field}
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

              {/* </div> */}
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
