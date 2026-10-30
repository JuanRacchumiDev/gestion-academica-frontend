import { PeriodoEvaluacion } from "../interfaces/IPeriodoEvaluacion"
import {
    getAll,
    getAllPaginate,
    getById,
    create,
    update,
} from "../repositories/periodoEvaluacionRepository"

export const getPeriodos = async (queryParams: string) => {
    console.log('getPeriodos queryParams', queryParams)

    const response = await getAll(queryParams)

    return {
        ...response
    }
}

export const getPeriodosPaginate = async (
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

export const getPeriodoById = async (id: number) => {
    const response = await getById(id)

    return {
        ...response
    }
}

export const createPeriodo = async (payload: PeriodoEvaluacion) => {
    const response = await create(payload)

    return {
        ...response
    }
}

export const updatePeriodo = async (id: number, payload: PeriodoEvaluacion) => {
    const response = await update(id, payload)

    return {
        ...response
    }
}