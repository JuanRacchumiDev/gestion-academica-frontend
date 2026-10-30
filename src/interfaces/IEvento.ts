import { DetalleParametro } from "./IDetalleParametro"

export interface Evento {
    id?: number
    id_tipoevento?: number
    id_categoriaevento?: number
    titulo?: string
    titulo_url?: string
    descripcion?: string
    temario?: string
    fecha_inicio?: string
    fecha_final?: string
    duracion?: string
    modalidad?: string
    precio?: number
    capacidad_maxima?: number
    capacidad_minima?: number
    cantidad_inscritos?: number
    estado?: boolean
    tipo_evento?: DetalleParametro
    categoria_evento?: DetalleParametro
}

export interface EventoResponse {
    result?: boolean
    message?: string
    data?: Evento | Evento[]
    error?: string
    status?: number
}

export interface Pagination {
    currentPage: number
    limit: number
    totalPages: number
    totalItems: number
    nextPage: number | null
    previousPage: number | null
}

export interface EventoPaginateResponse {
    result: boolean
    data?: Evento[]
    pagination?: Pagination
    errors?: string
    status?: number
}