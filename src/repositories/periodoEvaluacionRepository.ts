import { AxiosRequestConfig } from "axios"
import { PeriodoEvaluacion, PeriodoEvaluacionResponse } from "../interfaces/IPeriodoEvaluacion"
import apiClient from "./apiClient"

export const getAll = async (queryParams: string): Promise<PeriodoEvaluacionResponse> => {
    try {
        const urlApi = `/periodo-evaluacion?${queryParams}`

        console.log({ urlApi })

        const response = await apiClient.get(urlApi)

        console.log('response getAll periodoEvaluacionRepository', response)

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

export const getAllPaginate = async (queryParams: string): Promise<PeriodoEvaluacionResponse> => {
    try {
        const urlApi = `/periodo-evaluacion/paginate?${queryParams}`

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

export const getById = async (id: number): Promise<PeriodoEvaluacionResponse> => {
    try {
        const urlApi = `${'/periodo-evaluacion/'}${id}`

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

export const create = async (payload: PeriodoEvaluacion): Promise<PeriodoEvaluacionResponse> => {
    try {
        console.log('periodoEvaluacionRepository method: create payload')
        console.log({ payload })

        const response = await apiClient.post('/periodo-evaluacion', payload)

        console.log('response create periodoEvaluacionRepository')
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

export const update = async (id: number, payload: PeriodoEvaluacion): Promise<PeriodoEvaluacionResponse> => {
    try {
        const urlApi = `${'/periodo-evaluacion/'}${id}`

        const response = await apiClient.patch(urlApi, payload)

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