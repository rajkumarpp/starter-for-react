# Quick Start Guide

## 🚀 Running the App

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser:**
   Navigate to `http://localhost:5173`

3. **You'll see the login page with two options:**
   - Sign in with Email/Password
   - Sign in with GitHub

## 🔑 Testing Authentication

### Option 1: Email/Password
1. Click "Don't have an account? Sign up"
2. Enter:
   - Full Name (e.g., "John Doe")
   - Email (e.g., "john@example.com")
   - Password (min. 8 characters)
3. Click "Create Account"
4. You'll be redirected to the home page

### Option 2: GitHub OAuth
1. Click the "GitHub" button
2. Authorize the app on GitHub
3. You'll be redirected back to the home page

## 📋 What You'll See on Home Page

- Your profile information
- User ID
- Email address
- Email verification status
- Account creation date
- Logout button

## 🔧 Current Configuration

Your Appwrite project is already configured:
- **Endpoint:** https://sgp.cloud.appwrite.io/v1
- **Project ID:** 698163a6002fd5de9211
- **Project Name:** The Royal Ledger

GitHub OAuth is configured with:
- **Homepage URL:** http://localhost:5173/login
- **Callback URL:** http://localhost:5173/home

## 📁 Files Created

- `src/contexts/AuthContext.jsx` - Authentication logic
- `src/pages/Login.jsx` - Login/Register page
- `src/pages/Home.jsx` - Protected home page
- `src/pages/Callback.jsx` - OAuth callback handler
- `src/App.jsx` - Updated with routing

## ⚙️ Features Implemented

✅ Email/Password registration
✅ Email/Password login
✅ GitHub OAuth login
✅ Session management
✅ Protected routes
✅ Auto-redirect based on auth state
✅ User profile display
✅ Logout functionality
✅ Error handling
✅ Loading states
✅ Responsive design

## 🎯 Next Steps

You can now:
- Test the authentication flows
- Customize the UI/UX
- Add more features to the Home page
- Implement additional OAuth providers
- Add email verification
- Create more protected routes

For detailed information, see `LOGIN_SETUP.md`
