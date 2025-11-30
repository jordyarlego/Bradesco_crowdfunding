// authContext.js - Adicionar suporte a cookies
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [autenticado, setAutenticado] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("authToken");
      const userData = localStorage.getItem("userData");

      console.log("AuthProvider - Carregando usuário:", { token, userData });

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUsuario(parsedUser);
          setAutenticado(true);
          console.log("AuthProvider - Usuário carregado:", parsedUser);
        } catch (error) {
          console.error("Erro ao parsear userData:", error);
          logout();
        }
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  const login = ({ usuario, token }) => {
    console.log("AuthContext - Login:", { usuario, token });

    if (!usuario || !token) {
      console.error("Dados inválidos no login");
      return { success: false };
    }

    localStorage.setItem("authToken", token);
    localStorage.setItem("userData", JSON.stringify(usuario));

    setUsuario(usuario);
    setAutenticado(true);

    console.log("AuthContext - Login realizado com sucesso");
    return { success: true };
  };

  const logout = () => {
    console.log("AuthContext - Logout");

    // Limpar localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");

    // 🔥 LIMPAR COOKIES
    removeCookie("authToken");
    removeCookie("userData");

    setUsuario(null);
    setAutenticado(false);
    router.push("/entrar");
  };

  const isInvestor = () => {
    return usuario?.role === "investidor";
  };

  const isBorrower = () => {
    return usuario?.role === "tomador";
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        autenticado,
        loading,
        login,
        logout,
        isInvestor,
        isBorrower,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
