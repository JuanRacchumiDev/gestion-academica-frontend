import { AxiosRequestConfig } from "axios"
import { Programa } from "../interfaces/IPrograma"
import {
    getAll,
    getAllPaginate,
    getById,
    create,
    update,
    // downloadProgramaPDF,
    downloadModuloPDF
} from "../repositories/programaRepository"
import { padString } from "@/utils/stringUtils"

export const getProgramas = async () => {
    const response = await getAll()

    return {
        ...response
    }
}

export const getProgramasPaginate = async (
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

export const getProgramaById = async (id: number) => {
    const response = await getById(id)

    return {
        ...response
    }
}

// export const downloadProgramaPlan = async (id: number): Promise<void> => {
//     const idPadding = padString(4, id, 'left');

//     const filename: string = `plan_programa_${idPadding}.pdf`
//     return downloadProgramaPDF(id, filename)
// }

export const downloadModuloPlan = async (id: number, idModulo: number): Promise<void> => {
    const idProgramaPadding: string = padString(4, id, 'left');
    const idModuloPadding: string = padString(4, idModulo, 'left');

    const filename: string = `plan_programa_${idProgramaPadding}_modulo_${idModuloPadding}.pdf`;
    return downloadModuloPDF(id, idModulo, filename);
}

export const createPrograma = async (
    payload: FormData | Programa,
    config?: AxiosRequestConfig
) => {
    const response = await create(payload, config)

    return {
        ...response
    }
}

export const updatePrograma = async (id: number, payload: FormData | Programa, config?: AxiosRequestConfig) => {
    const response = await update(id, payload, config)

    return {
        ...response
    }
}