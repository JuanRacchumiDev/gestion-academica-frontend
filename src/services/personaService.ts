import { Persona } from "../interfaces/IPersona"
import {
    getAll,
    getAllPaginate,
    getById,
    create,
    update
} from "../repositories/personaRepository"

export const getPersonas = async (nombreGrupo: string) => {
    const response = await getAll(nombreGrupo)

    return {
        ...response
    }
}

export const getPersonasPaginate = async (
    page: number,
    limit: number,
    nombreGrupo: string,
    filters: {}
) => {
    console.log('---- inicio recibir datos en personaService ----');

    console.log({ page })
    console.log({ limit })
    console.log({ nombreGrupo })
    console.log({ filters })

    console.log('---- fin recibir datos en personaService ----');

    // Construir la cadena de query parameters
    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
            Object.entries(filters).filter(([, value]) => value)
        )
    }).toString()

    console.log({ queryParams })

    const response = await getAllPaginate(nombreGrupo, queryParams)

    console.log('---- response in personaService ----')

    console.log({ response })

    return {
        ...response
    }
}

export const getPersonaById = async (id: number) => {
    const response = await getById(id)

    return {
        ...response
    }
}

export const createPersona = async (payload: Persona) => {
    const response = await create(payload)
    console.log('response createPersona')
    console.log({ response })

    return {
        ...response
    }
}

export const updatePersona = async (id: number, payload: Persona) => {
    const response = await update(id, payload)
    console.log('response updatePersona')
    console.log({ response })

    return {
        ...response
    }
}