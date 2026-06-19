import React from "react";
import { Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FilaCozinhaScreen from "../screens/cozinha/FilaCozinhaScreen";
import HistoricoCozinhaScreen from "../screens/cozinha/HistoricoCozinhaScreen";
import PerfilScreen from "../screens/PerfilScreen";
import BotaoSair from "../components/BotaoSair";
import { cores } from "../theme";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CozinhaTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: cores.primaria },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
        headerRight: () => <BotaoSair />,
        tabBarActiveTintColor: cores.primaria,
      }}
    >
      <Tab.Screen
        name="FilaCozinha"
        component={FilaCozinhaScreen}
        options={{
          title: "Cozinha — Pedidos",
          tabBarLabel: "Pedidos",
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🍳</Text>,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          title: "Perfil",
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function CozinhaNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CozinhaTabs" component={CozinhaTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="HistoricoCozinha"
        component={HistoricoCozinhaScreen}
        options={{
          headerStyle: { backgroundColor: cores.primaria },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
          title: "Histórico de Pedidos",
        }}
      />
    </Stack.Navigator>
  );
}
