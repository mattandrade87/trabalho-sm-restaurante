import React, { useState } from "react";
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { cores } from "../theme";

export default function LoginScreen({ navigation }) {
  const { entrar } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function fazerLogin() {
    if (!email || !senha) {
      Alert.alert("Atenção", "Preencha email e senha.");
      return;
    }
    try {
      setCarregando(true);
      const usuario = await api.login(email.trim(), senha);
      await entrar(usuario);
    } catch (e) {
      Alert.alert("Erro ao entrar", e.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: cores.fundo }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.logo}>🍔</Text>
        <Text style={styles.titulo}>Lanchonete</Text>
        <Text style={styles.subtitulo}>Faça login para continuar</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <Pressable
          style={[styles.botao, carregando && { opacity: 0.7 }]}
          onPress={fazerLogin}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoTexto}>Entrar</Text>
          )}
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Registro")} style={{ marginTop: 18 }}>
          <Text style={styles.link}>
            Não tem conta? <Text style={{ fontWeight: "700" }}>Cadastre-se</Text>
          </Text>
        </Pressable>

        <View style={styles.dica}>
          <Text style={styles.dicaTitulo}>Contas de teste (senha: 123456)</Text>
          <Text style={styles.dicaTexto}>admin@lanche.com — Administrador</Text>
          <Text style={styles.dicaTexto}>cozinha@lanche.com — Cozinha</Text>
          <Text style={styles.dicaTexto}>cliente@lanche.com — Cliente</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 60, alignItems: "stretch" },
  logo: { fontSize: 64, textAlign: "center" },
  titulo: { fontSize: 28, fontWeight: "800", color: cores.primariaEscura, textAlign: "center" },
  subtitulo: { fontSize: 15, color: cores.textoClaro, textAlign: "center", marginBottom: 28 },
  input: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: cores.borda, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, marginBottom: 12, color: cores.texto,
  },
  botao: { backgroundColor: cores.primaria, borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 4 },
  botaoTexto: { color: "#fff", fontSize: 16, fontWeight: "700" },
  link: { textAlign: "center", color: cores.texto, fontSize: 15 },
  dica: { marginTop: 36, backgroundColor: "#fff", borderRadius: 10, padding: 14, borderWidth: 1, borderColor: cores.borda },
  dicaTitulo: { fontWeight: "700", color: cores.texto, marginBottom: 6 },
  dicaTexto: { color: cores.textoClaro, fontSize: 13, lineHeight: 20 },
});
