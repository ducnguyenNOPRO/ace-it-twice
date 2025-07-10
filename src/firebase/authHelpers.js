import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider, 
    FacebookAuthProvider,
    signInWithPopup,
    signOut,
    sendPasswordResetEmail,
    updatePassword,
    updateProfile,
    sendEmailVerification
} from "firebase/auth";
import { auth } from "./firebase";
import { db } from "./firebase";
import {doc, setDoc, serverTimestamp} from "firebase/firestore"

export const registerUserWithEmailAndPassword = async (email, password, name) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await updateProfile(userCredential.user, {
            displayName: name
        })  // Set display name in Firebase Auth

        // Create user document in Firestore
        const userRef = doc(db, "users", userCredential.user.uid)  
        await setDoc(userRef, {
            uid: userCredential.user.uid,
            email,
            name,
            createdAt: serverTimestamp()
        })
        return userCredential;
    } catch (error) {
        // Log for debugging
        console.error("Registration failed:", error);

        // Let the caller handle it
        throw error;
    }
}

export const signInUserWithEmailAndPassword = async (email, password) => {
    
    try {
        return signInWithEmailAndPassword(auth, email, password)
    } catch {

    }
        
}

export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    return result;
}

export const signInWithFacebook = async () => {
    const provider = new FacebookAuthProvider();
    const result = await signInWithPopup(auth, provider);

    return result;
}
export const signUserOut = () => {
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