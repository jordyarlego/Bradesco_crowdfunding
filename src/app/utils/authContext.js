"use client";

import { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Começa como true
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    // Verificar token no localStorage/sessionStorage ao inicializar
    const storedToken = localStorage.getItem("token");
    const storedUsuario = localStorage.getItem("usuario");

    if (storedToken && storedUsuario) {
      try {
        setToken(storedToken);
        setUsuario(JSON.parse(storedUsuario));
        setAutenticado(true);
      } catch (error) {
        console.error("Erro ao recuperar dados de autenticação:", error);
        logout();
      }
    }
    
    setLoading(false); // IMPORTANTE: Marcar que terminou de verificar
  }, []);

  const login = (data) => {
    try {
      const { token, usuario } = data;
      
      // Salvar no state
      setToken(token);
      setUsuario(usuario);
      setAutenticado(true);
      
      // Salvar no localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));
      
      return true;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    setAutenticado(false);
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        autenticado,
        loading, // Exportar loading
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};