import { Evento } from "../interfaces/IEvento"
import {
    getAll,
    getById,
    create,
    update
} from "../repositories/eventoRepository"

export const getEventos = async () => {
    const response = await getAll()

    return {
        ...response
    }
}

export const getEventoById = async (id: number) => {
    const response = await getById(id)

    return {
        ...response
    }
}

export const createEvento = async (payload: Evento) => {
    const response = await create(payload)

    return {
        ...response
    }
}

export const updateEvento = async (id: number, payload: Evento) => {
    const response = await update(id, payload)

    return {
        ...response
    }
}