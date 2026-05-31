import React from "react";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "./src/AuthContext";
import AuthNavigator from "./src/navigation/AuthNavigator";
import ClienteNavigator from "./src/navigation/ClienteNavigator";
import CozinhaNavigator from "./src/navigation/CozinhaNavigator";
import AdminNavigator from "./src/navigation/AdminNavigator";
import { cores } from "./src/theme";

function Raiz() {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: cores.fundo }}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  let conteudo;
  if (!usuario) {
    conteudo = <AuthNavigator />;
  } else if (usuario.perfil === "Cozinha") {
    conteudo = <CozinhaNavigator />;
  } else if (usuario.perfil === "Admin") {
    conteudo = <AdminNavigator />;
  } else {
    conteudo = <ClienteNavigator />;
  }

  return <NavigationContainer>{conteudo}</NavigationContainer>;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Raiz />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
