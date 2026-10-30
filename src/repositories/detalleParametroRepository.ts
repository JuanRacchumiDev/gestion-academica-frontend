import {
    DetalleParametro,
    DetalleParametroResponse,
    DetalleParametroPaginateResponse
} from "@/interfaces/IDetalleParametro"
import apiClient from "./apiClient"

export const getAll = async (queryParams: string): Promise<DetalleParametroResponse> => {
    try {
        const urlApi = `/catalogos?${queryParams}`

        const response = await apiClient.get(urlApi)

        console.log('response getAll detalleParametroRepository')

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

export const getAllPaginate = async (queryParams: string): Promise<DetalleParametroPaginateResponse> => {
    try {
        const urlApi = `/catalogos/paginate?${queryParams}`

        console.log({ urlApi })

        const response = await apiClient.get(urlApi)

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

export const getAllByClase = async (clase: string): Promise<DetalleParametroResponse> => {
    try {
        const urlApi = `/catalogos/clase/${clase}`

        const response = await apiClient.get(urlApi)

        console.log('response getAllByClase detalleParametroRepository', response)

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

export const getByParams = async (queryParams: string): Promise<DetalleParametroResponse> => {
    try {
        const urlApi = `/catalogos/show?${queryParams}`

        const response = await apiClient.get(urlApi)

        console.log('response getDetalle detalleParametroRepository', response)

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

export const create = async (clase: string, payload: DetalleParametro): Promise<DetalleParametroResponse> => {
    try {
        const urlApi = `/catalogos/${clase}`

        const response = await apiClient.post(urlApi, payload)

        const { data: { result, message, status, code } } = response

        return {
            result,
            message,
            status,
            code
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return {
            result: false,
            data: [],
            error: errorMessage,
            status: 500
        }
    }
}

export const update = async (clase: string, codigo: number, payload: DetalleParametro): Promise<DetalleParametroResponse> => {
    try {
        const urlApi = `${'/catalogos/'}${clase}/${codigo}`

        console.log({ urlApi })

        const response = await apiClient.patch(urlApi, payload)

        const { data: { result, data, message, error, status, code } } = response

        return {
            result,
            data,
            message,
            error,
            status,
            code
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const updateEstado = async (clase: string, codigo: string, payload: DetalleParametro): Promise<DetalleParametroResponse> => {
    try {
        const urlApi = `${'/catalogos/'}${clase}${'update-estado/'}${codigo}`

        const response = await apiClient.patch(urlApi, payload)

        const { data: { result, data, status, message, error } } = response

        return {
            result,
            data,
            status,
            message,
            error
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, error: errorMessage, status: 500 }
    }
}