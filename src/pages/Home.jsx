import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import db from "../lib/database";
import "../App.css";

function Home() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [dbStatus, setDbStatus] = useState(null);
  const [dbLoading, setDbLoading] = useState(false);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate("/login");
    }
  };

  const testDatabaseConnection = async () => {
    setDbLoading(true);
    setDbStatus(null);
    
    // First test the connection
    const userId = "greatppr";
    const result = await db.testConnection(userId);
    setDbStatus(result);
    
    // Also get the accounts table schema
    const schemaResult = await db.getCollectionSchema('accounts');
    console.log('Accounts table schema:', schemaResult);
    
    setDbLoading(false);
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src="/appwrite.svg" alt="Appwrite" className="w-8 h-8" />
              <span className="text-xl font-bold text-gray-900">
                The Royal Ledger
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/accounts")}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition"
              >
                Accounts
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-white font-bold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back, {user?.name || "User"}!
            </h1>
            <p className="text-gray-600">
              You're successfully logged in to your account
            </p>
          </div>

          {/* User Information */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Account Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600 font-medium">User ID:</span>
                <span className="text-gray-900 font-mono text-sm">
                  {user?.$id}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Name:</span>
                <span className="text-gray-900">{user?.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Email:</span>
                <span className="text-gray-900">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600 font-medium">
                  Email Verified:
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user?.emailVerification
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {user?.emailVerification ? "Verified" : "Not Verified"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">
                  Account Created:
                </span>
                <span className="text-gray-900">
                  {user?.$createdAt
                    ? new Date(user.$createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Database Connection Test */}
          <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              Database Connection
            </h2>
            
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                <strong>Database:</strong> expensetracker_db
              </p>
              <p className="text-gray-600 text-sm font-mono">
                ID: 698169f0003a699bc147
              </p>
            </div>

            <button
              onClick={testDatabaseConnection}
              disabled={dbLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {dbLoading ? "Testing..." : "Test Database Connection"}
            </button>

            {dbStatus && (
              <div className={`mt-4 p-4 rounded-lg ${dbStatus.success ? "bg-green-100 border border-green-300" : "bg-red-100 border border-red-300"}`}>
                {dbStatus.success ? (
                  <>
                    <p className="text-green-800 font-semibold mb-2">✅ Connection Successful!</p>
                    <p className="text-green-700 text-sm mb-2">
                      {dbStatus.message}
                    </p>
                    {dbStatus.userData && (
                      <div className="mt-3 bg-white rounded p-3 border border-green-200">
                        <p className="text-green-800 font-medium mb-2">User Data from Database:</p>
                        <div className="space-y-1 text-sm">
                          {Object.entries(dbStatus.userData).map(([key, value]) => {
                            if (key.startsWith('$')) return null; // Skip Appwrite internal fields
                            return (
                              <div key={key} className="flex justify-between py-1 border-b border-gray-100">
                                <span className="text-gray-600 font-medium">{key}:</span>
                                <span className="text-gray-900 font-mono text-xs">
                                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {dbStatus.allUsers !== undefined && !dbStatus.userData && (
                      <p className="text-yellow-700 text-sm mt-2">
                        Found {dbStatus.allUsers} total users, but "greatppr" not found
                      </p>
                    )}
                    <p className="text-green-600 text-xs mt-2 font-mono">
                      Database ID: {dbStatus.databaseId}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-red-800 font-semibold mb-2">❌ Connection Failed</p>
                    <p className="text-red-700 text-sm">{dbStatus.error}</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
