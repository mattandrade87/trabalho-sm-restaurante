import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, Pressable, StyleSheet, Alert, ActivityIndicator, TextInput,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../../api";
import { useAuth } from "../../AuthContext";
import { cores } from "../../theme";
import { formatarReal } from "../../utils";

export default function CardapioScreen({ navigation }) {
  const { usuario } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState({});
  const [observacao, setObservacao] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const lista = await api.listarCardapio(usuario.token);
      setProdutos(lista);
    } catch (e) {
      Alert.alert("Erro", e.message);
    } finally {
      setCarregando(false);
    }
  }, [usuario.token]);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  function alterarQtd(id, delta) {
    setCarrinho((prev) => {
      const nova = Math.max(0, (prev[id] || 0) + delta);
      const novo = { ...prev };
      if (nova === 0) delete novo[id];
      else novo[id] = nova;
      return novo;
    });
  }

  const total = produtos.reduce((s, p) => s + (carrinho[p.id] || 0) * p.preco, 0);
  const qtdTotal = Object.values(carrinho).reduce((a, b) => a + b, 0);

  async function finalizar() {
    const itens = Object.keys(carrinho).map((id) => ({
      produtoId: Number(id),
      quantidade: carrinho[id],
    }));
    if (itens.length === 0) {
      Alert.alert("Carrinho vazio", "Adicione itens ao pedido.");
      return;
    }
    try {
      setEnviando(true);
      await api.criarPedido(usuario.token, itens, observacao.trim() || null);
      setCarrinho({});
      setObservacao("");
      Alert.alert("Pedido enviado! 🎉", 'Acompanhe em "Meus Pedidos".');
      navigation.navigate("MeusPedidos");
    } catch (e) {
      Alert.alert("Erro ao enviar pedido", e.message);
    } finally {
      setEnviando(false);
    }
  }

  function renderProduto({ item }) {
    const qtd = carrinho[item.id] || 0;
    return (
      <View style={styles.card}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.nome}>{item.nome}</Text>
          {!!item.descricao && <Text style={styles.descricao}>{item.descricao}</Text>}
          <Text style={styles.preco}>{formatarReal(item.preco)}</Text>
        </View>
        <View style={styles.stepper}>
          <Pressable
            style={[styles.btnQtd, qtd === 0 && { opacity: 0.4 }]}
            onPress={() => alterarQtd(item.id, -1)}
            disabled={qtd === 0}
          >
            <Text style={styles.btnQtdTexto}>−</Text>
          </Pressable>
          <Text style={styles.qtd}>{qtd}</Text>
          <Pressable style={styles.btnQtd} onPress={() => alterarQtd(item.id, 1)}>
            <Text style={styles.btnQtdTexto}>+</Text>
          </Pressable>
        </View>
      </View>
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
      <FlatList
        data={produtos}
        keyExtractor={(p) => String(p.id)}
        renderItem={renderProduto}
        contentContainerStyle={{ padding: 14, paddingBottom: 20 }}
        refreshing={carregando}
        onRefresh={carregar}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum produto disponível.</Text>}
        ListHeaderComponent={
          <TextInput
            style={styles.obs}
            placeholder="Observação (opcional). Ex: sem cebola"
            value={observacao}
            onChangeText={setObservacao}
          />
        }
      />

      <View style={styles.rodape}>
        <View>
          <Text style={styles.rodapeLabel}>{qtdTotal} item(ns)</Text>
          <Text style={styles.rodapeTotal}>{formatarReal(total)}</Text>
        </View>
        <Pressable
          style={[styles.btnFinalizar, (qtdTotal === 0 || enviando) && { opacity: 0.5 }]}
          onPress={finalizar}
          disabled={qtdTotal === 0 || enviando}
        >
          {enviando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnFinalizarTexto}>Finalizar pedido</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: cores.fundo },
  vazio: { textAlign: "center", color: cores.textoClaro, marginTop: 40 },
  obs: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: cores.borda, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, color: cores.texto,
  },
  card: {
    backgroundColor: cores.cartao, borderRadius: 12, padding: 14, marginBottom: 10,
    flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: cores.borda,
  },
  nome: { fontSize: 16, fontWeight: "700", color: cores.texto },
  descricao: { fontSize: 13, color: cores.textoClaro, marginTop: 2 },
  preco: { fontSize: 15, fontWeight: "700", color: cores.primariaEscura, marginTop: 6 },
  stepper: { flexDirection: "row", alignItems: "center" },
  btnQtd: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: cores.primaria,
    justifyContent: "center", alignItems: "center",
  },
  btnQtdTexto: { color: "#fff", fontSize: 20, fontWeight: "800", lineHeight: 22 },
  qtd: { minWidth: 28, textAlign: "center", fontSize: 16, fontWeight: "700", color: cores.texto },
  rodape: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#fff", padding: 14, borderTopWidth: 1, borderTopColor: cores.borda,
  },
  rodapeLabel: { color: cores.textoClaro, fontSize: 13 },
  rodapeTotal: { color: cores.texto, fontSize: 20, fontWeight: "800" },
  btnFinalizar: {
    backgroundColor: cores.verde, paddingHorizontal: 20, paddingVertical: 14,
    borderRadius: 10, minWidth: 160, alignItems: "center",
  },
  btnFinalizarTexto: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
