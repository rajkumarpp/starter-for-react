import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const isActive = (path) => {
        return location.pathname === path ? "text-pink-600 font-semibold" : "text-gray-600 hover:text-gray-900";
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Branding */}
                    <div className="flex items-center gap-3">
                        <img src="/appwrite.svg" alt="Appwrite" className="w-8 h-8" />
                        <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                            The Royal Ledger
                        </span>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/home" className={`${isActive("/home")} transition-colors`}>
                            Home
                        </Link>
                        <Link to="/configuration" className={`${isActive("/configuration")} transition-colors`}>
                            Configuration
                        </Link>
                        <Link to="/settings" className={`${isActive("/settings")} transition-colors`}>
                            Settings
                        </Link>
                        <Link to="/help" className={`${isActive("/help")} transition-colors`}>
                            Help
                        </Link>
                    </div>

                    {/* User Profile and Logout */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end mr-2">
                            <span className="text-xs text-gray-500">Welcome back,</span>
                            <span className="text-sm font-semibold text-gray-900 leading-none">
                                {user?.name || "User"}
                            </span>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition duration-200 ease-in-out flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3-3h4a3 3 0 01 3 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Header;
