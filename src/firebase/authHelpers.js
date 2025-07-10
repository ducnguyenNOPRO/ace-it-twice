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
import {doc, getDoc, setDoc, serverTimestamp} from "firebase/firestore"

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
        return signInWithEmailAndPassword(auth, email, password)        
}

const saveUserToFirestore = async (user, provider) => {
    const userRef = doc(db, "users", user.uid)
    const docSnap = await getDoc(userRef)

    if (!docSnap.exists()) {
        // Only create if it doesn't already exist
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            name: user.displayName,
            provider: provider,
            createdAt: serverTimestamp(),
        });
    }
}

export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user
    await saveUserToFirestore(user, "google")

    return result;
}

export const signInWithFacebook = async () => {
    const provider = new FacebookAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user
    await saveUserToFirestore(user, "facebook")

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
        url: `$(window.location.origin)/`
    })
}