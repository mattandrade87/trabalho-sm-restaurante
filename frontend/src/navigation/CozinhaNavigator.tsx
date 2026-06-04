import React from "react";
import { Pressable, Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FilaCozinhaScreen from "../screens/cozinha/FilaCozinhaScreen";
import HistoricoCozinhaScreen from "../screens/cozinha/HistoricoCozinhaScreen";
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
        options={({ navigation }) => ({
          title: "Cozinha — Pedidos",
          headerLeft: () => (
            <Pressable onPress={() => navigation.navigate("HistoricoCozinha")} style={{ marginLeft: 14 }}>
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>Histórico</Text>
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="HistoricoCozinha"
        component={HistoricoCozinhaScreen}
        options={{ title: "Histórico de Pedidos" }}
      />
    </Stack.Navigator>
  );
}
