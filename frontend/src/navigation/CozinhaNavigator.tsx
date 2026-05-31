import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FilaCozinhaScreen from "../screens/cozinha/FilaCozinhaScreen";
import BotaoSair from "../components/BotaoSair";
import { cores } from "../theme";

const Stack = createNativeStackNavigator();

export default function CozinhaNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: cores.primaria },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
        headerRight: () => <BotaoSair />,
      }}
    >
      <Stack.Screen
        name="FilaCozinha"
        component={FilaCozinhaScreen}
        options={{ title: "Cozinha — Pedidos" }}
      />
    </Stack.Navigator>
  );
}
