import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarSalvo() {
      try {
        const salvo = await AsyncStorage.getItem("usuario");
        if (salvo) setUsuario(JSON.parse(salvo));
      } catch (e) {}
      setCarregando(false);
    }
    carregarSalvo();
  }, []);

  async function entrar(dadosUsuario) {
    setUsuario(dadosUsuario);
    await AsyncStorage.setItem("usuario", JSON.stringify(dadosUsuario));
  }

  async function sair() {
    setUsuario(null);
    await AsyncStorage.removeItem("usuario");
  }

  async function atualizarUsuario(parciais) {
    const novo = { ...usuario, ...parciais };
    setUsuario(novo);
    await AsyncStorage.setItem("usuario", JSON.stringify(novo));
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, entrar, sair, atualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
