import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    nome: "CARFEX",
    perfil: "admin",
  });

  const [loading] = useState(false);

  function loginInterno() {
    const fakeUser = {
      nome: "CARFEX",
      perfil: "admin",
    };

    setUser(fakeUser);
    localStorage.setItem("carfex_user", JSON.stringify(fakeUser));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("carfex_user");
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      loginInterno,
      logout,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth precisa estar dentro de AuthProvider");
  }

  return context;
}