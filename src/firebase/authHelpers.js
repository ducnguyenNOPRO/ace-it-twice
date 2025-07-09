import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider, 
    sendPasswordResetEmail,
    updatePassword,
    sendEmailVerification
} from "firebase/auth";
import { auth } from "./firebase";

export const registerUserWithEmailAndPassword = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password)
}

export const signInUserWithEmailAndPassword = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
}

export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    return result;
}

export const signOut = () => {
    return auth.signOut();
}

export const passwordReset = (email) => {
    return sendPasswordResetEmail(auth, email);
}

export const passwordChange = (email) => {
    return updatePassword(auth, email);
}

export const sendUserEmailVerification = () => {
    return sendEmailVerification(auth.currentUser, {
        url: `$(windoe.location.origin)/`
    })
}