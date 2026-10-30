import apiClient from "./apiClient";
import { Adjunto, AdjuntoResponse } from "../interfaces/IAdjunto"
import { AxiosRequestConfig } from "axios";
import { downloadFile } from "../utils/fileUtils";

export const getAll = async (): Promise<AdjuntoResponse> => {
    try {
        const urlApi = `/adjuntos`

        const response = await apiClient.get(urlApi)

        // console.log({ response })

        const { data: { result, data, message } } = response

        return {
            result,
            data,
            message
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        // console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const getAllPaginate = async (queryParams: string): Promise<AdjuntoResponse> => {
    try {
        const urlApi = `/adjuntos/paginate?${queryParams}`

        // console.log({ urlApi })

        const response = await apiClient.get(urlApi)

        // console.log('---- response getAllPaginate adjuntoRepository ----')

        // console.log({ response })

        const { data: { data, result, message, pagination } } = response

        return {
            result,
            data,
            message,
            pagination
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const getById = async (id: number): Promise<AdjuntoResponse> => {
    try {
        const urlApi = `${'/adjuntos/'}${id}`

        // console.log({ urlApi })

        const response = await apiClient.get(urlApi)

        const { data: { result, message, data } } = response

        return {
            result,
            data,
            message
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        // console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const download = async (id: number, filename: string): Promise<void> => {
    try {
        const urlApi = `/adjuntos/${id}/download`

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
        console.error("Error al descargar el archivo adjunto:", error);
        // Podrías usar showToast aquí para notificar al usuario
        throw new Error("No se pudo descargar el archivo adjunto.");
    }
}

export const create = async (
    payload: FormData | Adjunto,
    config?: AxiosRequestConfig
): Promise<AdjuntoResponse> => {
    try {
        const response = await apiClient.post('/adjuntos', payload, config)

        // console.log('---- response create adjuntoRepository ----')
        // console.log({ response })

        const { data: { result, message, data } } = response

        return {
            result,
            message,
            data
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        // console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const update = async (
    id: number,
    payload: FormData | Adjunto,
    config?: AxiosRequestConfig
): Promise<AdjuntoResponse> => {
    try {
        const urlApi = `${'/adjuntos/'}${id}`

        const response = await apiClient.post(urlApi, payload, config)

        // console.log({ response })

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
        // console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const destroy = async (id: number): Promise<AdjuntoResponse> => {
    try {
        const urlApi = `/adjuntos/${id}`;
        const response = await apiClient.delete(urlApi);

        const { data: { result, message, data } } = response;

        return {
            result,
            message,
            data,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Error desconocido al eliminar";
        console.error("errorMessage", errorMessage);
        return { result: false, data: [], error: errorMessage, status: 500 };
    }
};

export const verificarExistencia = async (params: {
    id_programa: number,
    id_modulo?: number | null,
    titulo: string
}): Promise<AdjuntoResponse> => {
    try {
        const urlApi = `/adjuntos/verificar`
        const response = await apiClient.post(urlApi, params)

        const { data: { result, exists, data, message, code } } = response

        return {
            result,
            exists,
            data,
            message,
            code
        }
    } catch (error) {

    }
}