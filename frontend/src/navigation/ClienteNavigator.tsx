import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CardapioScreen from "../screens/cliente/CardapioScreen";
import MeusPedidosScreen from "../screens/cliente/MeusPedidosScreen";
import PerfilScreen from "../screens/PerfilScreen";
import BotaoSair from "../components/BotaoSair";
import { cores } from "../theme";

const Tab = createBottomTabNavigator();

export default function ClienteNavigator() {
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
        name="Cardapio"
        component={CardapioScreen}
        options={{
          title: "Cardápio",
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🍔</Text>,
        }}
      />
      <Tab.Screen
        name="MeusPedidos"
        component={MeusPedidosScreen}
        options={{
          title: "Meus Pedidos",
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🧾</Text>,
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
