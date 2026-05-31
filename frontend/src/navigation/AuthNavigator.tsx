import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegistroScreen from "../screens/RegistroScreen";
import { cores } from "../theme";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: cores.primaria },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Entrar" }} />
      <Stack.Screen name="Registro" component={RegistroScreen} options={{ title: "Criar conta" }} />
    </Stack.Navigator>
  );
}
