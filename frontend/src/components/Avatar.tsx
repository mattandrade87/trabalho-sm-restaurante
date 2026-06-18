import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { cores } from "../theme";

export default function Avatar({ foto, nome, tamanho = 64 }) {
  const inicial = (nome || "?").trim().charAt(0).toUpperCase();
  const formato = { width: tamanho, height: tamanho, borderRadius: tamanho / 2 };

  if (foto) {
    return <Image source={{ uri: foto }} style={[formato, styles.img]} resizeMode="cover" />;
  }

  return (
    <View style={[formato, styles.placeholder]}>
      <Text style={[styles.inicial, { fontSize: tamanho * 0.4 }]}>{inicial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  img: { backgroundColor: cores.borda },
  placeholder: { backgroundColor: cores.primaria, justifyContent: "center", alignItems: "center" },
  inicial: { color: "#fff", fontWeight: "800" },
});
