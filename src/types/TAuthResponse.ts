export type TAuthResponse = {
    result?: boolean
    message?: string
    status?: number
    error?: string,
    data?: {
        id?: string
        nombre_perfil?: string
        name?: string
        nombre_completo?: string
        email?: string
    }
}