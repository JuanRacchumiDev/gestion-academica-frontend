import { DetalleParametro } from "./IDetalleParametro"
import { Institucion } from "./IInstitucion"
import { Modulo } from "./IModulo"
import { Persona } from "./IPersona"
import { Plantilla } from "./IPlantilla"
import { Programa } from "./IPrograma"

export interface Certificado {
    id?: number
    id_persona?: number
    codigo_tipocertificado?: number
    id_sucursal?: number
    id_plantilla?: number
    id_programa?: number
    id_modulo?: number

    codigo_verificacion?: string
    codigo_qr_path?: string
    path_file?: string
    filename?: string
    nombre_impresion?: string
    user_crea?: string
    user_actualiza?: string
    user_elimina?: string
    estado?: boolean
    fecha_crea?: string
    fecha_actualiza?: string
    fecha_elimina?: string

    persona?: Persona
    tipo_certificado?: DetalleParametro
    sucursal?: Institucion
    plantilla?: Plantilla
    programa?: Programa
    modulo?: Modulo
}

export interface CertificadoResponse {
    result?: boolean
    message?: string
    data?: Certificado | Certificado[]
    error?: string
    status?: number
    pagination?: PaginationType
    code?: string
}

export interface CertificadoResponseGeneral {
    data?: Certificado | Certificado[],
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

export interface CertificadoPaginateResponse {
    result: boolean
    message?: string
    data?: Certificado[]
    errors?: string
    status?: number
    pagination?: PaginationType
}