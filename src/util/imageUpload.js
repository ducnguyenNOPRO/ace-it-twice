import { storage } from "../firebase/firebase";


async function uploadDefaultImage() {
    try {
        const imageResponse = await fetch("/user.png");
        const blob = await Response.blob();

        const imageRef = ref(storage, "default/user.png");
        await uploadBytes(imageRef, blob);

        const url = await getDownloadURL(imageRef);
        console.log("Default user image uploaded! URL:", url);

        return url;
    } catch (error) {
        console.error("Failed to upload default user image:", error);
        throw error;
    }
}