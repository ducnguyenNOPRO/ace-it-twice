import React, { useEffect, useState, useRef } from "react";
import { usePlaidLink } from "react-plaid-link";
import { httpsCallable } from "firebase/functions";
import { functions } from '../../firebase/firebase'
import { useAuth } from "../../contexts/authContext";
import Sidebar from "../../components/Sidebar/Sidebar";
import Topbar from "../../components/Topbar";
import { FaCameraRetro } from "react-icons/fa";
import './Setting.css'

const PlaidInterface = () => {
    const [linkToken, setLinkToken] = useState(null);
    const [shouldOpen, setShouldOpen] = useState(false); // trigger to open when ready

    // Get link token for Plaid Link
    const fetchLinkToken = async () => {
        try {
            const createLinkToken = httpsCallable(functions, "createLinkToken");
            const result = await createLinkToken();
            console.log("✅ Link Token:", result.data.link_token);
            setLinkToken(result.data.link_token);
            setShouldOpen(true);
        } catch (error) {
            console.error("Failed to get link token:", error);
        }
    }

    // Set up Plaid Link
    // Get public toekn and exchange it for a permanent access token
    const { open, ready } = usePlaidLink({
        token: linkToken,
        onSuccess: async (public_token, metadata) => {
            // TODO: Send public_token to your backend to exchange for access_token
            try {
                console.log(public_token)
                const exchangeToken = httpsCallable(functions, "exchangePublicToken");
                const result = await exchangeToken({ public_token })
            } catch (error) {
                console.error("Error exchanging token:", error);
            }
        },
            onExit: (error, metadata) => {
            console.warn("⚠️ User exited Plaid Link", error, metadata);
        },
    });
    
    useEffect(() => {
        if (shouldOpen && ready) {
            open();
            setShouldOpen(false);
        }
    }, [ready, shouldOpen, open])

    return (
        <>
            <button
                disabled={shouldOpen}
                onClick={() => fetchLinkToken() }
                className="px-6 py-2 bg-orange-400 text-white rounded-lg font-medium hover:bg-orange-500 transition cursor-pointer"
            >
                Connect
            </button>
        </>
    )
}

const ProfileImage = ({ previewImage, handleButtonClick, fileInputRef, handleFileChange }) => {
    return (
    <div className="relative group">
        <img src={previewImage}
            className="w-25 h-25 rounded-full object-cover z-10 group group-hover:z-0 group-hover:opacity-50 transition duration-300"
        />
        <button
            className="absolute z-0 opacity-0 group-hover:z-20 group-hover:opacity-100 transition duration-300
            text-orange-500 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            onClick={handleButtonClick}
        >
            <FaCameraRetro size={20} />
        </button>
        <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
        />
    </div>
    )
}

export default function Setting() {
    const { currentUser } = useAuth();
    const [fullName, setFullName] = useState('');
    const [preferedName, setPreferedName] = useState('');
    const [gender, setGender] = useState('');
    const [language, setLanguage] = useState(null)
    const [previewImage, setPreviewImage] = useState(
        currentUser.photoURL || "../../../public/user.png"
    )  // user image
    const [tempObjectURL, setTempObjectURL] = useState(null); // keep track of temporary URL
    const fileInputRef = useRef();

    const handleButtonClick = () => {
        fileInputRef.current.click();
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (tempObjectURL) {
                URL.revokeObjectURL(tempObjectURL);
            }
            // Create a temporary URL to preview the image
            const imageUrl = URL.createObjectURL(file);
            console.log("Temporary object URL:", imageUrl);
            setPreviewImage(imageUrl);
            setTempObjectURL(imageUrl); // Store to clean up later
        }
    }
    
    // Cleanup on component unmount
    useEffect(() => {
        return () => {
        if (tempObjectURL) {
            URL.revokeObjectURL(tempObjectURL);
        }
        };
    }, [tempObjectURL]);
    return (
        <>
            <div className="flex h-screen text-gray-500">
                {/* Sidebar */}
                <Sidebar />     
                
                {/* Page Content*/}
                <div className="flex-1 overflow-auto">
                    {/* Topbar*/}
                    <Topbar pageName={`Welcome back ${currentUser.displayName}`} userFirstInitial={currentUser.displayName?.charAt(0)} />
                    <div className="mx-6 mt-6 h-20 rounded-t-xl shadow-t-2xl bg-linear-to-r from-blue-200 to-yellow-100">
                    </div>
                    {/* Main Content */}
                    <main className="mx-6 p-6 shadow-lg">

                        {/* Header */}
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                { /* User Profile Image */ }
                                <ProfileImage
                                    previewImage={previewImage}
                                    fileInputRef={fileInputRef}    
                                    handleButtonClick={handleButtonClick}
                                    handleFileChange={handleFileChange}
                                />

                                <div>
                                    <p className="text-black text-xl font-bold">{currentUser.displayName}</p>
                                    <p>Some email</p>
                                </div>
                            </div>
                            <button
                                className="px-6 py-2 bg-orange-400 text-white rounded-lg font-medium hover:bg-orange-500 transition cursor-pointer"
                            >
                                Save
                            </button>
                        </div>

                        <form className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                            <div>
                                <label htmlFor="full-name">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    id="full-name"
                                    placeholder={currentUser.displayName ? currentUser.displayName : "Your Full Name"}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="prefered-name">
                                    Prefered Name
                                </label>
                                <input
                                    type="text"
                                    value={preferedName}
                                    id="prefered-name"
                                    placeholder="Your Prefered Name"
                                    onChange={(e) => setPreferedName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="gender">
                                    Gender
                                </label>
                                <select
                                    id="gender"
                                >
                                    <option value="">Choose an option</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="no-answer">Prefered Not to Answer</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="language">
                                    Language
                                </label>
                                <select
                                    id="language"
                                >
                                    <option value="">Choose an option</option>
                                    <option value="English">English</option>
                                    <option value="Spanish">Spanish</option>
                                    <option value="Chinese">Chinese</option>
                                </select>
                            </div> 
                            <span className="h-px  sm:col-span-2 bg-gray-200 block"></span>
                        </form>

                        <div className="flex justify-between gap-2 items-center">
                            <p className="text-black font-bold">Bank account</p>
                            <p>No bank account connected</p>
                            <PlaidInterface />
                        </div>
                    </main>
                </ div>
            </div>
        </>
    )
}