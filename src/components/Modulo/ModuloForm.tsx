import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { createModulo, getModuloById } from "../../services/moduloService";
import { getProgramas } from "../../services/programaService";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RequiredLabel } from "../Common/RequiredLabel";
import { Modulo, ModuloResponse } from "@/interfaces/IModulo";
import { Programa } from "@/interfaces/IPrograma";
import { ArrowLeft } from "lucide-react";
import { Textarea } from "../ui/textarea";
import SearchableCombobox from "../Common/SearchableCombobox";

const formSchema = z.object({
  idPrograma: z
    .string({
      message: "Seleccione un programa.",
    })
    .min(1, "Seleccione un programa."),
  titulo: z.string().min(2, {
    message: "El título es obligatorio",
  }),
  descripcion: z.string().nullable().optional(),
  video: z.string().nullable().optional(),
});

type TModulo = {
  idPrograma?: string;
  titulo?: string;
  descripcion?: string;
  video?: string;
};

export const ModuloForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [programas, setProgramas] = useState<Programa[]>([]);

  const isEditMode = !!id;

  const handleGoBack = () => {
    const urlBack = `/modulo/`;
    navigate(urlBack);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idPrograma: "",
      titulo: "",
      descripcion: "",
      video: "",
    },
  });

  const resetForm = () => {
    const dataForm: TModulo = {
      idPrograma: "",
      titulo: "",
      descripcion: "",
      video: "",
    };

    form.reset(dataForm);
  };

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // console.log({ values });

      const { idPrograma, titulo, descripcion, video } = values;

      let payload: Modulo = {
        id_programa: +idPrograma,
        titulo,
        descripcion,
        video,
        estado: true,
      };

      // console.log("payload new modulo", { payload });

      const response = await createModulo(payload);

      // console.log("response create", response);

      const { result, message, data } = response as ModuloResponse;

      // console.log({ result });

      // console.log({ message });

      // console.log({ data });

      if (result && data) {
        showToast("success", message as string);
        navigate(`/modulo`);
      } else {
        showToast("error", message || "Error al registrar el módulo");
        return;
      }
    } catch (error) {
      console.error("Error al registrar módulo", error);
      // showToast("error", error);
      showToast("error", "Error al registrar el módulo");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let listProgramas: Programa[] = [];

        const [responseProgramas] = await Promise.all([getProgramas()]);

        // console.log({ responseProgramas });

        const { result: resultProgramas, data: dataProgramas } =
          responseProgramas;

        if (resultProgramas && dataProgramas) {
          listProgramas = dataProgramas as Programa[];
        }

        setProgramas(listProgramas);

        if (isEditMode) {
          const responseModulo = await getModuloById(+id);

          const { result, data } = responseModulo;

          if (result && data) {
            const modulo = data as Modulo;

            form.reset({
              idPrograma: modulo.id_programa?.toString(),
              titulo: modulo.titulo,
              descripcion: modulo.descripcion,
              video: modulo.video,
            });
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
              {isEditMode ? `Actualización de módulo` : `Registro de módulo`}
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {isEditMode
                ? `Formulario de actualización de módulo`
                : `Complete el formulario para registrar un módulo`}
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
                  Información de módulo
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="idPrograma"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Programa</RequiredLabel>
                        <SearchableCombobox<Programa>
                          placeholder="Buscar un programa"
                          options={programas}
                          value={field.value}
                          onChange={field.onChange}
                          displayKey="titulo"
                          valueKey="id"
                          searchKeys={[
                            "titulo",
                            "codigo_segmento",
                            "codigo_tipoprograma",
                          ]}
                          isInvalid={fieldState.invalid}
                          renderOption={(programa) => (
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-gray-900 truncate">
                                {programa.titulo}
                              </span>
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                <span className="bg-gray-100 px-1.5 py-0.5 rounded border">
                                  {programa.segmento?.nombre || "Sin segmento"}
                                </span>
                                <span className="italic text-blue-600">
                                  {programa.tipo_programa?.nombre || "Sin tipo"}
                                </span>
                              </div>
                            </div>
                          )}
                        />
                        <FormMessage className="text-xs font-medium text-red-500" />
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
                            placeholder="Módulo introductorio de finanzas"
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
                            placeholder="Descripción del módulo de un programa"
                            autoComplete="off"
                            maxLength={150}
                            rows={3}
                            {...field}
                            value={field.value ?? ""}
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
                    name="video"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <RequiredLabel>Video</RequiredLabel>
                        <FormControl>
                          <Input
                            placeholder="URL del módulo"
                            autoComplete="off"
                            maxLength={150}
                            {...field}
                            value={field.value ?? ""}
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
