import React, { useState, useCallback } from "react";
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator, ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { cores } from "../theme";
import Avatar from "../components/Avatar";

export default function PerfilScreen() {
  const { usuario, atualizarUsuario } = useAuth();
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [foto, setFoto] = useState(null);

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [trocandoSenha, setTrocandoSenha] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const p = await api.meuPerfil(usuario.token);
      setNome(p.nome || "");
      setEmail(p.email || "");
      setTelefone(p.telefone || "");
      setFoto(p.foto || null);
    } catch (e) {
      Alert.alert("Erro", e.message);
    } finally {
      setCarregando(false);
    }
  }, [usuario.token]);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  async function escolherFoto() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert("Permissão necessária", "Precisamos de acesso às suas fotos para mudar a foto de perfil.");
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!resultado.canceled) {
      const asset = resultado.assets[0];
      const mime = asset.mimeType || "image/jpeg";
      setFoto("data:" + mime + ";base64," + asset.base64);
    }
  }

  async function salvar() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Informe seu nome.");
      return;
    }
    try {
      setSalvando(true);
      const p = await api.atualizarPerfil(usuario.token, {
        nome: nome.trim(),
        telefone: telefone.trim() || null,
        foto: foto,
      });
      await atualizarUsuario({ nome: p.nome, telefone: p.telefone, foto: p.foto });
      Alert.alert("Pronto!", "Perfil atualizado.");
    } catch (e) {
      Alert.alert("Erro ao salvar", e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function salvarSenha() {
    if (novaSenha.length < 4) {
      Alert.alert("Atenção", "A nova senha precisa ter pelo menos 4 caracteres.");
      return;
    }
    if (novaSenha !== confirmar) {
      Alert.alert("Atenção", "A confirmação não é igual à nova senha.");
      return;
    }
    try {
      setTrocandoSenha(true);
      await api.alterarSenha(usuario.token, senhaAtual, novaSenha);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmar("");
      Alert.alert("Pronto!", "Senha alterada com sucesso.");
    } catch (e) {
      Alert.alert("Erro", e.message);
    } finally {
      setTrocandoSenha(false);
    }
  }

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: cores.fundo }} contentContainerStyle={{ padding: 18 }}>
      <View style={styles.topo}>
        <Avatar foto={foto} nome={nome} tamanho={96} />
        <Pressable onPress={escolherFoto} style={styles.btnFoto}>
          <Text style={styles.btnFotoTexto}>Mudar foto</Text>
        </Pressable>
        <View style={styles.selo}>
          <Text style={styles.seloTexto}>{usuario.perfil}</Text>
        </View>
      </View>

      <Text style={styles.label}>Nome</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Seu nome" />

      <Text style={styles.label}>E-mail</Text>
      <TextInput style={[styles.input, styles.inputBloqueado]} value={email} editable={false} />

      <Text style={styles.label}>Telefone</Text>
      <TextInput
        style={styles.input}
        value={telefone}
        onChangeText={setTelefone}
        placeholder="(00) 00000-0000"
        keyboardType="phone-pad"
      />

      <Pressable style={[styles.btn, salvando && { opacity: 0.7 }]} onPress={salvar} disabled={salvando}>
        {salvando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTexto}>Salvar perfil</Text>}
      </Pressable>

      <View style={styles.divisor} />

      <Text style={styles.secaoTitulo}>Alterar senha</Text>
      <Text style={styles.label}>Senha atual</Text>
      <TextInput
        style={styles.input}
        value={senhaAtual}
        onChangeText={setSenhaAtual}
        placeholder="Senha atual"
        secureTextEntry
      />
      <Text style={styles.label}>Nova senha</Text>
      <TextInput
        style={styles.input}
        value={novaSenha}
        onChangeText={setNovaSenha}
        placeholder="Nova senha"
        secureTextEntry
      />
      <Text style={styles.label}>Confirmar nova senha</Text>
      <TextInput
        style={styles.input}
        value={confirmar}
        onChangeText={setConfirmar}
        placeholder="Repita a nova senha"
        secureTextEntry
      />
      <Pressable
        style={[styles.btnSecundario, trocandoSenha && { opacity: 0.7 }]}
        onPress={salvarSenha}
        disabled={trocandoSenha}
      >
        {trocandoSenha ? (
          <ActivityIndicator color={cores.primaria} />
        ) : (
          <Text style={styles.btnSecundarioTexto}>Alterar senha</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: cores.fundo },
  topo: { alignItems: "center", marginBottom: 10 },
  btnFoto: { marginTop: 10, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: cores.primaria },
  btnFotoTexto: { color: cores.primaria, fontWeight: "700" },
  selo: { marginTop: 10, backgroundColor: cores.primaria, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 14 },
  seloTexto: { color: "#fff", fontWeight: "700", fontSize: 13 },
  label: { fontSize: 14, fontWeight: "700", color: cores.texto, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: cores.borda, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: cores.texto,
  },
  inputBloqueado: { backgroundColor: cores.fundo, color: cores.textoClaro },
  btn: { backgroundColor: cores.primaria, borderRadius: 10, paddingVertical: 15, alignItems: "center", marginTop: 22 },
  btnTexto: { color: "#fff", fontWeight: "700", fontSize: 16 },
  divisor: { height: 1, backgroundColor: cores.borda, marginVertical: 24 },
  secaoTitulo: { fontSize: 17, fontWeight: "800", color: cores.texto },
  btnSecundario: {
    borderWidth: 1, borderColor: cores.primaria, borderRadius: 10, paddingVertical: 14,
    alignItems: "center", marginTop: 22,
  },
  btnSecundarioTexto: { color: cores.primaria, fontWeight: "700", fontSize: 16 },
});
