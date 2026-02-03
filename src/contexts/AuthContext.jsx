import { createContext, useContext, useState, useEffect } from "react";
import { account } from "../lib/appwrite";
import { ID } from "appwrite";

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

  const checkUser = async () => {
    setLoading(true);
    try {
      console.log("AuthContext: Checking user session");
      const currentUser = await account.get();
      console.log("AuthContext: User found:", currentUser);
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
      await checkUser();
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, name) => {
    try {
      await account.create(ID.unique(), email, password, name);
      await loginWithEmail(email, password);
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
