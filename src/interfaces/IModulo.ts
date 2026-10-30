import { Programa } from "./IPrograma"

export interface Modulo {
    id?: number
    id_programa?: number
    titulo?: string
    titulo_url?: string
    descripcion?: string | null
    temario?: string
    nota?: number
    plan?: File | string | null | undefined
    adjunto?: string
    video?: string | null
    orden?: number
    plan_existe?: boolean
    plan_url?: string | null
    estado?: boolean
    programa?: Programa
}

export interface ModuloResponse {
    result?: boolean
    message?: string
    data?: Modulo | Modulo[]
    error?: string
    status?: number
    pagination?: PaginationType
    code?: string
}

export interface PaginationType {
    currentPage: number
    limit: number
    totalPages: number
    totalItems: number
    nextPage: number | null
    previousPage: number | null
}

export interface ModuloPaginateResponse {
    result: boolean
    message?: string
    data?: Modulo[]
    errors?: string
    status?: number
    pagination?: PaginationType
}