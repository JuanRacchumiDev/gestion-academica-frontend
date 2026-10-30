import { DetalleParametro } from "./IDetalleParametro"
import { Institucion } from "./IInstitucion"
import { Matricula } from "./IMatricula"
import { Modulo } from "./IModulo"

export interface Pago {
    id?: number
    id_matricula?: number
    id_modulo?: number
    codigo_estadopago?: number
    codigo_formapago?: number
    id_sucursal?: number
    concepto?: string
    numero_modulo?: number
    numero_operacion?: string
    fecha_pago?: string
    fecha_vencimiento?: string
    cantidad_efectivo?: number
    cantidad_operacion?: number
    user_crea?: string
    user_actualiza?: string
    user_elimina?: string
    estado?: boolean

    matricula?: Matricula
    estado_pago?: DetalleParametro
    forma_pago?: DetalleParametro
    institucion?: Institucion
}

export interface ModuloPendiente {
    numero_modulo: number;
    pagado: boolean;
    id_pago: number | null;
}

export interface ModuloPagado {
    id: number;
    codigo_formapago: number;
    numero_modulo: number;
    concepto: string;
    numero_operacion: string;
    fecha_pago: string;
    cantidad_efectivo?: number;
    cantidad_operacion?: number;
    nombre_formapago: string
}

export interface DetalleModulosPorPagar {
    matricula_id: number;
    total_modulos: number;
    modulos: ModuloPendiente[];
}

export interface DetalleModulosPagados {
    matricula_id: number
    modulos: ModuloPagado[]
}

export interface PagoResponse {
    result?: boolean
    message?: string
    data?: Pago | Pago[]
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

export interface PagoPaginateResponse {
    result: boolean
    message?: string
    data?: Pago[]
    errors?: string
    status?: number
    pagination?: PaginationType
}

export interface ModulosPorPagarResponse {
    result: boolean;
    message: string;
    data: DetalleModulosPorPagar | null;
    error?: string;
    status?: number;
}

export interface ModulosPagadosResponse {
    result: boolean
    message: string
    data: DetalleModulosPagados | null;
    error?: string
    status?: number
}