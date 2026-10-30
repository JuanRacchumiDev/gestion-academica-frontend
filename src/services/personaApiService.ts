import { getByApi } from "../repositories/personaApiRepository"

export const getPersonaByApi = async (
    tipoDocumento: string,
    numeroDocumento: string,
    nombreGrupo: string
) => {
    console.log('---- getPersonaByApi ----')
    console.log({ tipoDocumento })
    console.log({ numeroDocumento })
    console.log({ nombreGrupo })
    const response = await getByApi(tipoDocumento, numeroDocumento, nombreGrupo)
    console.log('response getPersonaByApi')
    console.log({ response })

    return {
        ...response
    }
}