import { Matricula } from "../interfaces/IMatricula"
import { Modulo } from "../interfaces/IModulo"

export type estadoModulo = 'HABILITADO' | 'PAGO_PENDIENTE' | 'BLOQUEADO'

export const obtenerEstadoModulo = (modulo: Modulo, matricula: Matricula): estadoModulo => {
    const numeroModulo = modulo.orden ?? 0

    // Buscar si existe un pago registrado para este módulo
    const pagoRealizado = matricula.pago_modulos.find(
        (pago) => pago.numero_modulo === numeroModulo
    )

    if (pagoRealizado && pagoRealizado.estado) {
        return 'HABILITADO'
    }

    if (pagoRealizado && !pagoRealizado.estado) {
        return "PAGO_PENDIENTE"
    }

    return 'BLOQUEADO';
}