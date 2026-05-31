import React, { useState } from "react";
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { cores } from "../theme";

export default function RegistroScreen() {
  const { entrar } = useAuth();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function cadastrar() {
    if (!nome || !email || !senha) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }
    if (senha.length < 4) {
      Alert.alert("Atenção", "A senha deve ter pelo menos 4 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      Alert.alert("Atenção", "As senhas não conferem.");
      return;
    }
    try {
      setCarregando(true);
      const usuario = await api.registrar(nome.trim(), email.trim(), senha);
      await entrar(usuario);
    } catch (e) {
      Alert.alert("Erro ao cadastrar", e.message);
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
        <Text style={styles.titulo}>Criar conta</Text>
        <Text style={styles.subtitulo}>Você entrará como Cliente</Text>

        <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} />
        <TextInput
          style={styles.input} placeholder="Email" autoCapitalize="none"
          keyboardType="email-address" value={email} onChangeText={setEmail}
        />
        <TextInput style={styles.input} placeholder="Senha" secureTextEntry value={senha} onChangeText={setSenha} />
        <TextInput
          style={styles.input} placeholder="Confirmar senha" secureTextEntry
          value={confirmar} onChangeText={setConfirmar}
        />

        <Pressable
          style={[styles.botao, carregando && { opacity: 0.7 }]}
          onPress={cadastrar}
          disabled={carregando}
        >
          {carregando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoTexto}>Cadastrar</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 40 },
  titulo: { fontSize: 26, fontWeight: "800", color: cores.primariaEscura, textAlign: "center" },
  subtitulo: { fontSize: 15, color: cores.textoClaro, textAlign: "center", marginBottom: 24 },
  input: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: cores.borda, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, marginBottom: 12, color: cores.texto,
  },
  botao: { backgroundColor: cores.primaria, borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 4 },
  botaoTexto: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
