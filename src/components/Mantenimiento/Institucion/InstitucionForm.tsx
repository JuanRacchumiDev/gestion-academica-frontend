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
  createInstitucion,
  getInstitucionById,
  updateInstitucion,
} from "../../../services/institucionService";
import {
  Institucion,
  InstitucionResponse,
} from "../../../interfaces/IInstitucion";
import { useToast } from "../../../context/ToastContext";
import { RequiredLabel } from "../../../components/Common/RequiredLabel";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, XCircle } from "lucide-react";
import { ParametroClase } from "../../../params/parametroClase";
import { DetalleParametro } from "@/interfaces/IDetalleParametro";
import {
  getDetalleByParams,
  getDetalles,
} from "@/services/detalleParametroService";
import { MAX_FILE_IMAGE_2M_SIZE } from "../../../params/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const loadSedes = async () => {
  let listSedes: DetalleParametro[] = [];

  const queryParams = `parametro_clase=${ParametroClase.SEDE}&en_persona=false&en_empresa=false&estado=true`;

  const response = await getDetalles(queryParams);

  const { result, data } = response;

  if (result && data) {
    listSedes = data as DetalleParametro[];
  }

  return listSedes;
};

const formSchema = z.object({
  codigoSede: z
    .string({
      message: "La sede es requerida",
    })
    .min(2, "La sede es requerida"),
  nombre: z.string().min(2, {
    message: "El nombre es requerido.",
  }),
  sigla: z.string().nullable().optional(),
  ruc: z.string().nullable().optional(),
  direccion: z.string().nullable().optional(),
  telefonoContacto: z.string().nullable().optional(),
  logo: z
    .instanceof(File)
    .nullable()
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_FILE_IMAGE_2M_SIZE,
      `El archivo debe ser menor a 2MB`,
    ),
  nombreDirector: z.string().nullable().optional(),
  nombreRepresentante: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  codigoSede: "",
  nombre: "",
  sigla: "",
  ruc: "",
  direccion: "",
  telefonoContacto: "",
  logo: null,
  nombreDirector: "",
  nombreRepresentante: "",
};

export const InstitucionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [sedes, setSedes] = useState<DetalleParametro[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const isEditMode = !!id;

  const inputErrorClass = (invalid: boolean) =>
    invalid ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500";

  const handleGoBack = () => {
    const urlBack = `/mantenimiento/institucion`;
    navigate(urlBack);
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const resetForm = () => {
    const dataForm = defaultValues;
    form.reset(dataForm);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);

      try {
        const [listSedes] = await Promise.all([loadSedes()]);

        setSedes(listSedes);

        if (isEditMode && id) {
          const responseInstitucion = await getInstitucionById(+id);
          // console.log({ responseInstitucion });

          const { result, data } = responseInstitucion;

          if (result && data) {
            const institucion = data as Institucion;

            // console.log({ institucion });

            form.reset({
              codigoSede: institucion.codigo_sede.toString() ?? "",
              nombre: institucion.nombre ?? "",
              ruc: institucion.ruc ?? "",
              sigla: institucion.sigla ?? "",
              telefonoContacto: institucion.telefono_contacto ?? "",
              direccion: institucion.direccion ?? "",
              nombreDirector: institucion.nombre_director ?? "",
              nombreRepresentante: institucion.nombre_representante ?? "",
            });
          }
        }
      } catch (error) {
        console.error("Error al obtener datos", error);
        showToast("error", "Error al cargar las sedes del formulario.");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = new FormData();

      // console.log({ values });

      const {
        codigoSede,
        nombre,
        sigla,
        ruc,
        direccion,
        telefonoContacto,
        logo,
        nombreDirector,
        nombreRepresentante,
      } = values;

      if (isEditMode) {
        formData.append("_method", "PATCH");
      }

      formData.append("codigo_sede", codigoSede);
      formData.append("nombre", nombre);
      formData.append("ruc", ruc);
      formData.append("sigla", sigla);
      formData.append("direccion", direccion);
      formData.append("telefono_contacto", telefonoContacto);
      formData.append("nombre_director", nombreDirector);
      formData.append("nombre_representante", nombreRepresentante);

      if (logo) {
        formData.append("logo", logo);
      }

      // console.log("---- formData ----");
      // console.log({ formData });

      let response = null;

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      if (isEditMode && id) {
        response = await updateInstitucion(+id, formData, config);
      } else {
        response = await createInstitucion(formData, config);
      }

      // console.log("response create/update", response);
      const { result, message, data } = response as InstitucionResponse;

      // console.log({ result });
      // console.log({ message });
      // console.log({ data });

      if (result && data) {
        showToast(
          "success",
          message ||
            (isEditMode ? "Institución actualizada" : "Institución registrada"),
        );
        navigate(`/mantenimiento/institucion`);
      } else {
        showToast("error", message || "Error al registrar la institución");
        return;
      }
    } catch (error) {
      console.error("Error al registrar la institución", error);
      showToast("error", "Error al registrar la institución");
    }
  };

  return (
    <>
      <Card className="shadow-xl border-none bg-white">
        <CardHeader className="border-b border-gray-100 p-6 flex flex-row items-center justify-between bg-gray-50/50 rounded-t-xl">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {isEditMode
                ? `Editar institución`
                : `Nuevo Registro de institución`}
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              {isEditMode
                ? `Actualización de información de institución`
                : `Complete la información para registrar una institución`}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                <FormField
                  control={form.control}
                  name="codigoSede"
                  render={({ field, fieldState }) => (
                    <FormItem className="w-full">
                      <RequiredLabel isRequired={true}>Sede</RequiredLabel>
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
                            <SelectValue placeholder="Seleccionar sede" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white text-xs border border-slate-200 shadow-md outline-none">
                          {sedes.map((sede) => (
                            <SelectItem
                              value={sede.codigo!.toString()}
                              key={sede.codigo!.toString()}
                              className="cursor-pointer hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold transition-colors"
                            >
                              {sede.nombre}
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
                  name="nombre"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <RequiredLabel isRequired={true}>Nombre</RequiredLabel>
                      <FormControl>
                        <Input
                          placeholder="COLEGIO DE INGENIEROS DE TUMBES"
                          autoComplete="off"
                          maxLength={60}
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

                <FormField
                  control={form.control}
                  name="sigla"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <RequiredLabel>Sigla</RequiredLabel>
                      <FormControl>
                        <Input
                          placeholder="Calidad de servicio e innovación"
                          autoComplete="off"
                          maxLength={100}
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

                <FormField
                  control={form.control}
                  name="ruc"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <RequiredLabel>RUC</RequiredLabel>
                      <FormControl>
                        <Input
                          placeholder="20103040203"
                          autoComplete="off"
                          maxLength={13}
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

                <FormField
                  control={form.control}
                  name="direccion"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <RequiredLabel>DIRECCIÓN</RequiredLabel>
                      <FormControl>
                        <Input
                          placeholder="AV. PERÚ 495 - LIMA"
                          autoComplete="off"
                          maxLength={100}
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

                <FormField
                  control={form.control}
                  name="telefonoContacto"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <RequiredLabel>TELÉFONO CONTACTO</RequiredLabel>
                      <FormControl>
                        <Input
                          placeholder="909192934"
                          autoComplete="off"
                          maxLength={9}
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

                <FormField
                  control={form.control}
                  name="nombreDirector"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <RequiredLabel>NOMBRE DIRECTOR</RequiredLabel>
                      <FormControl>
                        <Input
                          placeholder="Juan Pérez Pérez"
                          autoComplete="off"
                          maxLength={150}
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

                <FormField
                  control={form.control}
                  name="nombreRepresentante"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <RequiredLabel>NOMBRE REPRESENTANTE</RequiredLabel>
                      <FormControl>
                        <Input
                          placeholder="Juan Pérez Pérez"
                          autoComplete="off"
                          maxLength={150}
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
    </>
  );
};
