import React from "react";
import { Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AdminProdutosScreen from "../screens/admin/AdminProdutosScreen";
import AdminVendasScreen from "../screens/admin/AdminVendasScreen";
import ProdutoFormScreen from "../screens/admin/ProdutoFormScreen";
import ClientesScreen from "../screens/admin/ClientesScreen";
import ClienteDetalheScreen from "../screens/admin/ClienteDetalheScreen";
import PerfilScreen from "../screens/PerfilScreen";
import BotaoSair from "../components/BotaoSair";
import { cores } from "../theme";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AdminTabs() {
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
        name="AdminProdutos"
        component={AdminProdutosScreen}
        options={{
          title: "Produtos",
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="AdminVendas"
        component={AdminVendasScreen}
        options={{
          title: "Vendas",
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>💰</Text>,
        }}
      />
      <Tab.Screen
        name="AdminClientes"
        component={ClientesScreen}
        options={{
          title: "Clientes",
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>👥</Text>,
        }}
      />
      <Tab.Screen
        name="AdminPerfil"
        component={PerfilScreen}
        options={{
          title: "Perfil",
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AdminTabs" component={AdminTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="ProdutoForm"
        component={ProdutoFormScreen}
        options={{
          headerStyle: { backgroundColor: cores.primaria },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
          title: "Produto",
        }}
      />
      <Stack.Screen
        name="ClienteDetalhe"
        component={ClienteDetalheScreen}
        options={{
          headerStyle: { backgroundColor: cores.primaria },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
          title: "Cliente",
        }}
      />
    </Stack.Navigator>
  );
}
