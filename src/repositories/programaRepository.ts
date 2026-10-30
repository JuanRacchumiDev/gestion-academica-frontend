import { Programa, ProgramaResponse } from "@/interfaces/IPrograma";
import apiClient from "./apiClient";
import { AxiosRequestConfig } from "axios";
import { downloadFile } from "../utils/fileUtils";

export const getAll = async (): Promise<ProgramaResponse> => {
    try {
        const urlApi = `/programas`

        const response = await apiClient.get(urlApi)

        console.log({ response })

        const { data: { result, data, message } } = response

        return {
            result,
            data,
            message
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const getAllPaginate = async (queryParams: string): Promise<ProgramaResponse> => {
    try {
        const urlApi = `/programas/paginate?${queryParams}`

        console.log({ urlApi })

        const response = await apiClient.get(urlApi)

        console.log({ response })

        const { data: { result, data, message, pagination } } = response

        return {
            result,
            data: data.data,
            message,
            pagination
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const getById = async (id: number): Promise<ProgramaResponse> => {
    try {
        const urlApi = `${'/programas/'}${id}`

        console.log({ urlApi })

        const response = await apiClient.get(urlApi)

        const { data: { result, message, data } } = response

        return {
            result,
            data,
            message
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const downloadModuloPDF = async (id: number, idModulo: number, filename: string): Promise<void> => {
    try {
        const urlApi = `/programas/${id}/modulos/${idModulo}/descargar-plan`

        const response = await apiClient.get(
            urlApi,
            {
                responseType: 'blob'
            }
        )

        const { data } = response

        const setBlob = new Blob([data])

        downloadFile(setBlob, filename);
    } catch (error) {
        console.error("Error al descargar el plan:", error);
        // Podrías usar showToast aquí para notificar al usuario
        throw new Error("No se pudo descargar el archivo.");
    }
}

export const create = async (
    payload: FormData | Programa,
    config?: AxiosRequestConfig
): Promise<ProgramaResponse> => {
    try {
        const response = await apiClient.post('/programas', payload, config)

        const { data: { result, message, data } } = response

        return {
            result,
            message,
            data
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const update = async (
    id: number,
    payload: FormData | Programa,
    config?: AxiosRequestConfig
): Promise<ProgramaResponse> => {
    try {
        const urlApi = `${'/programas/'}${id}`

        const response = await apiClient.post(urlApi, payload, config)

        console.log({ response })

        const { data: { result, data, message, error, status } } = response

        return {
            result,
            data,
            message,
            error,
            status
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}