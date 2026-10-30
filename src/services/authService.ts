import {
    login,
    logout
} from '../repositories/authRepository'

export const loginAuth = async (email: string, password: string) => {
    console.log('---- response AuthService ----')

    const response = await login(email, password)

    console.log({ response })

    return {
        ...response
    }
}

export const logoutAuth = async (id: number) => {
    const response = await logout(id)

    return {
        ...response
    }
}