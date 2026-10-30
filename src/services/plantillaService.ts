import { AxiosRequestConfig } from "axios"
import { Plantilla } from "../interfaces/IPlantilla"
import {
    getAll,
    getAllPaginate,
    getById,
    create,
    update
} from "../repositories/plantillaRepository"

export const getPlantillas = async (filters: Record<string, any> = {}) => {
    console.log({ filters })

    const queryParams = new URLSearchParams(
        Object.entries(filters)
            .filter(([, value]) => value !== undefined && value !== null && value !== "")
            .map(([key, value]) => [key, String(value)])
    ).toString()

    console.log({ queryParams })

    const response = await getAll(queryParams)

    return {
        ...response
    }
}

export const getPlantillasPaginate = async (
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

export const getPlantillaById = async (id: number) => {
    const response = await getById(id)

    return {
        ...response
    }
}

export const createPlantilla = async (
    payload: FormData | Plantilla,
    config?: AxiosRequestConfig
) => {
    const response = await create(payload, config)

    return {
        ...response
    }
}

export const updatePlantilla = async (id: number, payload: FormData | Plantilla, config?: AxiosRequestConfig) => {
    const response = await update(id, payload, config)

    return {
        ...response
    }
}