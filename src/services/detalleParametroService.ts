import { DetalleParametro, DetalleParametroFilters } from '@/interfaces/IDetalleParametro'
import {
    getAll,
    getAllPaginate,
    getAllByClase,
    getByParams,
    create,
    update,
    updateEstado
} from '../repositories/detalleParametroRepository'

export const getDetalles = async (queryParams: string) => {
    console.log('queryParams getDetalles', queryParams)

    const response = await getAll(queryParams)

    return {
        ...response
    }
}

export const getDetallesByClase = async (clase: string) => {
    const response = await getAllByClase(clase)

    return {
        ...response
    }
}

export const getDetallesFiltered = async (
    page?: number,
    limit?: number,
    filters?: {}
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

    console.log({ response })

    return {
        ...response
    }
}

export const getDetalleByParams = async (queryParams: string) => {
    const response = await getByParams(queryParams)

    return {
        ...response
    }
}

export const createDetalle = async (clase: string, payload: DetalleParametro) => {
    const response = await create(clase, payload)
    console.log('response createDetalle')
    console.log({ response })

    return {
        ...response
    }
}

export const updateDetalle = async (clase: string, id: number, payload: DetalleParametro) => {
    const response = await update(clase, id, payload)

    return {
        ...response
    }
}

export const updateDetalleByEstado = async (clase: string, id: string, payload: DetalleParametro) => {
    const response = await updateEstado(clase, id, payload)

    return {
        ...response
    }
}