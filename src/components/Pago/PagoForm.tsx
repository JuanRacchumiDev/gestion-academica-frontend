import React, { useState, useEffect } from "react";
import { Matricula } from "../../interfaces/IMatricula";
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  ListFilter,
  Wallet,
  Hash,
  Loader2,
  ArrowLeft,
  Info,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { Spinner } from "../../components/Common/Spinner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { getDetalles } from "../../services/detalleParametroService";
import {
  getModulosPendientes,
  getModulosCancelados,
} from "../../services/matriculaService";
import { createPago } from "../../services/pagoService";
import {
  ModuloPendiente,
  ModuloPagado,
  PagoResponse,
  Pago,
} from "../../interfaces/IPago";
import {
  DetalleParametro,
  DetalleParametroFilters,
} from "../../interfaces/IDetalleParametro";
import { DetalleMatricula } from "../../interfaces/IDetalleMatricula";
import { ParametroClase } from "../../params/parametroClase";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RequiredLabel } from "../Common/RequiredLabel";
import { padString } from "@/utils/stringUtils";
import { VALOR_MODULO } from "@/params/constants";

const loadFormasPago = async () => {
  let formasPago: DetalleParametro[] = [];

  // const filters: DetalleParametroFilters = {
  //   parametro_clase: ParametroClase.FORMA_PAGO,
  //   en_persona: false,
  //   en_empresa: false,
  //   estado: true,
  // };

  const queryParams = `parametro_clase=${ParametroClase.FORMA_PAGO}&en_persona=false&en_empresa=false&estado=true`;

  const response = await getDetalles(queryParams);

  const { result, data } = response;

  if (result && data) {
    formasPago = data as DetalleParametro[];
  }

  return formasPago;
};

const loadModulosPendientes = async (matriculaId: number) => {
  let modulosPendientes: ModuloPendiente[] = [];

  const response = await getModulosPendientes(matriculaId);

  const {
    result,
    data: { modulos },
  } = response;

  if (result && modulos) {
    modulosPendientes = modulos as ModuloPendiente[];
  }

  return modulosPendientes;
};

const loadModulosPagados = async (matriculaId: number) => {
  let modulosPagados: ModuloPagado[] = [];

  const response = await getModulosCancelados(matriculaId);

  const {
    result,
    data: { modulos },
  } = response;

  if (result && modulos) {
    modulosPagados = modulos as ModuloPagado[];
  }

  return modulosPagados;
};

interface FormularioPagoProps {
  matriculaSeleccionada: Matricula;
  idSucursal: number;
  onCancel: () => void;
}

export const baseFormSchema = z.object({
  idFormaPago: z.string().min(1, "Debe seleccionar una forma de pago"),
  concepto: z.string().default(""),
  numeroModulo: z.coerce.number().min(1, "Debe seleccionar un módulo"),
  numeroOperacion: z.string().default(""),
  fechaPago: z.date({ message: "La fecha de pago es requerida" }),
  cantidadEfectivo: z.coerce.number().default(0),
  cantidadOperacion: z.coerce.number().default(0),
  formaPagoNombre: z.string().optional(),
});

export const formSchema = baseFormSchema.superRefine((val, ctx) => {
  const nombreForma = val.formaPagoNombre?.toLowerCase() ?? "";

  if (nombreForma.includes("efectivo")) {
    if (val.cantidadEfectivo <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El monto en efectivo es requerido",
        path: ["cantidadEfectivo"],
      });
    }
  }

  if (
    nombreForma.includes("plin") ||
    nombreForma.includes("transferencia") ||
    nombreForma.includes("yape")
  ) {
    if (val.cantidadOperacion <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El monto remoto es requerido",
        path: ["cantidadOperacion"],
      });
    }

    if (!val.numeroOperacion || val.numeroOperacion.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El código de operación es requerido para el monto remoto",
        path: ["numeroOperacion"],
      });
    }
  }

  if (nombreForma.includes("mixto")) {
    if (val.cantidadEfectivo <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El monto en efectivo es requerido",
        path: ["cantidadEfectivo"],
      });
    }

    if (val.cantidadOperacion <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El monto remoto es requerido",
        path: ["cantidadOperacion"],
      });
    }

    if (!val.numeroOperacion || val.numeroOperacion.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El código de operación es requerido para el monto remoto",
        path: ["numeroOperacion"],
      });
    }
  }
});

type TFormInput = z.input<typeof formSchema>;
type TFormOutput = z.output<typeof formSchema>;

const today = new Date();

export const PagoForm: React.FC<FormularioPagoProps> = ({
  matriculaSeleccionada,
  idSucursal,
  onCancel,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formasPago, setFormasPago] = useState<DetalleParametro[]>([]);
  const [modulosPendientes, setModulosPendientes] = useState<ModuloPendiente[]>(
    [],
  );
  const [modulosPagados, setModulosPagados] = useState<ModuloPagado[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [valorPorModulo, setValorPorModulo] = useState<number>(VALOR_MODULO);

  const inputErrorClass = (invalid: boolean) =>
    invalid
      ? "border-destructive focus-visible:ring-destructive focus:ring-destructive"
      : "focus:ring-indigo-500";

  // console.log({ matriculaSeleccionada });

  // Obteniendo id de la matrícula y detalles
  const { id: idMatricula, persona, detalles } = matriculaSeleccionada;

  const form = useForm<TFormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idFormaPago: "",
      concepto: "",
      numeroModulo: "",
      numeroOperacion: "",
      fechaPago: today,
      cantidadEfectivo: 0,
      cantidadOperacion: 0,
      formaPagoNombre: "",
    },
  });

  const { watch, setValue, reset } = form;
  const currentFormaPago = watch("idFormaPago");
  const currentCantidadEfectivo = watch("cantidadEfectivo") || 0;
  const currentCantidadOperacion = watch("cantidadOperacion") || 0;

  const totalRecibido =
    Number(currentCantidadEfectivo) + Number(currentCantidadOperacion);

  const { isSubmitting } = form.formState;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);

      try {
        const [listFormasPago, listModulosPendientes, listModulosPagados] =
          await Promise.all([
            loadFormasPago(),
            loadModulosPendientes(idMatricula),
            loadModulosPagados(idMatricula),
          ]);

        setFormasPago(listFormasPago);
        setModulosPendientes(listModulosPendientes);
        setModulosPagados(listModulosPagados);

        // Obteniendo el valor de un  módulo
        if (detalles && detalles.length > 0) {
          const detalleMatricula = detalles[0] as DetalleMatricula;

          const { valor_modulo: valorModuloDefined } = detalleMatricula;

          // console.log({ detalleMatricula });

          // console.log({ valorModuloDefined });

          if (valorModuloDefined) {
            setValorPorModulo(Number(valorModuloDefined));
          } else {
            setValorPorModulo(VALOR_MODULO);
          }
        } else {
          setValorPorModulo(VALOR_MODULO);
        }
      } catch (error) {
        console.error("Error al cargar los catálogos formulario", error);
        showToast("error", "Error al cargar los catálogos del formulario.");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [idMatricula]);

  const handleFormaPagoChange = (val: string) => {
    setValue("idFormaPago", val);
    const seleccionado = formasPago.find((f) => f.codigo?.toString() === val);
    setValue("formaPagoNombre", seleccionado?.nombre ?? "", {
      shouldValidate: true,
    });
  };

  const onSubmit: SubmitHandler<TFormOutput> = async (values) => {
    try {
      // console.log({ totalRecibido });
      // console.log({ valorPorModulo });

      if (totalRecibido > valorPorModulo) {
        showToast(
          "error",
          `El monto total ingresado (S/. ${totalRecibido.toFixed(2)}) no puede ser mayor al costo del módulo (S/. ${valorPorModulo.toFixed(2)})`,
        );
        return;
      }

      const fechaPagoStr = values.fechaPago
        ? format(values.fechaPago, "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd");

      const payload: Pago = {
        id_matricula: idMatricula,
        id_sucursal: idSucursal,
        codigo_formapago: +values.idFormaPago,
        concepto: values.concepto,
        numero_modulo: values.numeroModulo,
        numero_operacion: values.numeroOperacion,
        fecha_pago: fechaPagoStr,
        cantidad_efectivo: values.cantidadEfectivo,
        cantidad_operacion: values.cantidadOperacion,
        estado: true,
      };

      const response = await createPago(payload);
      const { result, message } = response as PagoResponse;

      if (result) {
        showToast("success", message || "Pago registrado");
        navigate(`/matricula`);
      } else {
        showToast("error", message || "Error al procesar la matrícula");
      }
    } catch (error) {
      console.error("Error en submit de pago", error);
      showToast(
        "error",
        "Ocurrió un error inesperado al procesar el formulario.",
      );
    }
  };

  const handleCancelar = () => {
    reset();
    onCancel();
  };

  const handleGoBack = () => {
    const urlBack = `/matricula/`;
    navigate(urlBack);
  };

  const formaPagoSeleccionada = formasPago.find(
    (f) => f.codigo?.toString() === currentFormaPago,
  );

  const nombreForma = formaPagoSeleccionada?.nombre?.toLowerCase() ?? "";
  const mostrarEfectivo =
    nombreForma.includes("efectivo") || nombreForma.includes("mixto");
  const mostrarDigital =
    nombreForma.includes("transferencia") ||
    nombreForma.includes("yape") ||
    nombreForma.includes("plin") ||
    nombreForma.includes("depósito") ||
    nombreForma.includes("deposito") ||
    nombreForma.includes("mixto");

  return (
    <Card className="relative mx-auto max-w-6xl overflow-hidden border-slate-200 shadow-xl">
      {isLoadingData && (
        <div className="absolute inset-0 bg-white/75 backdrop-blur-xs flex flex-col gap-2 items-center justify-center z-50">
          <Spinner className="h-10 w-10 text-indigo-600 animate-spin" />
          <span className="text-sm font-semibold text-slate-600 animate-pulse">
            Cargando información...
          </span>
        </div>
      )}

      <CardHeader className="bg-slate-950 px-6 py-5 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleGoBack}
              className="text-slate-400 hover:text-white hover:bg-slate-900 transition-all p-2 h-auto"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Volver</span>
            </Button>
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl font-bold tracking-tight">
                <CreditCard className="h-5 w-5 text-indigo-400" />
                Registro de Pago
              </CardTitle>
              <CardDescription className="text-slate-400">
                Estudiante:{" "}
                <span className="font-semibold text-slate-200">
                  {persona?.nombre_completo}
                </span>
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 md:self-auto">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Matrícula Ref:
            </span>
            <span className="font-mono text-sm font-bold text-indigo-400">
              #{padString(4, idMatricula, "left")}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-1 p-0 lg:grid-cols-12">
        {/* Columna Izquierda: Formulario */}
        <div className="p-6 md:p-8 lg:col-span-7 border-b lg:border-b-0 lg:border-r border-slate-200">
          <h3 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
              1
            </span>
            Datos de la Transacción
          </h3>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="numeroModulo"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col w-full">
                    <RequiredLabel>Seleccionar módulo por pagar</RequiredLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        setValue(
                          "concepto",
                          val ? `PAGO DE MÓDULO #${val}` : "",
                        );
                      }}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={`w-full ${inputErrorClass(fieldState.invalid)}`}
                        >
                          <SelectValue placeholder="Seleccionar módulo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {modulosPendientes.length === 0 ? (
                          <SelectItem value="0" disabled>
                            🎉 ¡Todos los módulos están pagados!
                          </SelectItem>
                        ) : (
                          modulosPendientes.map((mod) => (
                            <SelectItem
                              key={mod.numero_modulo}
                              value={mod.numero_modulo.toString()}
                            >
                              Módulo N° {mod.numero_modulo} (Pendiente)
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="concepto"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <RequiredLabel>Concepto del Recibo</RequiredLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ej. Pago de Matrícula - Modulo I"
                        autoComplete="off"
                        className={inputErrorClass(fieldState.invalid)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="idFormaPago"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col w-full">
                    <RequiredLabel>Forma de pago</RequiredLabel>
                    <Select
                      onValueChange={handleFormaPagoChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={`w-full ${inputErrorClass(fieldState.invalid)}`}
                        >
                          <SelectValue placeholder="Seleccionar forma pago" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {formasPago.map((fp) => (
                          <SelectItem
                            value={fp.codigo!.toString()}
                            key={fp.codigo}
                          >
                            {fp.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(mostrarEfectivo || mostrarDigital) && (
                <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Arqueo de Valores
                  </span>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {mostrarEfectivo && (
                      <FormField
                        control={form.control}
                        name="cantidadEfectivo"
                        render={({ field, fieldState }) => (
                          <FormItem
                            className={mostrarDigital ? "" : "md:col-span-2"}
                          >
                            <FormLabel className="text-xs font-medium text-slate-600">
                              Monto Efectivo Recibido (S/.)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                value={(field.value as number | string) ?? ""}
                                autoComplete="off"
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                className={inputErrorClass(fieldState.invalid)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {mostrarDigital && (
                      <>
                        <FormField
                          control={form.control}
                          name="cantidadOperacion"
                          render={({ field, fieldState }) => (
                            <FormItem
                              className={mostrarEfectivo ? "" : "md:col-span-2"}
                            >
                              <FormLabel className="text-xs font-medium text-slate-600">
                                Monto Remoto / App (S/.)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...field}
                                  value={(field.value as number | string) ?? ""}
                                  autoComplete="off"
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className={inputErrorClass(
                                    fieldState.invalid,
                                  )}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="numeroOperacion"
                          render={({ field, fieldState }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-xs font-medium text-slate-600">
                                Código Único de Operación
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ej: OPE-987123"
                                  autoComplete="off"
                                  className={`font-mono uppercase ${inputErrorClass(fieldState.invalid)}`}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/70 p-3 text-xs text-blue-800">
                <Info className="h-4 w-4 shrink-0 text-blue-600" />
                <span>
                  El costo estándar estipulado por módulo es de{" "}
                  <strong className="font-semibold text-blue-900">
                    S/. {valorPorModulo.toFixed(2)}
                  </strong>
                  .
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-900 p-4 text-white shadow-inner">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Total neto a recibir:
                </span>
                <span className="font-mono text-2xl font-black text-emerald-400">
                  S/. {totalRecibido.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelar}
                  className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isLoadingData}
                  className="rounded-xl bg-indigo-600 font-bold text-white shadow-md hover:bg-indigo-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando Pago...
                    </>
                  ) : (
                    "Emitir y Guardar Pago"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Columna Derecha: Panel de Módulos */}
        <div className="p-6 md:p-8 lg:col-span-5 bg-slate-50/50 flex flex-col space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <ListFilter className="h-4 w-4 text-indigo-600" />
              Estado Analítico de Módulos
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Monitoreo en tiempo real de los módulos registrados bajo esta
              matrícula.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Historial de Módulos Cancelados
            </span>

            {modulosPagados.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-xs text-slate-400 shadow-sm">
                No se registran transacciones previas aprobadas.
              </div>
            ) : (
              <div className="max-h-104 space-y-3 overflow-y-auto pr-1">
                {modulosPagados.map((modPagado, index) => {
                  const totalFila =
                    (Number(modPagado.cantidad_efectivo) || 0) +
                    (Number(modPagado.cantidad_operacion) || 0);

                  return (
                    <div
                      key={index}
                      className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-emerald-200"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          <span className="text-xs font-bold leading-tight text-slate-800">
                            {modPagado.concepto ||
                              `PAGO DE MÓDULO #${modPagado.numero_modulo}`}
                          </span>
                        </div>
                        <span className="shrink-0 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          S/. {totalFila.toFixed(2)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {modPagado.fecha_pago
                            ? format(
                                parseISO(modPagado.fecha_pago),
                                "dd/MM/yyyy",
                              )
                            : "---"}
                        </span>
                        <span className="flex items-center gap-1.5 truncate">
                          <Wallet className="h-3.5 w-3.5 text-slate-400" />
                          <span className="truncate">
                            {modPagado.nombre_formapago || "No especificado"}
                          </span>
                        </span>

                        <div className="col-span-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md bg-slate-50 p-2 text-[10px] font-medium text-slate-600">
                          {!!modPagado.cantidad_efectivo && (
                            <span>
                              EFEC:{" "}
                              <strong className="font-mono text-slate-700">
                                S/.{" "}
                                {Number(modPagado.cantidad_efectivo).toFixed(2)}
                              </strong>
                            </span>
                          )}
                          {!!modPagado.cantidad_operacion && (
                            <span>
                              REMOTO:{" "}
                              <strong className="font-mono text-slate-700">
                                S/.{" "}
                                {Number(modPagado.cantidad_operacion).toFixed(
                                  2,
                                )}
                              </strong>
                            </span>
                          )}
                          {modPagado.numero_operacion && (
                            <span className="ml-auto flex items-center gap-0.5 font-mono font-semibold text-indigo-600">
                              <Hash className="h-3 w-3" />
                              {modPagado.numero_operacion}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
