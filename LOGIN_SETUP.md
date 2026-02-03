# Appwrite React Login Implementation

This project implements a complete authentication system using Appwrite Cloud with support for:
- **Email/Password authentication**
- **GitHub OAuth authentication**

## Features

### 🔐 Authentication Methods
1. **Email & Password Login**
   - User registration with name, email, and password
   - Email/password login
   - Password validation (minimum 8 characters)

2. **GitHub OAuth**
   - One-click GitHub authentication
   - Seamless OAuth flow with callback handling

### 📱 Pages & Routes
- `/login` - Login/Register page
- `/home` - Protected home page (requires authentication)
- `/callback` - OAuth callback handler
- `/` - Redirects to login

### 🎨 UI Features
- Modern, responsive design with Tailwind CSS
- Beautiful gradient backgrounds
- Loading states and error handling
- Toggle between login and registration
- User profile display on home page

## Project Structure

```
src/
├── contexts/
│   └── AuthContext.jsx       # Authentication state management
├── pages/
│   ├── Login.jsx             # Login/Register page
│   ├── Home.jsx              # Protected home page
│   └── Callback.jsx          # OAuth callback handler
├── lib/
│   └── appwrite.js           # Appwrite client configuration
├── App.jsx                   # Router configuration
└── main.jsx                  # App entry point
```

## Setup Instructions

### 1. Environment Variables
Ensure your `.env` file has the correct Appwrite configuration:

```env
VITE_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=698163a6002fd5de9211
VITE_APPWRITE_PROJECT_NAME=The Royal Ledger
```

### 2. Appwrite Console Setup

#### GitHub OAuth Configuration
1. Go to your Appwrite Console
2. Navigate to **Auth** → **Settings** → **OAuth2 Providers**
3. Enable GitHub OAuth
4. Configure the following URLs:
   - **Success URL**: `http://localhost:5173/home`
   - **Failure URL**: `http://localhost:5173/login`

#### GitHub App Configuration
1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Create a new OAuth App with:
   - **Homepage URL**: `http://localhost:5173/login`
   - **Authorization callback URL**: `http://localhost:5173/home`
   - Copy the Client ID and Client Secret to Appwrite Console

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## How It Works

### Authentication Flow

#### Email/Password Login
1. User enters email and password on `/login` page
2. `AuthContext.loginWithEmail()` calls Appwrite's `createEmailPasswordSession()`
3. On success, user is redirected to `/home`
4. User state is stored in React Context

#### GitHub OAuth Flow
1. User clicks "Continue with GitHub" button
2. `AuthContext.loginWithGithub()` calls Appwrite's `createOAuth2Session()`
3. User is redirected to GitHub for authentication
4. GitHub redirects to Appwrite's callback URL
5. Appwrite processes the OAuth and redirects to `/home`
6. `AuthContext.checkUser()` verifies the session
7. User is authenticated and can access protected routes

#### Registration
1. User toggles to registration mode
2. Enters name, email, and password
3. `AuthContext.register()` creates account with Appwrite
4. Automatically logs in the user
5. Redirects to `/home`

### Protected Routes
- The `/home` route checks for authentication in the component
- Unauthenticated users are redirected to `/login`
- `AuthContext` provides user state globally

### Session Management
- Sessions are managed by Appwrite
- `checkUser()` verifies current session on app load
- `logout()` deletes the current session

## Key Components

### AuthContext
Manages authentication state and provides methods:
- `user` - Current user object (null if not authenticated)
- `loading` - Loading state during auth checks
- `loginWithEmail(email, password)` - Email/password login
- `loginWithGithub()` - GitHub OAuth login
- `register(email, password, name)` - User registration
- `logout()` - Sign out current user
- `checkUser()` - Verify current session

### Login Page
- Responsive form with validation
- Toggle between login/register modes
- Error message display
- GitHub OAuth button
- Auto-redirects if already authenticated

### Home Page
- Displays user information
- Account details (ID, email, verification status)
- Logout functionality
- Protected route - redirects to login if not authenticated

### Callback Page
- Handles OAuth redirects
- Verifies authentication after OAuth flow
- Shows loading state
- Redirects to home on success, login on failure

## Technologies Used

- **React 19** - UI framework
- **React Router DOM** - Client-side routing
- **Appwrite** - Backend as a Service (Authentication, Database)
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## Security Notes

- Passwords must be at least 8 characters
- Sessions are handled securely by Appwrite
- OAuth tokens are managed by Appwrite Cloud
- All authentication requests use HTTPS

## Troubleshooting

### GitHub OAuth not working
- Verify GitHub OAuth app configuration matches Appwrite settings
- Check that callback URLs are correctly set
- Ensure Appwrite project ID is correct

### User not redirecting after login
- Check browser console for errors
- Verify Appwrite endpoint and project ID
- Ensure `.env` file is properly loaded

### Session not persisting
- Check browser cookies are enabled
- Verify Appwrite session configuration
- Clear browser cache and try again

## Next Steps

- Add email verification
- Implement password reset
- Add more OAuth providers (Google, Facebook, etc.)
- Implement user profile editing
- Add protected API routes
- Implement role-based access control

## License

MIT
