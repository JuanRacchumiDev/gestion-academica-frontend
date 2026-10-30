import { DetalleParametro } from "./IDetalleParametro"
import { Modulo } from "./IModulo"
import { Adjunto } from "./IAdjunto"

export interface Programa {
    id?: number
    codigo_segmento?: string
    codigo_tipoprograma?: string
    codigo_categoriaprograma?: string
    codigo_old?: string
    sigla?: string
    titulo?: string
    descripcion?: string
    fecha_inicio?: string
    fecha_final?: string
    duracion?: string
    horas_academicas?: number
    numero_modulos?: number
    creditos?: number
    plan?: File | null | undefined
    modalidad?: string
    temario?: string
    capacidad_minima?: number
    capacidad_maxima?: number
    cantidad_inscritos?: number
    precio?: number
    is_vigente?: boolean
    user_crea?: string
    user_actualiza?: string
    user_elimina?: string
    estado?: boolean
    segmento?: DetalleParametro
    tipo_programa?: DetalleParametro
    categoria_programa?: DetalleParametro
    detalle_modulos?: Modulo[]
    adjuntos?: Adjunto[]
}

export interface ProgramaResponse {
    result?: boolean
    message?: string
    data?: Programa | Programa[]
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

export interface ProgramaPaginateResponse {
    result: boolean
    message?: string
    data?: Programa[]
    errors?: string
    status?: number
    pagination?: PaginationType
}