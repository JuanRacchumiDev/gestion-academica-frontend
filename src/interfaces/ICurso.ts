export interface Programa {
    id?: number
    sigla?: string
    titulo?: string
    descripcion?: string
    creditos?: number
    modalidad?: string
    capacidad_minima?: number
    capacidad_maxima?: number
    is_vigente?: boolean
    user_crea?: string
    user_actualiza?: string
    user_elimina?: string
    estado?: boolean
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