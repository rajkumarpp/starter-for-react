import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { loginWithEmail, register, user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in (only after loading completes)
  if (!loading && user) {
    navigate("/home");
    return null;
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const result = isLogin
        ? await loginWithEmail(email, password)
        : await register(email, password, name);

      if (result.success) {
        navigate("/home");
      } else {
        setError(result.error || "Authentication failed");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img
                src="/appwrite.svg"
                alt="Appwrite"
                className="w-16 h-16"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-gray-600">
              {isLogin
                ? "Sign in to continue to your account"
                : "Sign up to get started"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {!isLogin && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition bg-white text-gray-900"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition bg-white text-gray-900"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition bg-white text-gray-900"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? "Processing..."
                : isLogin
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>



          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-pink-500 hover:text-pink-600:text-pink-300 font-medium text-sm"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Powered by{" "}
          <a
            href="https://appwrite.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-500 hover:text-pink-600:text-pink-300"
          >
            Appwrite Cloud
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
