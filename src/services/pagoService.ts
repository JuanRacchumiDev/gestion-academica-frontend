import { Pago } from "../interfaces/IPago"
import {
    getAll,
    getAllPaginate,
    getById,
    getConstanciaPago,
    create,
    update
} from "../repositories/pagoRepository"

export const getPagos = async () => {
    const response = await getAll()

    return {
        ...response
    }
}

export const getPagosPaginate = async (
    page: number,
    limit: number,
    filters: {}
) => {
    console.log({ page })
    console.log({ limit })
    console.log({ filters })

    // Construir la cadena de query parameters
    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
            Object.entries(filters).filter(([, value]) => value)
        )
    }).toString()

    console.log({ queryParams })

    const response = await getAllPaginate(queryParams)

    return {
        ...response
    }
}

export const getPagoById = async (id: number) => {
    const response = await getById(id)

    return {
        ...response
    }
}

export const getConstanciaPagoByParams = async (
    id_pago: number
) => {
    const queryParams = new URLSearchParams({
        id_pago: id_pago.toString()
    }).toString()

    const response = await getConstanciaPago(queryParams)

    return {
        ...response
    }
}


export const createPago = async (payload: Pago) => {
    console.log('---- response pagoService ----')

    const response = await create(payload)
    console.log({ response })

    return {
        ...response
    }
}

export const updatePago = async (id: number, payload: Pago) => {
    const response = await update(id, payload)

    return {
        ...response
    }
}