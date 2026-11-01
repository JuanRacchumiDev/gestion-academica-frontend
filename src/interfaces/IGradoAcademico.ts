import { DetalleParametro } from "./IDetalleParametro"
import { PeriodoAcademico } from "./IPeriodoAcademico"

export interface GradoAcademico {
    id?: number
    codigo_nivel_academico?: number
    nombre?: string
    fecha_crea?: string
    fecha_actualiza?: string
    fecha_elimina?: string
    user_crea?: string
    user_actualiza?: string
    user_elimina?: string
    estado?: boolean
    nivel_academico?: DetalleParametro
}

export interface GradoAcademicoResponse {
    result?: boolean
    message?: string
    data?: GradoAcademico | GradoAcademico[]
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

export interface GradoAcademicoPaginateResponse {
    result: boolean
    message?: string
    data?: GradoAcademico[]
    errors?: string
    status?: number
    pagination?: PaginationType
}