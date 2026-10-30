import { Matricula } from "./IMatricula"
import { Programa } from "./IPrograma"

export interface DetalleMatricula {
    id?: number
    id_matricula?: number
    id_programa?: number
    valor_matricula?: number;
    valor_modulo?: number;
    user_crea?: string
    user_actualiza?: string
    user_elimina?: string
    estado?: boolean
    matricula?: Matricula
    programa?: Programa
}

export interface PaginationType {
    currentPage: number
    limit: number
    totalPages: number
    totalItems: number
    nextPage: number | null
    previousPage: number | null
}

export interface DetalleMatriculaResponse {
    result?: boolean
    message?: string
    data?: DetalleMatricula | DetalleMatricula[]
    error?: string
    status?: number,
    code?: string
}

export interface DetalleMatriculaPaginateResponse {
    result: boolean
    message?: string
    data?: DetalleMatricula[]
    error?: string
    status?: number,
    pagination?: PaginationType
}

// export interface DetalleParametroFilters {
//     parametro_clase?: number | number[],
//     en_persona?: boolean
//     en_empresa?: boolean
//     visible?: boolean
//     estado?: boolean
// }