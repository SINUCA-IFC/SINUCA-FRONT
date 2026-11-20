import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    sendEmailVerification,
    signInWithPopup,
    signInWithEmailAndPassword,
    reload,
} from 'firebase/auth'

import { firebaseAuth } from '@/plugins/firebase'

//CÓDIGO PELO EMAIL
export async function cadastrarComEmail(email, password) {
    const { user } = await createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        password,
    )

    await sendEmailVerification(user)

    return user
}

export async function entrarComEmail(email, password) {
    const { user } = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password,
    )

    return user
}

export async function reenviarConfirmacao() {
    const user = firebaseAuth.currentUser

    if (!user) throw new Error('Entre na sua conta primeiro.')

    await reload(user)

    if (!user.emailVerified) {
        await sendEmailVerification(user)
    }
}

export async function conferirConfirmacao() {
    const user = firebaseAuth.currentUser

    if (!user) throw new Error('Entre na sua conta primeiro.')

    await reload(user)

    if (!user.emailVerified) return null

    return user.getIdToken(true)
}


//LOGIN DIRETO PELO GOOGLE 

export async function entrarComGoogle() {
    const provider = new GoogleAuthProvider()

    provider.setCustomParameters({
        prompt: 'select_account',
    })

    const { user } = await signInWithPopup(firebaseAuth, provider)

    return user.getIdToken()
};