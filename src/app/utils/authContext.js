"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const router = useRouter();

  const [usuario, setUsuario] = useState(null);
  const [autenticado, setAutenticado] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * Carrega sessão salva no localStorage
   */
  useEffect(() => {
    const storedUser = authService.getUser();
    const token = authService.getAuthToken();

    console.log("🔄 AuthProvider -> carregando sessão:", {
      token,
      storedUser,
    });

    if (token && storedUser) {
      setUsuario(storedUser);
      setAutenticado(true);
    }

    setLoading(false);
  }, []);

  /**
   * LOGIN — NÃO chama a API novamente!
   * Apenas usa o resultado já retornado pelo authService.login()
   */
  const login = async (credentials) => {
    try {
      // 🔥 Aqui é a ÚNICA chamada ao backend
      const resp = await authService.login(credentials);

      // resp = { usuario, token } — já salvo pelo authService
      setUsuario(resp.usuario);
      setAutenticado(true);

      console.log("✅ AuthContext: Login finalizado");

      return { success: true };
    } catch (error) {
      console.error("❌ AuthContext: Erro no login:", error);
      return { success: false, message: error.message };
    }
  };

  /**
   * LOGOUT
   */
  const logout = async () => {
    console.log("🚪 AuthContext: Logout solicitado");

    await authService.completeLogout();

    setUsuario(null);
    setAutenticado(false);

    router.push("/");
  };

  /**
   * Atualiza o usuário após edição de perfil
   */
  const refreshUser = () => {
    const freshUser = authService.getUserData();

    if (freshUser) {
      setUsuario(freshUser);
      setAutenticado(true);
    } else {
      setUsuario(null);
      setAutenticado(false);
    }
  };

  const isInvestor = () => usuario?.role === "investidor";
  const isBorrower = () => usuario?.role === "tomador";

  return (
    <AuthContext.Provider
      value={{
        usuario,
        autenticado,
        loading,
        login,
        logout,
        refreshUser,
        isInvestor,
        isBorrower,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
