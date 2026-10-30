import { Institucion } from "./IInstitucion"
import { DetalleParametro } from "./IDetalleParametro"

export interface Plantilla {
    id?: number
    id_institucion?: number
    id_sucursal?: number
    codigo_tipoprograma?: number
    nombre?: string
    descripcion?: string
    path_imagen_fondo?: string
    path_imagen_publica?: string
    path_pdf_fondo?: string
    tipo_disenio?: string
    disenio_default?: string
    estado?: boolean
    institucion?: Institucion
    sucursal?: Institucion
    tipo_programa?: DetalleParametro
}

export interface PlantillaResponse {
    result?: boolean
    message?: string
    data?: Plantilla | Plantilla[]
    error?: string
    status?: number
    pagination?: PaginationType
    code?: string
}

export interface PlantillaResponseGeneral {
    data?: Plantilla | Plantilla[],
    status?: number
    statusText?: string
}

export interface PaginationType {
    currentPage: number
    limit: number
    totalPages: number
    totalItems: number
    nextPage: number | null
    previousPage: number | null
}

export interface PlantillaPaginateResponse {
    result: boolean
    message?: string
    data?: Plantilla[]
    errors?: string
    status?: number
    pagination?: PaginationType
}