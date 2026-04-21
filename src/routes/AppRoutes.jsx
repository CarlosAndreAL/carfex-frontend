import {
  BrowserRouter,
  HashRouter,
  Route,
  Routes,
} from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Clientes from "../pages/Clientes";
import Veiculos from "../pages/Veiculos";
import Locacoes from "../pages/Locacoes";
import Multas from "../pages/Multas";

import ProtectedRoute from "./ProtectedRoute";

const RouterComponent =
  window.location.protocol === "file:" ? HashRouter : BrowserRouter;

export default function AppRoutes() {
  return (
    <RouterComponent>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/clientes"
          element={
            <ProtectedRoute>
              <Clientes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/veiculos"
          element={
            <ProtectedRoute>
              <Veiculos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/locacoes"
          element={
            <ProtectedRoute>
              <Locacoes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/multas"
          element={
            <ProtectedRoute>
              <Multas />
            </ProtectedRoute>
          }
        />
      </Routes>
    </RouterComponent>
  );
}