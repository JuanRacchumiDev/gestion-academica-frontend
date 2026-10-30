import { Persona } from "./IPersona"
import { DetalleParametro } from "./IDetalleParametro"
import { Institucion } from "./IInstitucion"
import { DetalleMatricula } from "./IDetalleMatricula";
import { Pago } from "./IPago"

export interface Matricula {
    id?: number
    id_persona?: number
    codigo_estadomatricula?: number
    id_sucursal?: number
    fecha_matricula?: string
    fecha_retiro?: string
    fecha_reserva?: string
    fecha_anula?: string
    user_crea?: string
    user_actualiza?: string
    user_elimina?: string
    estado?: boolean,
    pagarPrimerModulo?: boolean

    // Datos de matrícula
    monto_matricula?: number
    codigo_formapago_matricula?: number
    numero_operacion_matricula?: string
    monto_efectivo_matricula?: number
    monto_operacion_matricula?: number
    concepto_matricula?: string

    // Datos de módulo
    numero_modulos?: number
    monto_modulo?: number
    codigo_formapago_modulo?: number
    numero_operacion_modulo?: string
    monto_efectivo_modulo?: number
    monto_operacion_modulo?: number
    concepto_modulo?: string

    detalles?: DetalleMatricula[]
    programas?: number[]
    pago_matricula?: Pago[]
    pago_modulos?: Pago[]

    persona?: Persona
    estadoMatricula?: DetalleParametro
    institucion?: Institucion
}

export interface MatriculaResponse {
    result?: boolean
    message?: string
    data?: Matricula | Matricula[]
    error?: string
    status?: number
    pagination?: PaginationType
    code?: string
}

export interface PaginationType {
    currentPage: number
    totalPages: number
    totalItems: number
    nextPage: number | null
    previousPage: number | null
}

export interface MatriculaPaginateResponse {
    result: boolean
    message?: string
    data?: Matricula[]
    errors?: string
    status?: number
    pagination?: PaginationType
}