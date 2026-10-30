import { AxiosRequestConfig } from "axios"
import { Institucion, InstitucionResponse } from "../interfaces/IInstitucion"
import apiClient from "./apiClient"

export const getAll = async (queryParams: string): Promise<InstitucionResponse> => {
    try {
        const urlApi = `/instituciones?${queryParams}`

        console.log({ urlApi })

        const response = await apiClient.get(urlApi)

        console.log('response getAll institucionRepository', response)

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

export const getAllPaginate = async (queryParams: string): Promise<InstitucionResponse> => {
    try {
        const urlApi = `/instituciones/paginate?${queryParams}`

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

export const getById = async (id: number): Promise<InstitucionResponse> => {
    try {
        const urlApi = `${'/instituciones/'}${id}`

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

export const create = async (payload: FormData | Institucion, config?: AxiosRequestConfig): Promise<InstitucionResponse> => {
    try {
        console.log('institucionRepository method: create')
        console.log({ payload })

        const response = await apiClient.post('/instituciones', payload)

        console.log('response create institucionRepository')
        console.log({ response })

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

export const update = async (id: number, payload: FormData | Institucion, config?: AxiosRequestConfig): Promise<InstitucionResponse> => {
    try {
        const urlApi = `${'/instituciones/'}${id}`

        console.log({ urlApi })

        // const response = await apiClient.patch(urlApi, payload)
        const response = await apiClient.post(urlApi, payload, config)

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