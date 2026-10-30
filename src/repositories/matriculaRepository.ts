import apiClient from "./apiClient";
import { Matricula, MatriculaResponse } from "@/interfaces/IMatricula";
import { padString } from "../utils/stringUtils"
import { ModulosPorPagarResponse, ModulosPagadosResponse } from "@/interfaces/IPago";

export const getAll = async (): Promise<MatriculaResponse> => {
    try {
        const urlApi = `/matriculas`

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

export const getAllPaginate = async (queryParams: string): Promise<MatriculaResponse> => {
    try {
        const urlApi = `/matriculas/paginate?${queryParams}`

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

export const getById = async (id: number): Promise<MatriculaResponse> => {
    try {
        const urlApi = `${'/matriculas/'}${id}`

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

export const getCrogramaPagos = async (queryParams: string) => {
    try {
        const urlApi = `/matriculas/cronograma-pagos?${queryParams}`

        console.log({ urlApi })

        const response = await apiClient.get(urlApi, {
            responseType: 'blob'
        });

        const fileBlob = response.data

        // El nombre del archivo puede venir en los headers, si el backend lo envía
        const contentDisposition = response.headers['content-disposition'];

        const params = new URLSearchParams(queryParams);

        // Obtenemos los valores y los convertimos a número
        const idMatricula = Number(params.get('id_matricula')) || 0;

        // Aplicamos el padding usando tu utilitario stringUtils
        const idMatriculaPadding = padString(4, idMatricula, 'left');

        let filename = `cronograma_pagos_matricula_${idMatriculaPadding}.pdf`;

        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/i);

            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1];
            }
        }

        return {
            result: true,
            data: fileBlob, // Retornamos el Blob
            filename: filename, // Retornamos el nombre del archivo
            message: "Cronograma de pagos generado exitosamente."
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const getModulosPorPagar = async (id: number): Promise<ModulosPorPagarResponse> => {
    try {
        const urlApi = `${'/matriculas/'}${id}${'/modulos-por-pagar'}`

        console.log({ urlApi })

        const response = await apiClient.get(urlApi)

        console.log({ response })

        const { data: { result, message, data } } = response

        return {
            result,
            data,
            message
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return {
            result: false,
            data: null,
            message: "Módulos por pagar no obtenidos",
            error: errorMessage,
            status: 500
        }
    }
}

export const getModulosPagados = async (id: number): Promise<ModulosPagadosResponse> => {
    try {
        const urlApi = `${'/matriculas/'}${id}${'/modulos-pagados'}`

        console.log({ urlApi })

        const response = await apiClient.get(urlApi)

        console.log({ response })

        const { data: { result, message, data } } = response

        return {
            result,
            data,
            message
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return {
            result: false,
            data: null,
            message: "Módulos por pagar no obtenidos",
            error: errorMessage,
            status: 500
        }
    }
}

export const create = async (payload: Matricula): Promise<MatriculaResponse> => {
    try {
        console.log('matriculaRepository method: create payload')
        console.log({ payload })

        const response = await apiClient.post('/matriculas', payload)

        console.log('response create matriculaRepository')
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

export const update = async (id: number, payload: Matricula): Promise<MatriculaResponse> => {
    try {
        const urlApi = `${'/matriculas/'}${id}`

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