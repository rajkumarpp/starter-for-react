// Example of using AuthContext in any component

import { useAuth } from "../contexts/AuthContext";

function ExampleProtectedComponent() {
  const { user, loading, logout } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  // Show login prompt if not authenticated
  if (!user) {
    return <div>Please log in to view this content</div>;
  }

  // Show protected content for authenticated users
  return (
    <div>
      <h2>Protected Content</h2>
      <p>Welcome, {user.name}!</p>
      <p>Your email: {user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default ExampleProtectedComponent;
