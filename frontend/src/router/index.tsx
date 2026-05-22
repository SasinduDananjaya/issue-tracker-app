import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import IssuesPage from "@/pages/IssuesPage";
import AppLayout from "@/layout/AppLayout";

const ProtectedRoute = () => {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const PublicRoute = () => {
  const user = useAuthStore((s) => s.user);
  if (user) return <Navigate to="/issues" replace />;
  return <Outlet />;
};

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [{ path: "/issues", element: <IssuesPage /> }],
      },
    ],
  },
  { path: "/", element: <Navigate to="/issues" replace /> },
  { path: "*", element: <Navigate to="/issues" replace /> },
]);
