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
import { RequiredLabel } from "../../Common/RequiredLabel";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { ParametroClase } from "../../../params/parametroClase";

const formSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre es requerido.",
  }),
  descripcion: z.string().nullable().optional(),
});

export const MetodoPagoForm = () => {
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
    navigate("/mantenimiento/metodo-pago");
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
      };

      if (values.descripcion && values.descripcion.length > 0) {
        payloadData["descripcion"] = values.descripcion;
      }

      if (isEditMode && id) {
        messageError = "Error al actualizar la método de pago";
        response = await updateDetalle("metodo-pago", +id, payloadData);
      } else {
        messageError = "Error al registrar la método de pago";
        response = await createDetalle("metodo-pago", payloadData);
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
          navigate("/mantenimiento/metodo-pago");
        }
      } else {
        showToast("error", error || messageError);
        return;
      }

      // if (result) {
      //   showToast("success", messageStr);

      //   navigate("/mantenimiento/metodo-pago");
      // } else {
      //   showToast("error", error || messageError);
      //   return;
      // }
    } catch (error) {
      console.error("Error al registrar la método de pago", error);
      showToast("error", "Error al registrar la método de pago");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isEditMode) {
          const queryParams = `parametro_clase=${ParametroClase.FORMA_PAGO}&codigo=${id}`;

          const responseMetodoPago = await getDetalleByParams(queryParams);

          const { result, data, message } = responseMetodoPago;

          if (result && data) {
            const metodoPago = data as DetalleParametro;

            form.reset({
              nombre: metodoPago.nombre,
              descripcion: metodoPago.descripcion,
            });
          } else {
            showToast("error", message || "método de pago no encontrado");
            navigate("/mantenimiento/metodo-pago/nuevo");
          }
        }
      } catch (error) {
        console.error("Error al obtener datos", error);
        showToast("error", "Error al cargar métodos de pago del formulario.");
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
                ? "Actualización de método de pago"
                : "Registro de método de pago"}
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {isEditMode
                ? "Formulario de actualización de método de pago"
                : "Complete el formulario para registrar nuevo método de pago"}
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
                name="descripcion"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <RequiredLabel>Descripción</RequiredLabel>
                    <FormControl>
                      <Input
                        placeholder="Descripción de método de pago"
                        autoComplete="off"
                        maxLength={120}
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
