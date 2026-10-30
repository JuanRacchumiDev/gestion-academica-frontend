import { AxiosRequestConfig } from "axios"
import { Adjunto } from "../interfaces/IAdjunto"
import {
    getAll,
    getAllPaginate,
    getById,
    download,
    create,
    update,
    destroy
} from "../repositories/adjuntoRepository"

export const getAdjuntos = async () => {
    const response = await getAll()

    return {
        ...response
    }
}

export const getAdjuntosPaginate = async (
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

export const getAdjuntoById = async (id: number) => {
    const response = await getById(id)

    return {
        ...response
    }
}

export const downloadAdjunto = async (id: number, filename: string): Promise<void> => {
    return download(id, filename)
}

export const createAdjunto = async (
    payload: FormData | Adjunto,
    config?: AxiosRequestConfig
) => {
    const response = await create(payload, config)

    console.log('---- response adjuntoService ----')
    console.log({ response })

    return {
        ...response
    }
}

export const updateAdjunto = async (
    id: number,
    payload: FormData | Adjunto,
    config?: AxiosRequestConfig
) => {
    const response = await update(id, payload, config)

    console.log('---- response adjuntoService ----')
    console.log({ response })

    return {
        ...response
    }
}

export const deleteAdjunto = async (id: number) => {
    const response = await destroy(id);

    console.log("---- response deleteAdjunto service ----", { response });

    return {
        ...response,
    };
};

export const verificarAdjuntoExistencia = async (params: {
    id_programa: number;
    id_modulo?: number | null;
    titulo: string;
}) => {
    const response = await verificarAdjuntoExistencia(params);

    console.log("---- response verificarAdjuntoExistencia service ----", { response });

    return {
        ...response,
    };
};