import React, { useEffect, useState, useRef } from "react";
import { db } from "../../firebase/firebase";
import { getDocs, collection } from "firebase/firestore";
import { usePlaidLink } from "react-plaid-link";
import { httpsCallable } from "firebase/functions";
import { functions } from '../../firebase/firebase'
import { useAuth } from "../../contexts/authContext";
import Sidebar from "../../components/Sidebar/Sidebar";
import Topbar from "../../components/Topbar";
import { FaCameraRetro } from "react-icons/fa";
import styles from './Setting.module.css'

const PlaidInterface = ({ userUid }) => {
  const [linkToken, setLinkToken] = useState(null);
  const [shouldOpen, setShouldOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const checkPlaidConnection = async (userUid) => {
    const plaidRef = collection(db, `users/${userUid}/plaid`);
    const snapshot = await getDocs(plaidRef);
    return !snapshot.empty;
  };

  useEffect(() => {
    const fetchConnectionStatus = async () => {
      const connected = await checkPlaidConnection(userUid);
      setIsConnected(connected);
    };
    fetchConnectionStatus();
  }, [userUid]);

  const fetchLinkToken = async () => {
    try {
      const createLinkToken = httpsCallable(functions, "createLinkToken");
    const result = await createLinkToken();
        
      setLinkToken(result.data.link_token);
      setShouldOpen(true);
    } catch (error) {
      console.error("Failed to get link token:", error);
    }
  };

  return (
    <div className="flex justify-between gap-2 items-center">
      <p className="text-black font-bold">Bank account</p>
      <p>{isConnected ? "Bank is connected" : "No bank connected"}</p>
      {!isConnected ? (
        <button
          disabled={shouldOpen}
          onClick={fetchLinkToken}
          className="px-6 py-2 bg-orange-400 text-white rounded-lg font-medium hover:bg-orange-500 transition cursor-pointer"
        >
          Connect
        </button>
      ) : (
        <p className="font-medium">Connected</p>
      )}

      {/* Conditionally render the PlaidLink component ONLY when linkToken exists */}
      {linkToken && (
        <PlaidLinkWrapper
          linkToken={linkToken}
          shouldOpen={shouldOpen}
          setShouldOpen={setShouldOpen}
          setLinkToken={setLinkToken}
          setIsConnected={setIsConnected}
        />
      )}
    </div>
  );
};

// Separate component that uses the hook
const PlaidLinkWrapper = ({
  linkToken,
  shouldOpen,
  setShouldOpen,
  setLinkToken,
  setIsConnected,
}) => {
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      try {
        const exchangeToken = httpsCallable(functions, "exchangePublicToken");
        const result = await exchangeToken({
          public_token,
          institution: metadata.institution,
          accounts: metadata.accounts,
        });
        setIsConnected(true);
        const fetchTransactionsFromPlaid = httpsCallable(functions, "fetchTransactionsFromPlaid")
        await fetchTransactionsFromPlaid({ itemId: result.data.itemId });
      } catch (error) {
        console.error("Error exchanging token:", error);
      }
    },
    onExit: (error) => {
      console.warn("User exited Plaid Link", error);
      setShouldOpen(false);
      setLinkToken(null); // Unmount this component, allowing future re-mount with fresh token
    },
  });

  useEffect(() => {
    if (shouldOpen && ready) {
      open();
      setShouldOpen(false);
    }
  }, [ready, shouldOpen, open, setShouldOpen]);

  return null; // This component renders nothing visible
};

// Component
const ProfileImage = ({ photoURL, handleButtonClick, fileInputRef, handleFileChange }) => {
    return (
    <div className="relative group">
        <img src={photoURL}
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

// User Form update component
const UserForm = ({ userData, onSave, photoURL }) => {
    const [formValues, setFormValues] = useState({
        fullName: "",
        preferedName: "",
        gender: "",
        language: ""
    })

    useEffect(() => {
        if (userData) {
            setFormValues((prev) => ({...prev, ...userData }));
        }
    }, [userData]);

    const handleInputChange = (e) => {
        const {name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            // Update user in Firestore
            const updateUser = httpsCallable(functions, "updateUser");
            await updateUser({ ...formValues });
            // httpsCallable alway return an objec like {data: {actual data}}

            // Update user in Firebase Auth
            const updateUserAuth = httpsCallable(functions, "updateUserAuth");
            await updateUserAuth({
                fullName: formValues.fullName,
                preferedName: formValues.preferedName,
                photoURL
            });

            // Re-fetch updated user profile 
            const getUser = httpsCallable(functions, "getUser");
            const resultUser = await getUser();
            onSave(resultUser.data);

        } catch (error) {
            console.error("Failed to update user", error);
        }
    }
    return (
        <form
            className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6"
            onSubmit={handleFormSubmit}
        >
            <div>
                <label htmlFor="full-name">
                    Full Name
                </label>
                <input
                    type="text"
                    value={formValues.fullName}
                    id="full-name"
                    name="fullName"
                    className={styles.input}
                    placeholder={"Your Full Name"}
                    onChange={handleInputChange}
                />
            </div>
            <div>
                <label htmlFor="prefered-name">
                    Prefered Name
                </label>
                <input
                    type="text"
                    value={formValues.preferedName}
                    id="prefered-name"
                    name="preferedName"
                    className={styles.input}
                    placeholder="Your Prefered Name"
                    onChange={handleInputChange}
                />
            </div>
            <div>
                <label htmlFor="gender">
                    Gender
                </label>
                <select
                    id="gender"
                    name="gender"
                    value={formValues.gender}
                    className={styles.input}
                    onChange={handleInputChange}
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
                    name="language"
                    value={formValues.language}
                    className={styles.input}
                    onChange={handleInputChange}
                >
                    <option value="">Choose an option</option>
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Chinese">Chinese</option>
                </select>
            </div>
            <button
                className="px-6 py-2 w-20 bg-orange-400 text-white rounded-lg font-medium hover:bg-orange-500 transition cursor-pointer"
                type="submit"
            >
                Save
            </button>
            <span className="h-px  sm:col-span-2 bg-gray-200 block"></span>
        </form>
    )
}

export default function Setting() {
    const { currentUser } = useAuth();
    const [userData, setUserData] = useState({...currentUser, fullName: currentUser.displayName});
    const [photoURL, setPhotoURL] = useState(
        "https://img.icons8.com/?size=100&id=7820&format=png&color=000000"
    )  // user image
    const [tempObjectURL, setTempObjectURL] = useState(null); // keep track of temporary URL
    const fileInputRef = useRef();

    // Handler for when form is saved and updated user data
    const handleSave = (updatedData) => {
        setUserData(updatedData);
    };

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
            setPhotoURL(imageUrl);
            setTempObjectURL(imageUrl); // Store to clean up later
        }
    }

    useEffect(() => {
        const getUserData = async () => {
            try {
                const getUser = httpsCallable(functions, "getUser")
                // httpsCallable  return an object {data: {actual data}}
                const result = await getUser();
                setUserData(result.data)
            } catch (error) {
                console.log("Failed to get user profile", error)
            }
        }
        getUserData();
    }, [])


    // Cleanup on component unmount
    useEffect(() => {
        return () => {
        if (tempObjectURL) {
            URL.revokeObjectURL(tempObjectURL);
        }
        };
    }, [tempObjectURL]);

    // Show a loading indicator while authentication state is being determined
    if (!userData) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <>
            <div className="flex h-screen text-gray-500">
                {/* Sidebar */}
                <Sidebar />     
                
                {/* Page Content*/}
                <div className="flex-1 overflow-auto">
                    {/* Topbar*/}
                    <Topbar pageName={`Welcome back ${userData.fullName ||  "No Name"}`}
                        userFirstInitial={userData.fullName?.charAt(0) || ""}
                    />
                    <div className="mx-6 mt-6 h-20 rounded-t-xl shadow-t-2xl bg-linear-to-r from-blue-200 to-yellow-100">
                    </div>
                    {/* Main Content */}
                    <main className="mx-6 p-6 shadow-lg">

                        {/* Header */}
                        <div className="flex items-center gap-2 mb-2">
                            { /* User Profile Image */ }
                            <ProfileImage
                                photoURL={photoURL}
                                fileInputRef={fileInputRef}    
                                handleButtonClick={handleButtonClick}
                                handleFileChange={handleFileChange}
                            />

                            <div>
                                <p className="text-black text-xl font-bold">{userData?.fullName || ""}</p>
                                <p>{userData.email || "No email"}</p>
                            </div>
                        </div>
                        <UserForm photoURL={photoURL} userData={userData} onSave={handleSave} />

                        <PlaidInterface userUid={currentUser.uid} />
                    </main>
                </ div>
            </div>
        </>
    )
}