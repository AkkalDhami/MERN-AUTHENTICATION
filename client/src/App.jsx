import React from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ChangePassword from "./pages/auth/ChangePassword";
import Profile from "./pages/auth/ProfilePage";
import PublicRoute from "./routes/PublicRoutes";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import EmailVerify from "./pages/auth/EmailVerify";

const App = () => {


  const router = createBrowserRouter([
    {
      path: "/",
      element:  <Navigate to="/login" replace />,
      errorElement: <div>Page Not Found</div>,
    },
    {
      path: "/login",
      element: (
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      ),
    },
    {
      path: "/signup",
      element: (
        <PublicRoute>
          <SignupPage />
        </PublicRoute>
      ),
    },
    {
      path: "/forgot-password",
      element: (
        <PublicRoute>
          <ForgotPassword />
        </PublicRoute>
      ),
    },
    {
      path: "/email-verify",
      element: (
        <ProtectedRoutes>
          <EmailVerify />
        </ProtectedRoutes>
      ),
    },
    {
      path: "/change-password",
      element: (
        <ProtectedRoutes>
          <ChangePassword />
        </ProtectedRoutes>
      ),
    },
    {
      path: "/profile",
      element: (
        <ProtectedRoutes>
          <Profile />
        </ProtectedRoutes>
      ),
    },
    {
      path: "/reset-password/:token",
      element: (
        <PublicRoute>
          <ResetPassword />
        </PublicRoute>
      ),
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
