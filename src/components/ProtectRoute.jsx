import { useAuth } from "../contexts/authContext";
import { Navigate} from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const { currentUser, loading } = useAuth();

    // Show a loading indicator while authentication state is being determined
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return currentUser ? children : <Navigate to="/Account/Login"/>
}