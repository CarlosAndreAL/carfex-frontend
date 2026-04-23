import { Navigate } from "react-router-dom";

export default function ProtectedInvestidor({ children }) {
  const token = localStorage.getItem("carfex_investidor_token");
  const investidor = localStorage.getItem("carfex_investidor");

  if (!token || !investidor) {
    return <Navigate to="/investidor/login" replace />;
  }

  return children;
}