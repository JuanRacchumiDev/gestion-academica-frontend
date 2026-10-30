import { Plantilla, PlantillaResponse, PlantillaResponseGeneral } from "../interfaces/IPlantilla"
import apiClient, { nestApiClient } from "./apiClient";
import { AxiosRequestConfig } from "axios";

export const getAll = async (queryParams?: string): Promise<PlantillaResponse> => {
    try {
        let urlApi = `/plantillas`

        if (queryParams) {
            urlApi += `?${queryParams}`
        }

        console.log({ urlApi })

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

export const getAllPaginate = async (queryParams: string): Promise<PlantillaResponse> => {
    try {
        const urlApi = `/plantillas/paginate?${queryParams}`

        console.log({ urlApi })

        const response = await apiClient.get(urlApi)

        console.log({ response })

        const { data: { result, data, message, pagination } } = response

        console.log('---- data plantillas ----')
        console.log({ data })

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

export const getById = async (id: number): Promise<PlantillaResponseGeneral> => {
    try {
        const urlApi = `${'/plantillas/'}${id}`

        console.log({ urlApi })

        // const response = await apiClient.get(urlApi)
        const response = await nestApiClient.get(urlApi)

        console.log('---- response getById plantilla ----')
        console.log({ response })

        const { data, status, statusText } = response

        return { data, status, statusText }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        return { data: [], status: 500, statusText: errorMessage }
    }
}

export const create = async (
    payload: FormData | Plantilla,
    config?: AxiosRequestConfig
): Promise<PlantillaResponseGeneral> => {
    try {
        const response = await nestApiClient.post('/plantillas', payload, config)

        console.log({ response })

        const { data, status, statusText } = response

        return { data, status, statusText }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        return { data: [], status: 500, statusText: errorMessage }
    }
}

export const update = async (
    id: number,
    payload: FormData | Plantilla,
    config?: AxiosRequestConfig
): Promise<PlantillaResponseGeneral> => {
    try {
        const urlApi = `${'/plantillas/'}${id}`

        const response = await nestApiClient.patch(urlApi, payload, config)

        console.log({ response })

        const { data, status, statusText } = response

        return { data, status, statusText }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        return { data: [], status: 500, statusText: errorMessage }
    }
}