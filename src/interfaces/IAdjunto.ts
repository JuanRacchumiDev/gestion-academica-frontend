import { Institucion } from "./IInstitucion"
import { Modulo } from "./IModulo"
import { Programa } from "./IPrograma"

export type TipoAdjunto = 'FILE' | 'YOUTUBE' | 'DRIVE' | 'URL'

export interface Adjunto {
    id?: number
    id_programa?: number
    id_modulo?: number
    id_sucursal?: number
    tipo?: TipoAdjunto
    titulo?: string
    titulo_url?: string
    descripcion?: string
    url?: string
    filename?: string
    originalname?: string
    filepath?: string
    mimetype?: string
    size?: number
    is_descargable?: boolean
    is_visible?: boolean
    estado?: boolean
    fecha_crea?: string
    fecha_actualiza?: string
    fecha_elimina?: string

    programa?: Programa
    modulo?: Modulo
    institucion?: Institucion
}

export interface PaginationType {
    currentPage: number
    limit: number
    totalPages: number
    totalItems: number
    nextPage: number | null
    previousPage: number | null
}

export interface AdjuntoResponse {
    result?: boolean
    message?: string
    exists?: boolean
    data?: Adjunto | Adjunto[]
    error?: string
    status?: number,
    code?: number | string
    pagination?: PaginationType
}