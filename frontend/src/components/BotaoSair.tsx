import React from "react";
import { Pressable, Text } from "react-native";
import { useAuth } from "../AuthContext";

export default function BotaoSair() {
  const { sair } = useAuth();
  return (
    <Pressable onPress={sair} style={{ marginRight: 14 }}>
      <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>Sair</Text>
    </Pressable>
  );
}
