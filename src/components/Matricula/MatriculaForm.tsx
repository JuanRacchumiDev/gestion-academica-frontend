import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
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
  FormLabel,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch"; // Componente Switch de shadcn/ui
import { RequiredLabel } from "../Common/RequiredLabel";
import {
  ArrowLeft,
  Save,
  CreditCard,
  BookOpen,
  Info,
  Calculator,
  XCircle,
  Plus,
  Trash2,
} from "lucide-react";
import {
  DetalleParametro,
  DetalleParametroFilters,
} from "../../interfaces/IDetalleParametro";
import {
  VALOR_MATRICULA,
  VALOR_MODULO,
  TIMEZONE_AMERICA_LIMA,
} from "../../params/constants";
import { getPersonas } from "../../services/personaService";
import { Persona } from "../../interfaces/IPersona";
import { getInstituciones } from "../../services/institucionService";
import { Institucion } from "../../interfaces/IInstitucion";
import {
  getDetalleByParams,
  getDetalles,
} from "../../services/detalleParametroService";
import { getProgramas } from "../../services/programaService";
import { Programa } from "../../interfaces/IPrograma";
import {
  createMatricula,
  getMatriculaById,
  updateMatricula,
} from "../../services/matriculaService";
import { Matricula, MatriculaResponse } from "../../interfaces/IMatricula";
import SearchableCombobox from "../Common/SearchableCombobox";
import { DetalleMatricula } from "../../interfaces/IDetalleMatricula";
import { Pago } from "../../interfaces/IPago";
import { ParametroClase } from "../../params/parametroClase";

// --- ESQUEMA DE VALIDACIÓN ZOD ---
const ProgramaMatriculaSchema = z.object({
  idTipoPrograma: z
    .number({ message: "Debe seleccionar un tipo de programa" })
    .min(1, "Debe seleccionar un tipo de programa"),
  idPrograma: z
    .string({ message: "Debe seleccionar un programa" })
    .min(1, "Debe seleccionar un programa"),
});

export const formSchema = z
  .object({
    idPersona: z
      .string({ message: "Debe seleccionar un alumno" })
      .min(1, "Debe seleccionar un alumno"),
    idInstitucion: z
      .string({ message: "Seleccione una institución." })
      .min(1, "Seleccione una institución."),
    fechaMatricula: z
      .date({ message: "La fecha de matrícula es requerida" })
      .nullable()
      .refine((val) => val !== null, {
        message: "La fecha de matrícula es requerida",
      }),

    // Matrícula (OBLIGATORIA)
    montoMatricula: z
      .number({ message: "Debe ser un número válido" })
      .min(0, "El monto no puede ser negativo"),
    codigoFormaPagoMatricula: z
      .string({ message: "Seleccione una forma de pago" })
      .min(1, "Seleccione una forma de pago"),
    numeroOperacionMatricula: z.string().catch(""),
    montoEfectivoMatricula: z.number().catch(0),
    montoOperacionMatricula: z.number().catch(0),

    // Configuración del Módulo
    numeroModulos: z
      .number({ message: "Debe ingresar la cantidad de módulos" })
      .min(0, "La cantidad no puede ser negativa"),
    montoPorModulo: z
      .number({ message: "Ingrese un precio por módulo válido" })
      .min(0, "El valor no puede ser negativo")
      .max(VALOR_MODULO, `El monto no puede exceder los S/. ${VALOR_MODULO}`),
    pagarPrimerModulo: z.boolean(),

    // Pago del Módulo
    montoModulo: z.number().catch(0),
    codigoFormaPagoModulo: z.string().catch(""),
    numeroOperacionModulo: z.string().catch(""),
    montoEfectivoModulo: z.number().catch(0),
    montoOperacionModulo: z.number().catch(0),

    // programas: z
    //   .array(ProgramaMatriculaSchema)
    //   .min(1, "Debe agregar al menos un programa"),
  })
  .superRefine((data, ctx) => {
    // ----------------------------------------------------
    // 1. VALIDACIONES CONDICIONALES PARA MATRÍCULA
    // ----------------------------------------------------
    const formaPagoMat = (data.codigoFormaPagoMatricula || "").toUpperCase();

    if (formaPagoMat.includes("EFECTIVO")) {
      if (data.montoEfectivoMatricula <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingrese el monto en efectivo",
          path: ["montoEfectivoMatricula"],
        });
      }
    } else if (
      formaPagoMat.includes("TRANSFERENCIA") ||
      formaPagoMat.includes("YAPE") ||
      formaPagoMat.includes("PLIN")
    ) {
      if (data.montoOperacionMatricula <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingrese el monto de la operación",
          path: ["montoOperacionMatricula"],
        });
      }
      if (!data.numeroOperacionMatricula.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El número de operación es requerido",
          path: ["numeroOperacionMatricula"],
        });
      }
    } else if (formaPagoMat.includes("MIXTO")) {
      if (data.montoEfectivoMatricula <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingrese el monto en efectivo",
          path: ["montoEfectivoMatricula"],
        });
      }
      if (data.montoOperacionMatricula <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingrese el monto de operación",
          path: ["montoOperacionMatricula"],
        });
      }
      if (!data.numeroOperacionMatricula.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El número de operación es requerido",
          path: ["numeroOperacionMatricula"],
        });
      }
    }

    const sumaMontosMatricula =
      (data.montoEfectivoMatricula || 0) + (data.montoOperacionMatricula || 0);
    if (sumaMontosMatricula > VALOR_MATRICULA) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `La suma excede el valor base (S/. ${VALOR_MATRICULA})`,
        path: ["montoEfectivoMatricula"],
      });
    }

    // ----------------------------------------------------
    // 2. VALIDACIONES PARA PAGO DE MÓDULO (SI SWITCH ACTIVADO Y N° MÓDULOS > 0)
    // ----------------------------------------------------
    if (data.pagarPrimerModulo && data.numeroModulos > 0) {
      if (!data.codigoFormaPagoModulo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Seleccione la forma de pago del módulo",
          path: ["codigoFormaPagoModulo"],
        });
      }

      const formaPagoMod = (data.codigoFormaPagoModulo || "").toUpperCase();

      if (formaPagoMod.includes("EFECTIVO")) {
        if (data.montoEfectivoModulo <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ingrese el monto en efectivo",
            path: ["montoEfectivoModulo"],
          });
        }
      } else if (
        formaPagoMod.includes("TRANSFERENCIA") ||
        formaPagoMod.includes("YAPE") ||
        formaPagoMod.includes("PLIN")
      ) {
        if (data.montoOperacionModulo <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ingrese el monto de la operación",
            path: ["montoOperacionModulo"],
          });
        }
        if (!data.numeroOperacionModulo.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "El número de operación es requerido",
            path: ["numeroOperacionModulo"],
          });
        }
      } else if (formaPagoMod.includes("MIXTO")) {
        if (data.montoEfectivoModulo <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ingrese el monto en efectivo",
            path: ["montoEfectivoModulo"],
          });
        }
        if (data.montoOperacionModulo <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ingrese el monto de operación",
            path: ["montoOperacionModulo"],
          });
        }
        if (!data.numeroOperacionModulo.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "El número de operación es requerido",
            path: ["numeroOperacionModulo"],
          });
        }
      }
    }
  });

const loadAlumnos = async () => {
  let alumnos: Persona[] = [];

  const response = await getPersonas("grupo-alumno");

  const { result, data } = response;

  if (result && data) {
    alumnos = data as Persona[];
  }

  return alumnos;
};

const loadInstituciones = async () => {
  let instituciones: Institucion[] = [];

  const queryParams = `is_cliente=false&estado=true`;

  const response = await getInstituciones(queryParams);

  const { result, data } = response;

  if (result && data) {
    instituciones = data as Institucion[];
  }

  return instituciones;
};

const loadTipoProgramas = async () => {
  let tipoProgramas: DetalleParametro[] = [];

  const queryParams = `parametro_clase=${ParametroClase.TIPO_PROGRAMA}&en_persona=false&en_empresa=false&estado=true`;

  const response = await getDetalles(queryParams);

  const { result, data } = response;

  if (result && data) {
    tipoProgramas = data as DetalleParametro[];
  }

  return tipoProgramas;
};

const loadFormasPago = async () => {
  let formasPago: DetalleParametro[] = [];

  const queryParams = `parametro_clase=${ParametroClase.FORMA_PAGO}&en_persona=false&en_empresa=false&estado=true`;

  const response = await getDetalles(queryParams);

  const { result, data } = response;

  if (result && data) {
    formasPago = data as DetalleParametro[];
  }

  return formasPago;
};

const loadProgramas = async () => {
  let programas: Programa[] = [];

  const response = await getProgramas();

  const { result, data } = response;

  if (result && data) {
    programas = data as Programa[];
  }

  return programas;
};

const formaPago = async (id: number) => {
  let uniqueFormaPago: DetalleParametro = null;

  const queryParams = `parametro_clase=${ParametroClase.FORMA_PAGO}&codigo=${id}`;

  const response = await getDetalleByParams(queryParams);

  const { result, data } = response;

  if (result && data) {
    uniqueFormaPago = data as DetalleParametro;
  }

  return uniqueFormaPago;
};

type TFormValues = z.infer<typeof formSchema>;

const today = new Date();

const minDateString = format(today, "yyyy-MM-dd");

const defaultValues = {
  idPersona: "",
  idInstitucion: "",
  fechaMatricula: today,

  montoMatricula: 0,
  codigoFormaPagoMatricula: "",
  numeroOperacionMatricula: "",
  montoEfectivoMatricula: 0,
  montoOperacionMatricula: 0,

  numeroModulos: 1,
  montoPorModulo: VALOR_MODULO,
  pagarPrimerModulo: false,

  montoModulo: 0,
  codigoFormaPagoModulo: "",
  numeroOperacionModulo: "",
  montoEfectivoModulo: 0,
  montoOperacionModulo: 0,

  programas: [{ idTipoPrograma: 0, idPrograma: "" }],
};

export const MatriculaForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const [alumnos, setAlumnos] = useState<Persona[]>([]);
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [tipoProgramas, setTipoProgramas] = useState<DetalleParametro[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [formasPago, setFormasPago] = useState<DetalleParametro[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const isEditMode = !!id;

  const inputErrorClass = (invalid: boolean) =>
    invalid
      ? "border-red-500 focus:ring-red-500 focus-visible:ring-red-500"
      : "focus:ring-blue-500";

  const handleGoBack = () => {
    navigate("/matricula");
  };

  const form = useForm<TFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const resetForm = () => {
    form.reset(defaultValues);
  };

  const { isSubmitting } = form.formState;

  // Carga de catálogos y datos de edición en un solo flujo maestro
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);

      try {
        const [
          listAlumnos,
          listInstituciones,
          listTipoProgramas,
          listProgramas,
          listFormasPago,
        ] = await Promise.all([
          loadAlumnos(),
          loadInstituciones(),
          loadTipoProgramas(),
          loadProgramas(),
          loadFormasPago(),
        ]);

        setAlumnos(listAlumnos);
        setInstituciones(listInstituciones);
        setTipoProgramas(listTipoProgramas);
        setProgramas(listProgramas);
        setFormasPago(listFormasPago);

        // Si estamos en modo edición, recuperamos la matrícula por ID
        if (isEditMode && id) {
          // Obtener detalle de una matrícula
          const res = await getMatriculaById(+id);
          // console.log("---- res MatriculaForm ----");
          // console.log({ res });

          // Obteniendo propiedades result y data
          const { result, data } = res;

          // Validando si existe data
          if (result && data) {
            // Seteando la data obtenida del tipo Matricula
            const mat = data as Matricula;

            // console.log("---- data matrícula ----");

            // console.log({ mat });

            const {
              id_persona,
              id_sucursal,
              fecha_matricula,
              detalles,
              numero_modulos,
              pago_matricula,
              pago_modulos,
            } = mat;

            // Validando el primer pago de un módulo
            const validarPrimerPagoModulo =
              pago_modulos &&
              Array.isArray(pago_modulos) &&
              pago_modulos.length > 0;

            // Obteniendo el monto por módulo
            const montoPorModulo: number = Number(
              detalles[0].valor_modulo || 0,
            );

            // Obteniendo em monto por matrícula
            const montoMatricula: number = Number(
              detalles[0].valor_matricula || 0,
            );

            // console.log({ montoMatricula });

            // Obteniendo el pago de matrícula
            const pagoMatricula: Pago = pago_matricula?.[0];

            // console.log({ pagoMatricula });

            // Obteniendo el detalle del pago de matrícula
            const {
              cantidad_efectivo: cantidadEfectivoMat,
              cantidad_operacion: cantidadOperacionMat,
              numero_operacion: numeroOperacionMat,
              codigo_formapago: codigoFormaPagoMat,
            } = pagoMatricula;

            // Obteniendo el id de forma de pago de matrícula
            const codigoFormaPagoMatricula: string =
              codigoFormaPagoMat !== undefined
                ? codigoFormaPagoMat.toString()
                : "";

            const detalleFormaPagoMatricula: DetalleParametro = await formaPago(
              +codigoFormaPagoMatricula,
            );

            // console.log({ detalleFormaPagoMatricula });

            // Obteniendo forma de pago de módulo
            const codigoFormaPagoModulo: string = validarPrimerPagoModulo
              ? pago_modulos[0].codigo_formapago.toString()
              : "";

            let nombreFormaPagoModulo: string = "";

            if (codigoFormaPagoModulo !== "") {
              const detalleFormaPagoModulo: DetalleParametro = await formaPago(
                +codigoFormaPagoModulo,
              );

              nombreFormaPagoModulo = detalleFormaPagoModulo.nombre;
            }

            // Definiendo el primer pago del módulo
            let definirPrimerPago: boolean = false;

            if (validarPrimerPagoModulo) {
              definirPrimerPago = true;
            }

            // Definiendo el detalle de pago de primer módulo
            let cantidadEfectivoModulo: number = undefined;
            let cantidadOperacionModulo: number = undefined;
            let numeroOperacionModulo: string = undefined;

            if (validarPrimerPagoModulo) {
              const primerPago: Pago = pago_modulos[0];
              const {
                cantidad_efectivo,
                cantidad_operacion,
                numero_operacion,
              } = primerPago;

              cantidadEfectivoModulo = cantidad_efectivo;
              cantidadOperacionModulo = cantidad_operacion;
              numeroOperacionModulo = numero_operacion;
            }

            // Seteando valores al formulario
            form.reset({
              idPersona: id_persona.toString() ?? "",
              idInstitucion: id_sucursal.toString() ?? "",
              fechaMatricula: fecha_matricula
                ? parseISO(fecha_matricula)
                : null,

              montoMatricula: Number(montoMatricula) || 0,

              codigoFormaPagoMatricula: detalleFormaPagoMatricula.nombre || "",
              montoEfectivoMatricula: cantidadEfectivoMat ?? 0,
              montoOperacionMatricula: cantidadOperacionMat ?? 0,
              numeroOperacionMatricula: numeroOperacionMat ?? "",

              numeroModulos: numero_modulos,
              montoPorModulo: montoPorModulo,
              montoModulo: montoPorModulo,

              codigoFormaPagoModulo: nombreFormaPagoModulo,
              pagarPrimerModulo: definirPrimerPago,
              montoEfectivoModulo: cantidadEfectivoModulo ?? 0,
              montoOperacionModulo: cantidadOperacionModulo ?? 0,
              numeroOperacionModulo: numeroOperacionModulo ?? "",

              // programas: detalles
              //   ? detalles.map((p: DetalleMatricula) => ({
              //       idTipoPrograma: +p.programa.codigo_tipoprograma,
              //       idPrograma: p.programa.id.toString(),
              //     }))
              //   : [{ idTipoPrograma: 0, idPrograma: "" }],
            });
          }
        }
      } catch (error) {
        console.error("Error al cargar los catálogos formulario", error);
        showToast("error", "Error al cargar los catálogos del formulario.");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [id, isEditMode, form]);

  // Watchers para de las formas de pago
  const watchPagoMatricula = form
    .watch("codigoFormaPagoMatricula")
    .toUpperCase();
  const watchPagoModulo = form.watch("codigoFormaPagoModulo").toUpperCase();

  // Watchers de cantidades
  const watchNumeroModulos = form.watch("numeroModulos") || 0;
  const watchMontoPorModulo = form.watch("montoPorModulo") || 0;
  const watchPagarPrimerModulo = form.watch("pagarPrimerModulo");
  const watchMontoMatricula = Number(form.watch("montoMatricula")) || 0;
  const watchMontoModulo = Number(form.watch("montoModulo")) || 0;

  // Sincronizar montos de Matrícula
  const efectivoMat = Number(form.watch("montoEfectivoMatricula")) || 0;
  const operacionMat = Number(form.watch("montoOperacionMatricula")) || 0;

  // Sincronizar montos de Módulo
  const efectivoMod = Number(form.watch("montoEfectivoModulo")) || 0;
  const operacionMod = Number(form.watch("montoOperacionModulo")) || 0;

  // Si se deshabilita el switch o la cantidad de módulos es 0, resetear los pagos del módulo
  useEffect(() => {
    if (!watchPagarPrimerModulo || watchNumeroModulos === 0) {
      form.setValue("codigoFormaPagoModulo", "");
      form.setValue("montoModulo", 0);
      form.setValue("montoEfectivoModulo", 0);
      form.setValue("montoOperacionModulo", 0);
      form.setValue("numeroOperacionModulo", "");
    }
  }, [watchPagarPrimerModulo, watchNumeroModulos, form]);

  useEffect(() => {
    let nuevoMonto = 0;

    if (watchPagoMatricula.includes("MIXTO")) {
      nuevoMonto = efectivoMat + operacionMat;
    } else if (watchPagoMatricula.includes("EFECTIVO")) {
      nuevoMonto = efectivoMat;
    } else {
      nuevoMonto = operacionMat;
    }

    form.setValue("montoMatricula", nuevoMonto);
  }, [efectivoMat, operacionMat, watchPagoMatricula, form]);

  useEffect(() => {
    if (watchPagoModulo.includes("MIXTO")) {
      form.setValue("montoModulo", (efectivoMod || 0) + (operacionMod || 0));
    } else if (watchPagoModulo.includes("EFECTIVO")) {
      form.setValue("montoModulo", efectivoMod || 0);
    } else {
      form.setValue("montoModulo", operacionMod || 0);
    }
  }, [efectivoMod, operacionMod, watchPagoModulo, form]);

  // Totales Calculados
  const totalEsperadoModulos = watchNumeroModulos * watchMontoPorModulo;
  const totalGeneralCobrado =
    watchMontoMatricula + (watchPagarPrimerModulo ? watchMontoModulo : 0);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "programas",
  });

  const handleAddPrograma = () => {
    append({ idTipoPrograma: undefined as any, idPrograma: "" });
  };

  const getProgramasFiltrados = (selectedTipoId: number | null): Programa[] => {
    if (!selectedTipoId) return [];
    return programas.filter(
      (p) =>
        p.codigo_tipoprograma !== null &&
        +p.codigo_tipoprograma! === selectedTipoId,
    );
  };

  const onSubmit = async (values: TFormValues) => {
    try {
      // console.log("---- values onSubmit registro matrícula ----");
      // console.log({ values });

      const {
        fechaMatricula,
        codigoFormaPagoMatricula,
        codigoFormaPagoModulo,
        idInstitucion,
        idPersona,
        montoEfectivoMatricula,
        montoEfectivoModulo,
        montoMatricula,
        montoOperacionMatricula,
        montoOperacionModulo,
        montoPorModulo,
        numeroModulos,
        numeroOperacionMatricula,
        numeroOperacionModulo,
        pagarPrimerModulo,
        // programas,
      } = values;

      const totalIngresado =
        (montoEfectivoMatricula || 0) + (montoOperacionMatricula || 0);

      if (totalIngresado > VALOR_MATRICULA) {
        showToast(
          "warning",
          `El monto total ingresado (S/. ${totalIngresado.toFixed(2)}) excede el costo de la matrícula (S/. ${VALOR_MATRICULA}). Por favor verifique`,
        );
        return;
      }

      // const programaIds: number[] = programas
      //   .filter((p) => p.idPrograma !== "")
      //   .map((p) => +p.idPrograma);

      // if (programaIds.length === 0) {
      //   showToast("error", "Debe agregar al menos un programa válido");
      //   return;
      // }

      const targetFormaPagoMat = formasPago.find(
        (f) =>
          f.nombre.toUpperCase() === codigoFormaPagoMatricula.toUpperCase(),
      );

      const targetFormaPagoMod = formasPago.find(
        (f) => f.nombre.toUpperCase() === codigoFormaPagoModulo.toUpperCase(),
      );

      const fechaMatriculaStr = fechaMatricula
        ? format(fechaMatricula, "yyyy-MM-dd")
        : formatInTimeZone(new Date(), TIMEZONE_AMERICA_LIMA, "yyyy-MM-dd");

      let payload: Matricula = {
        id_persona: +idPersona,
        id_sucursal: +idInstitucion,
        fecha_matricula: fechaMatriculaStr,
        codigo_estadomatricula: 39, // Estado matrícula ACTIVA por defecto
        // programas: programaIds,

        // Asignación estructurada Matrícula
        monto_matricula: montoMatricula,
        codigo_formapago_matricula: targetFormaPagoMat
          ? targetFormaPagoMat.codigo
          : 0,
        numero_operacion_matricula: numeroOperacionMatricula || undefined,
        monto_efectivo_matricula: montoEfectivoMatricula || undefined,
        monto_operacion_matricula: montoOperacionMatricula || undefined,
        concepto_matricula: "PAGO DE MATRÍCULA",

        // Asignación estructurada Módulo
        numero_modulos: numeroModulos,
        monto_modulo: montoPorModulo,

        estado: true,
      };

      if (pagarPrimerModulo) {
        ((payload.pagarPrimerModulo = pagarPrimerModulo),
          ((payload.codigo_formapago_modulo = targetFormaPagoMod
            ? targetFormaPagoMod.codigo
            : 0),
          (payload.numero_operacion_modulo =
            numeroOperacionModulo || undefined),
          (payload.monto_efectivo_modulo = montoEfectivoModulo || undefined),
          (payload.monto_operacion_modulo = montoOperacionModulo || undefined),
          (payload.concepto_modulo = "PAGO DE MÓDULO #1")));
      }

      // console.log({ payload });

      const response = isEditMode
        ? await updateMatricula(+id, payload)
        : await createMatricula(payload);

      // console.log("---- response in MatriculaForm ----");
      // console.log({ response });

      const { result, message } = response as MatriculaResponse;

      if (result) {
        showToast(
          "success",
          message ||
            `Matrícula ${isEditMode ? "actualizada" : "creada"} con éxito`,
        );
        navigate("/matricula");
      } else {
        showToast("error", message || "Error al procesar la matrícula");
      }
    } catch (error) {
      console.error("Error en submit de matrícula", error);
      showToast(
        "error",
        "Ocurrió un error inesperado al procesar el formulario.",
      );
    }
  };

  return (
    <Card className="shadow-xl border-none bg-white">
      <CardHeader className="border-b border-gray-100 p-6 flex flex-row items-center justify-between bg-gray-50/50 rounded-t-xl">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-extrabold text-slate-800 tracking-tight">
            {isEditMode ? "Editar Matrícula" : "Nuevo Registro de Matrícula"}
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            Configure las condiciones académicas y el desglose de pagos
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all font-medium"
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* SECCIÓN 01: INFORMACIÓN DE REGISTRO */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] font-semibold">
                  1
                </span>
                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Información de registro
                </h3>
                <div className="h-px bg-slate-100 flex-1"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
                {/* Alumno */}
                <FormField
                  control={form.control}
                  name="idPersona"
                  render={({ field, fieldState }) => (
                    <FormItem className="w-full">
                      <RequiredLabel isRequired={true}>Alumno</RequiredLabel>
                      <SearchableCombobox<Persona>
                        placeholder="Buscar un alumno"
                        options={alumnos}
                        value={field.value}
                        onChange={field.onChange}
                        displayKey="nombre_completo"
                        valueKey="id"
                        searchKeys={["nombre_completo"]}
                        isInvalid={fieldState.invalid}
                        renderOption={(alumno) => (
                          <span className="font-semibold text-gray-900">
                            {alumno.nombre_completo}
                          </span>
                        )}
                      />
                      <FormMessage className="text-xs font-medium text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Institución */}
                <FormField
                  control={form.control}
                  name="idInstitucion"
                  render={({ field, fieldState }) => (
                    <FormItem className="w-full">
                      <RequiredLabel isRequired={true}>
                        Institución
                      </RequiredLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={`w-full transition-all bg-white ${
                              fieldState.invalid
                                ? "border-red-400 focus:ring-red-100"
                                : "border-slate-200 focus:ring-blue-100 focus:border-blue-500"
                            }`}
                            // className={`w-full ${inputErrorClass(fieldState.invalid)}`}
                          >
                            <SelectValue placeholder="Seleccionar institución" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white text-xs border border-slate-200 shadow-md outline-none">
                          {instituciones.map((inst) => (
                            <SelectItem
                              value={inst.id!.toString()}
                              key={inst.id}
                              className="cursor-pointer hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold transition-colors"
                            >
                              {inst.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs font-medium text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Fecha Matrícula */}
                <FormField
                  control={form.control}
                  name="fechaMatricula"
                  render={({ field, fieldState }) => (
                    <FormItem className="w-full">
                      <RequiredLabel isRequired={true}>
                        Fecha Matrícula
                      </RequiredLabel>
                      <Input
                        type="date"
                        min={minDateString}
                        value={
                          field.value ? format(field.value, "yyyy-MM-dd") : ""
                        }
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseISO(e.target.value) : null,
                          )
                        }
                        autoComplete="off"
                        className={inputErrorClass(fieldState.invalid)}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] font-semibold">
                    2
                  </span>
                  <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    REGISTRO DE PAGOS
                  </h3>
                  <div className="h-px bg-slate-100 flex-1"></div>
                </div>
                <Button
                  type="button"
                  onClick={handleAddPrograma}
                  className="bg-blue-600 hover:bg-blue-700 h-9"
                  disabled={isSubmitting}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Agregar Programa
                </Button>
              </div>

              <div className="space-y-4 w-full">
                {fields.map((fieldItem, index) => {
                  const selectedTipoId = form.watch(
                    `programas.${index}.idTipoPrograma`,
                  );
                  const programasFiltrados =
                    getProgramasFiltrados(selectedTipoId);

                  return (
                    <div
                      key={fieldItem.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 border border-gray-100 bg-gray-50/50 rounded-xl w-full"
                    >
                      <div className="md:col-span-4 w-full">
                        <FormField
                          control={form.control}
                          name={`programas.${index}.idTipoPrograma`}
                          render={({ field: tipoField, fieldState }) => (
                            <FormItem className="w-full">
                              <RequiredLabel isRequired={true}>
                                Tipo de programa
                              </RequiredLabel>
                              <Select
                                onValueChange={(val) => {
                                  tipoField.onChange(parseInt(val, 10));
                                  form.setValue(
                                    `programas.${index}.idPrograma`,
                                    "",
                                  ); // Resetea programa al cambiar tipo
                                }}
                                value={
                                  tipoField.value && tipoField.value !== 0
                                    ? tipoField.value.toString()
                                    : ""
                                }
                              >
                                <FormControl>
                                  <SelectTrigger
                                    className={`w-full ${inputErrorClass(fieldState.invalid)}`}
                                  >
                                    <SelectValue placeholder="Seleccionar tipo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {tipoProgramas.map((tipo) => (
                                    <SelectItem
                                      value={tipo.codigo.toString()}
                                      key={tipo.codigo}
                                    >
                                      {tipo.nombre}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="md:col-span-7 w-full">
                        <FormField
                          control={form.control}
                          name={`programas.${index}.idPrograma`}
                          render={({ field: programaField, fieldState }) => (
                            <FormItem className="w-full">
                              <RequiredLabel isRequired={true}>
                                Programa específico
                              </RequiredLabel>
                              <SearchableCombobox<Programa>
                                placeholder={
                                  selectedTipoId
                                    ? "Buscar un programa..."
                                    : "Seleccione tipo"
                                }
                                options={programasFiltrados}
                                value={programaField.value}
                                onChange={programaField.onChange}
                                displayKey="titulo"
                                valueKey="id"
                                searchKeys={["titulo"]}
                                isInvalid={fieldState.invalid}
                                disabled={
                                  !selectedTipoId ||
                                  programasFiltrados.length === 0
                                }
                              />
                              <FormMessage className="text-xs font-medium text-red-500" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="md:col-span-1 flex justify-end">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => remove(index)}
                            className="text-red-500 hover:bg-red-50"
                            disabled={isSubmitting}
                            aria-label={`Eliminar fila ${index + 1}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div> */}

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2 text-indigo-900 font-bold">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                  <h3>Configuración de Pagos</h3>
                </div>
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-md font-medium flex items-center gap-1">
                  <Info className="h-3.5 w-3.5" /> Valor Base Referencial: S/.{" "}
                  {VALOR_MODULO}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="numeroModulos"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <RequiredLabel isRequired={true}>
                        N° Total de Meses
                      </RequiredLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="1"
                          {...field}
                          value={field.value ?? 0}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value, 10) || 0)
                          }
                          autoComplete="off"
                          className={`bg-white font-semibold text-slate-800 ${inputErrorClass(
                            fieldState.invalid,
                          )}`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 2. Valor Pago por Módulo */}
                <FormField
                  control={form.control}
                  name="montoPorModulo"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <RequiredLabel isRequired={true}>
                        Monto por mes (S/.)
                      </RequiredLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          max={VALOR_MODULO}
                          {...field}
                          value={field.value ?? 0}
                          autoComplete="off"
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          className={`bg-white font-semibold text-slate-800 ${inputErrorClass(
                            fieldState.invalid,
                          )}`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Resumen del Valor General */}
                <div className="flex flex-col justify-center bg-white p-3 rounded-xl border border-slate-200/60 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">
                    Monto Esperado Mes ({watchNumeroModulos} × S/.{" "}
                    {watchMontoPorModulo.toFixed(2)}):
                  </span>
                  <span className="text-lg font-bold text-slate-800">
                    S/. {totalEsperadoModulos.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* 3. SWITCH CONDICIONAL PAGO PRIMER MÓDULO */}
              <div className="pt-2">
                <FormField
                  control={form.control}
                  name="pagarPrimerModulo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl bg-white p-4 border border-indigo-100 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-bold text-slate-800 cursor-pointer">
                          ¿Registrar Pago del Primer Mes Ahora?
                        </FormLabel>
                        <p className="text-xs text-slate-500">
                          Active esta casilla únicamente si el alumno va a
                          efectuar el pago del módulo en esta transacción.
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={watchNumeroModulos === 0}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
              <div className="p-6 border border-blue-100 bg-blue-50/20 rounded-2xl space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-blue-700 font-bold border-b border-blue-100 pb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      <h4>Pago de Matrícula</h4>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md flex items-center gap-1 font-semibold">
                      <Info className="h-3.5 w-3.5" /> Valor Base: S/.{" "}
                      {VALOR_MATRICULA}
                    </span>
                  </div>

                  <FormField
                    control={form.control}
                    name="codigoFormaPagoMatricula"
                    render={({ field, fieldState }) => (
                      <FormItem className="flex flex-col w-full">
                        <RequiredLabel isRequired={true}>
                          Forma de Pago Matrícula
                        </RequiredLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger
                              className={`w-full ${inputErrorClass(fieldState.invalid)}`}
                            >
                              <SelectValue placeholder="Seleccionar forma pago" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="w-full">
                            {formasPago.map((f) => (
                              <SelectItem key={f.codigo} value={f.nombre}>
                                {f.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* CAMPOS DINÁMICOS MATRÍCULA */}
                  {(watchPagoMatricula.includes("EFECTIVO") ||
                    watchPagoMatricula.includes("MIXTO")) && (
                    <FormField
                      control={form.control}
                      name="montoEfectivoMatricula"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <RequiredLabel>Monto en Efectivo (S/.)</RequiredLabel>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            value={field.value ?? ""}
                            autoComplete="off"
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                            className={`bg-white ${inputErrorClass(fieldState.invalid)}`}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {(watchPagoMatricula.includes("TRANSFERENCIA") ||
                    watchPagoMatricula.includes("YAPE") ||
                    watchPagoMatricula.includes("PLIN") ||
                    watchPagoMatricula.includes("MIXTO")) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-white/80 rounded-xl border border-blue-100">
                      <FormField
                        control={form.control}
                        name="montoOperacionMatricula"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <RequiredLabel>Monto Digital/Banco</RequiredLabel>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              value={field.value ?? ""}
                              autoComplete="off"
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                              className={inputErrorClass(fieldState.invalid)}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="numeroOperacionMatricula"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <RequiredLabel>N° Operación</RequiredLabel>
                            <Input
                              placeholder="Código de transacción"
                              {...field}
                              className={inputErrorClass(fieldState.invalid)}
                              autoComplete="off"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-blue-100 flex justify-between items-center text-sm font-semibold text-slate-700">
                  <span>Total Cobrado Matrícula:</span>
                  <span className="text-base text-blue-900 font-extrabold">
                    S/. {watchMontoMatricula.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* BLOQUE B: PAGO DE MÓDULO (CONDICIONAL: SWITCH === TRUE && N° MÓDULOS > 0) */}
              {watchPagarPrimerModulo && watchNumeroModulos > 0 ? (
                <div className="p-6 border border-emerald-100 bg-emerald-50/20 rounded-2xl space-y-4 shadow-sm flex flex-col justify-between transition-all animate-in fade-in-50">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-emerald-700 font-bold border-b border-emerald-100 pb-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        <h4>Pago del Primer Mes</h4>
                      </div>
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md flex items-center gap-1 font-semibold">
                        <Info className="h-3.5 w-3.5" /> Por Mes: S/.{" "}
                        {watchMontoPorModulo.toFixed(2)}
                      </span>
                    </div>

                    <FormField
                      control={form.control}
                      name="codigoFormaPagoModulo"
                      render={({ field }) => (
                        <FormItem>
                          <RequiredLabel>Forma de Pago Mes</RequiredLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full bg-white">
                                <SelectValue placeholder="Seleccionar forma pago" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {formasPago.map((f) => (
                                <SelectItem key={f.codigo} value={f.nombre}>
                                  {f.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* CAMPOS DINÁMICOS MÓDULO */}
                    {(watchPagoModulo.includes("EFECTIVO") ||
                      watchPagoModulo.includes("MIXTO")) && (
                      <FormField
                        control={form.control}
                        name="montoEfectivoModulo"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <RequiredLabel>
                              Monto en Efectivo (S/.)
                            </RequiredLabel>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              value={field.value ?? ""}
                              autoComplete="off"
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                              className={`bg-white ${inputErrorClass(
                                fieldState.invalid,
                              )}`}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {(watchPagoModulo.includes("TRANSFERENCIA") ||
                      watchPagoModulo.includes("YAPE") ||
                      watchPagoModulo.includes("PLIN") ||
                      watchPagoModulo.includes("MIXTO")) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-white/80 rounded-xl border border-emerald-100">
                        <FormField
                          control={form.control}
                          name="montoOperacionModulo"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <RequiredLabel>Monto Digital/Banco</RequiredLabel>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                autoComplete="off"
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                className={inputErrorClass(fieldState.invalid)}
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="numeroOperacionModulo"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <RequiredLabel>N° Operación</RequiredLabel>
                              <Input
                                placeholder="Código de transacción"
                                {...field}
                                className={inputErrorClass(fieldState.invalid)}
                                autoComplete="off"
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-emerald-100 flex justify-between items-center text-sm font-semibold text-slate-700">
                    <span>Total Cobrado Módulo:</span>
                    <span className="text-base text-emerald-900 font-extrabold">
                      S/. {watchMontoModulo.toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                /* ESTADO VACÍO CUANDO NO SE REGISTRA PAGO DE MÓDULO */
                <div className="p-6 border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
                  <div className="p-3 bg-slate-100 rounded-full text-slate-400">
                    <XCircle className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-600">
                    Sin Pago de Módulo Inicial
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs">
                    El alumno solo registrará la matrícula. Para agregar el
                    primer módulo active el switch superior.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-5 bg-slate-900 text-white rounded-2xl shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-6">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-white/10 rounded-xl text-blue-400 shrink-0">
                  <Calculator className="h-7 w-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold tracking-tight leading-tight">
                    Resumen Total a Pagar
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Matrícula (S/. {watchMontoMatricula.toFixed(2)}) + Módulo
                    (S/.{" "}
                    {watchPagarPrimerModulo
                      ? watchMontoModulo.toFixed(2)
                      : "0.00"}
                    )
                  </p>
                </div>
              </div>

              {/* Sección derecha: Total y Botones de Acción */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                {/* Total a cobrar */}
                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium leading-none mb-1">
                    Total a Cobrar Hoy
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight leading-none">
                    S/. {totalGeneralCobrado.toFixed(2)}
                  </span>
                </div>

                {/* Botones perfectamente alineados verticalmente */}
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
                    <span>{isEditMode ? "Actualizar" : "Registrar"}</span>
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
