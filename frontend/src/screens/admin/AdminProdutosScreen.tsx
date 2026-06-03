import React, { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../../api";
import { useAuth } from "../../AuthContext";
import { cores } from "../../theme";
import { formatarReal } from "../../utils";

export default function AdminProdutosScreen({ navigation }) {
  const { usuario } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [puxando, setPuxando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const lista = await api.listarProdutosAdmin(usuario.token);
      setProdutos(lista);
    } catch (e) {
      Alert.alert("Erro", e.message);
    } finally {
      setCarregando(false);
    }
  }, [usuario.token]);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  async function puxar() {
    setPuxando(true);
    await carregar();
    setPuxando(false);
  }

  function confirmarExcluir(produto) {
    Alert.alert("Excluir produto", 'Excluir "' + produto.nome + '"?', [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await api.excluirProduto(usuario.token, produto.id);
            carregar();
          } catch (e) {
            Alert.alert("Não foi possível excluir", e.message);
          }
        },
      },
    ]);
  }

  function renderProduto({ item }) {
    return (
      <Pressable style={styles.card} onPress={() => navigation.navigate("ProdutoForm", { produto: item })}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.nome}>{item.nome}</Text>
          <Text style={styles.cat}>
            {item.categoria} • {formatarReal(item.preco)}
          </Text>
          {!item.disponivel && <Text style={styles.indisponivel}>Indisponível</Text>}
        </View>
        <Pressable hitSlop={8} onPress={() => confirmarExcluir(item)} style={styles.btnExcluir}>
          <Text style={{ color: cores.vermelho, fontWeight: "700" }}>Excluir</Text>
        </Pressable>
      </Pressable>
    );
  }

  if (carregando && produtos.length === 0) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: cores.fundo }}>
      <Pressable style={styles.btnNovo} onPress={() => navigation.navigate("ProdutoForm")}>
        <Text style={styles.btnNovoTexto}>+ Novo produto</Text>
      </Pressable>
      <FlatList
        data={produtos}
        keyExtractor={(p) => String(p.id)}
        renderItem={renderProduto}
        contentContainerStyle={{ padding: 14, paddingTop: 4 }}
        refreshing={puxando}
        onRefresh={puxar}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum produto cadastrado.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: cores.fundo },
  vazio: { textAlign: "center", color: cores.textoClaro, marginTop: 40 },
  btnNovo: { backgroundColor: cores.primaria, margin: 14, marginBottom: 4, borderRadius: 10, paddingVertical: 13, alignItems: "center" },
  btnNovoTexto: { color: "#fff", fontWeight: "700", fontSize: 15 },
  card: {
    backgroundColor: cores.cartao, borderRadius: 12, padding: 14, marginBottom: 10,
    flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: cores.borda,
  },
  nome: { fontSize: 16, fontWeight: "700", color: cores.texto },
  cat: { fontSize: 13, color: cores.textoClaro, marginTop: 3 },
  indisponivel: { fontSize: 12, color: cores.vermelho, fontWeight: "700", marginTop: 4 },
  btnExcluir: { paddingHorizontal: 10, paddingVertical: 6 },
});
