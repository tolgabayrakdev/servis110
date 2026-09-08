import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { AppLayout } from "./components/app-layout";
import { AuthGuard } from "./components/auth-guard";
import { AuthProvider } from "./contexts/auth-context";
import Customers from "./views/customers";
import Dashboard from "./views/dashboard";
import Login from "./views/login";
import Register from "./views/register";
import ServiceCard from "./views/service-card";
import VehicleDetail from "./views/vehicle-detail";
import Vehicles from "./views/vehicles";
import NotFound from "./views/not-found";
import SettingsView from "./views/settings";
import { ThemeProvider } from "./components/theme-provider";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/service-card/:token", element: <ServiceCard /> },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/customers", element: <Customers /> },
          { path: "/vehicles", element: <Vehicles /> },
          { path: "/vehicles/:id", element: <VehicleDetail /> },
          { path: "/settings", element: <SettingsView /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="servis110-theme">
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
