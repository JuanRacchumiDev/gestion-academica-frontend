import { Usuario } from "../interfaces/IUsuario"
import {
    getAll,
    getAllPaginate,
    getById,
    create,
    update
} from "../repositories/usuarioRepository"

export const getUsuarios = async () => {
    const response = await getAll()

    return {
        ...response
    }
}

export const getUsuariosPaginate = async (
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

export const getUsuarioById = async (id: number) => {
    const response = await getById(id)

    return {
        ...response
    }
}

export const createUsuario = async (
    payload: Usuario
) => {
    const response = await create(payload)

    return {
        ...response
    }
}

export const updateUsuario = async (id: number, payload: Usuario) => {
    const response = await update(id, payload)

    return {
        ...response
    }
}