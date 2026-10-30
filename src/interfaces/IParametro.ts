export interface Parametro {
    id?: number
    nombre?: string
    nombre_url?: string
    descripcion?: string
    estado?: boolean
}

export interface ParametroResponse {
    result?: boolean
    message?: string
    data?: Parametro | Parametro[]
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

export interface ParametroPaginateResponse {
    result: boolean
    data?: Parametro[]
    pagination?: Pagination
    errors?: string
    status?: number
}
