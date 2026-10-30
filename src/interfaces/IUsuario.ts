import { DetalleParametro } from "./IDetalleParametro"
import { Persona } from "./IPersona"

export interface Usuario {
    id?: number
    name?: string
    email?: string
    password?: string
    remember_token?: string
    codigo_perfil?: number
    id_persona?: number
    user_crea?: string
    perfil?: DetalleParametro
    persona?: Persona
    estado?: boolean
}

export interface UsuarioResponse {
    result?: boolean
    message?: string
    data?: Usuario | Usuario[]
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

export interface UsuarioPaginateResponse {
    result: boolean
    message?: string
    data?: Usuario[]
    errors?: string
    status?: number
    pagination?: PaginationType
}