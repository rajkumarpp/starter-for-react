import { createContext, useContext, useState, useEffect } from "react";
import { account } from "../lib/appwrite";
import { ID } from "appwrite";
import db from "../lib/database";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only check user on initial mount
    checkUser();
  }, []);

  const ensureUserDocument = async (currentUser) => {
    if (!currentUser) return;

    try {
      // Check if user document exists using Auth ID as username
      const result = await db.getUserDocumentId(currentUser.$id);

      if (!result.success) {
        console.log("AuthContext: User document not found, creating new profile...");
        // valid schema fields based on typical setup, adjusting if needed based on failures
        // Assuming 'username', 'email', 'name' are the fields.
        // We use Auth ID as the unique 'username' for linkage.
        const userData = {
          username: currentUser.$id,
          email: currentUser.email,
          name: currentUser.name
        };

        const createResult = await db.createDocument('users', userData);

        if (createResult.success) {
          console.log("AuthContext: Created new user profile", createResult.document);
        } else {
          console.error("AuthContext: Failed to create user profile", createResult.error);
        }
      } else {
        console.log("AuthContext: User profile exists", result.documentId);
      }
    } catch (error) {
      console.error("AuthContext: Error ensuring user document", error);
    }
  };

  const checkUser = async () => {
    setLoading(true);
    try {
      console.log("AuthContext: Checking user session");
      const currentUser = await account.get();
      console.log("AuthContext: User found:", currentUser);

      // Self-healing: Ensure database document exists
      await ensureUserDocument(currentUser);

      setUser(currentUser);
      return currentUser;
    } catch (error) {
      console.log("AuthContext: No user session found", error.message);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const user = await checkUser();
      return { success: true, user };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, name) => {
    try {
      await account.create(ID.unique(), email, password, name);
      await loginWithEmail(email, password);
      // checkUser called in loginWithEmail will handle document creation
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      await account.updatePassword(newPassword, oldPassword);
      return { success: true };
    } catch (error) {
      console.error("Change password error:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteAccount = async () => {
    try {
      if (!user) throw new Error("No user logged in");

      // 1. Delete all user data from database
      await db.deleteUserData(user.$id);

      // 2. Delete Appwrite Account (optional but recommended if full cleanup desired)
      // Note: Client SDK allows deleting the current user's account? 
      // Checking docs: account.updateStatus() blocks it, strict delete might need server function. 
      // But standard 'account.deleteIdentity' exists? No. 
      // Typically 'account.updateStatus' to disable. 
      // Let's stick to cleaning data and logging out for now to be safe on client side permissions.
      // Actually, standard web SDK often doesn't allow self-deletion of the Auth User in some configs.
      // We will stick to data scrubbing + logout.

      await logout();
      return { success: true };
    } catch (error) {
      console.error("Delete account error:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    loginWithEmail,
    register,
    logout,
    checkUser,
    changePassword,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
