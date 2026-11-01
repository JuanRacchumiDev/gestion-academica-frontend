import { GradoAcademico } from "../interfaces/IGradoAcademico"
import {
    getAll,
    getAllPaginate,
    getById,
    create,
    update,
} from "../repositories/gradoAcademicoRepository"

export const getGrados = async (queryParams: string) => {
    console.log('getGrados queryParams', queryParams)

    const response = await getAll(queryParams)

    return {
        ...response
    }
}

export const getGradosPaginate = async (
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

export const getGradoById = async (id: number) => {
    const response = await getById(id)

    return {
        ...response
    }
}

export const createGrado = async (payload: GradoAcademico) => {
    const response = await create(payload)

    return {
        ...response
    }
}

export const updateGrado = async (id: number, payload: GradoAcademico) => {
    const response = await update(id, payload)

    return {
        ...response
    }
}