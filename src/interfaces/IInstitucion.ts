import { DetalleParametro } from "./IDetalleParametro"

export interface Institucion {
    id?: number
    codigo_sede?: number
    nombre?: string
    sigla?: string
    ruc?: string
    direccion?: string
    telefono_contacto?: string
    logo_path?: string
    firma_digital?: string
    color_primario?: string
    nombre_director?: string
    nombre_representante?: string
    firma_director_path?: string
    firma_representante_path?: string
    is_cliente?: boolean
    estado?: boolean
    sede?: DetalleParametro
}

export interface InstitucionResponse {
    result?: boolean
    message?: string
    data?: Institucion | Institucion[]
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

export interface InstitucionPaginateResponse {
    result: boolean
    message?: string
    data?: Institucion[]
    errors?: string
    status?: number
    pagination?: PaginationType
}