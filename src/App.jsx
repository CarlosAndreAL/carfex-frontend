import Investidores from "./pages/Investidores";
import InvestidorLogin from "./pages/InvestidorLogin";
import InvestidorDashboard from "./pages/InvestidorDashboard";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;