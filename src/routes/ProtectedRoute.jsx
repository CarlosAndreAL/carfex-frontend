import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("carfex_user"));
  const investidorToken = localStorage.getItem("carfex_investidor_token");

  // 🚫 Investidor tentando acessar sistema interno
  if (investidorToken && !user) {
    return <Navigate to="/investidor/dashboard" replace />;
  }

  // 🚫 Não logado
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}