import { padString } from "@/utils/stringUtils";
import apiClient from "./apiClient";
import { Pago, PagoResponse } from "@/interfaces/IPago";

export const getAll = async (): Promise<PagoResponse> => {
    try {
        const urlApi = `/pagos`

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

export const getAllPaginate = async (queryParams: string): Promise<PagoResponse> => {
    try {
        const urlApi = `/pagos/paginate?${queryParams}`

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

export const getById = async (id: number): Promise<PagoResponse> => {
    try {
        const urlApi = `${'/pagos/'}${id}`

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

export const getConstanciaPago = async (queryParams: string) => {
    try {
        const urlApi = `/pagos/constancia?${queryParams}`

        console.log({ urlApi })

        const response = await apiClient.get(urlApi, {
            responseType: 'blob'
        });

        const fileBlob = response.data

        // El nombre del archivo puede venir en los headers, si el backend lo envía
        const contentDisposition = response.headers['content-disposition'];

        const params = new URLSearchParams(queryParams);

        // Obtenemos los valores y los convertimos a número
        const idPago = Number(params.get('id_pago')) || 0;

        // Aplicamos el padding usando tu utilitario stringUtils
        const idPagoPadding = padString(4, idPago, 'left');

        let filename = `constancia_pago_${idPagoPadding}.pdf`;

        if (contentDisposition) {
            // Intenta extraer el nombre del archivo del header 'Content-Disposition'
            const filenameMatch = contentDisposition.match(/filename="(.+)"/i);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1];
            }
        }

        return {
            result: true,
            data: fileBlob, // Retornamos el Blob
            filename: filename, // Retornamos el nombre del archivo
            message: "Constancia de pago generado exitosamente."
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const create = async (payload: Pago): Promise<PagoResponse> => {
    try {
        const response = await apiClient.post('/pagos', payload)

        console.log('response create pagoRepository')
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

export const update = async (id: number, payload: Pago): Promise<PagoResponse> => {
    try {
        const urlApi = `${'/pagos/'}${id}`

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