import {
  BrowserRouter,
  HashRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Clientes from "../pages/Clientes";
import Veiculos from "../pages/Veiculos";
import Locacoes from "../pages/Locacoes";
import Multas from "../pages/Multas";

import Investidores from "../pages/Investidores";
import InvestidorLogin from "../pages/InvestidorLogin";
import InvestidorDashboard from "../pages/InvestidorDashboard";

import ProtectedRoute from "./ProtectedRoute";
import ProtectedInvestidor from "./ProtectedInvestidor";

const RouterComponent =
  window.location.protocol === "file:" ? HashRouter : BrowserRouter;

export default function AppRoutes() {
  return (
    <RouterComponent>
      <Routes>

        {/* LOGIN PRINCIPAL */}
        <Route path="/" element={<Login />} />

        {/* INVESTIDOR */}
        <Route path="/investidores" element={<Investidores />} />
        <Route path="/investidor/login" element={<InvestidorLogin />} />

        <Route
          path="/investidor/dashboard"
          element={
            <ProtectedInvestidor>
              <InvestidorDashboard />
            </ProtectedInvestidor>
          }
        />

        {/* ADMIN */}
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