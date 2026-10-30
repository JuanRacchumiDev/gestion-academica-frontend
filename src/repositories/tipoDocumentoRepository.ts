import { DetalleParametro, DetalleParametroResponse } from "@/interfaces/IDetalleParametro";
import apiClient from "./apiClient";

export const getAll = async (): Promise<DetalleParametroResponse> => {
    try {
        const response = await apiClient.get('/catalogos/tipo-documento')

        const { data: dataTipoDocumentos } = response

        const { result, data, message } = dataTipoDocumentos

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

export const getById = async (id: string): Promise<DetalleParametroResponse> => {
    try {
        const urlApi = `${'/catalogos/tipo-documento/'}${id}`

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

export const create = async (payload: DetalleParametro): Promise<DetalleParametroResponse> => {
    try {
        const response = await apiClient.post('/catalogos/tipo-documento', payload)

        const { data: { result, message, status } } = response

        return {
            result,
            message,
            status
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}