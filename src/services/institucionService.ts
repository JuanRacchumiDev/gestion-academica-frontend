import { AxiosRequestConfig } from "axios"
import { Institucion } from "@/interfaces/IInstitucion"
import {
    getAll,
    getAllPaginate,
    getById,
    create,
    update
} from "../repositories/institucionRepository"

export const getInstituciones = async (queryParams: string) => {
    console.log('getInstituciones queryParams', queryParams)

    const response = await getAll(queryParams)

    return {
        ...response
    }
}

export const getInstitucionesPaginate = async (
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

export const getInstitucionById = async (id: number) => {
    const response = await getById(id)

    return {
        ...response
    }
}

export const createInstitucion = async (data: FormData | Institucion, config?: AxiosRequestConfig) => {
    const response = await create(data, config)

    console.log('---- response createInstitucion ----')
    console.log({ response })

    return {
        ...response
    }
}

export const updateInstitucion = async (id: number, data: FormData | Institucion, config?: AxiosRequestConfig) => {
    const response = await update(id, data, config)

    console.log('---- response updateInstitucion ----')
    console.log({ response })

    return {
        ...response
    }
}