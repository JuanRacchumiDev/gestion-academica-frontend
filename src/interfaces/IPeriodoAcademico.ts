import { DetalleParametro } from "./IDetalleParametro"

export interface PeriodoAcademico {
    id?: number
    codigo_estado_periodo_academico?: number
    nombre?: string
    year?: number
    fecha_inicio?: string
    fecha_final?: string
    fecha_crea?: string
    fecha_actualiza?: string
    fecha_elimina?: string
    user_crea?: string
    user_actualiza?: string
    user_elimina?: string
    estado?: boolean
    estado_periodo_academico?: DetalleParametro
}

export interface PeriodoAcademicoResponse {
    result?: boolean
    message?: string
    data?: PeriodoAcademico | PeriodoAcademico[]
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

export interface PeriodoAcademicoPaginateResponse {
    result: boolean
    message?: string
    data?: PeriodoAcademico[]
    errors?: string
    status?: number
    pagination?: PaginationType
}