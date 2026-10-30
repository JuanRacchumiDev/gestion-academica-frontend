import { Programa } from "./IPrograma"
import { Plantilla } from "./IPlantilla"

export interface DetalleParametro {
    codigo?: number
    nombre?: string
    nombre_url?: string
    descripcion?: string | null
    valor?: string
    abreviatura?: string
    longitud?: number
    en_persona?: boolean
    en_empresa?: boolean
    compra?: boolean
    venta?: boolean
    visible?: boolean
    sistema?: boolean
    estado?: boolean
    programas_por_tipo?: Programa[]
    plantillas?: Plantilla[]
}

export interface PaginationType {
    currentPage: number
    limit: number
    totalPages: number
    totalItems: number
    nextPage: number | null
    previousPage: number | null
}

export interface DetalleParametroResponse {
    result?: boolean
    message?: string
    data?: DetalleParametro | DetalleParametro[]
    error?: string
    status?: number,
    code?: string
}

export interface DetalleParametroPaginateResponse {
    result: boolean
    message?: string
    data?: DetalleParametro[]
    error?: string
    status?: number,
    pagination?: PaginationType
}

export interface DetalleParametroFilters {
    parametro_clase?: number | number[],
    en_persona?: boolean
    en_empresa?: boolean
    visible?: boolean
    estado?: boolean
}