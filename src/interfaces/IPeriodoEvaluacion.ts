import { DetalleParametro } from "./IDetalleParametro"
import { PeriodoAcademico } from "./IPeriodoAcademico"

export interface PeriodoEvaluacion {
    id?: number
    id_periodo_academico?: number
    codigo_tipo_periodo_academico?: number
    nombre?: string
    fecha_inicio?: string
    fecha_final?: string
    fecha_crea?: string
    fecha_actualiza?: string
    fecha_elimina?: string
    user_crea?: string
    user_actualiza?: string
    user_elimina?: string
    estado?: boolean
    periodo_academico?: PeriodoAcademico
    tipo_periodo_academico?: DetalleParametro
}

export interface PeriodoEvaluacionResponse {
    result?: boolean
    message?: string
    data?: PeriodoEvaluacion | PeriodoEvaluacion[]
    error?: string
    status?: number,
    pagination?: PaginationType,
    code?: string
}

export interface PaginationType {
    currentPage: number
    totalPages: number
    totalItems: number
    nextPage: number | null
    previousPage: number | null
}

export interface PeriodoEvaluacionPaginateResponse {
    result: boolean
    message?: string
    data?: PeriodoEvaluacion[]
    errors?: string
    status?: number
    pagination?: PaginationType
}