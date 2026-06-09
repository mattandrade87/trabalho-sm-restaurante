import React, { useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../../api";
import { useAuth } from "../../AuthContext";
import { cores } from "../../theme";
import { formatarReal, formatarDataHora, formatarEntrega } from "../../utils";
import SeloStatus from "../../components/SeloStatus";

export default function HistoricoCozinhaScreen() {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [puxando, setPuxando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const lista = await api.historicoCozinha(usuario.token);
      setPedidos(lista);
    } catch (e) {
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

  function renderPedido({ item }) {
    return (
      <View style={styles.card}>
        <View style={styles.linhaTopo}>
          <Text style={styles.pedidoId}>Pedido #{item.id}</Text>
          <SeloStatus status={item.status} />
        </View>
        <Text style={styles.cliente}>
          {item.clienteNome} • {formatarDataHora(item.dataHora)}
        </Text>
        <Text style={styles.entrega}>{formatarEntrega(item)}</Text>
        {item.itens.map((it, idx) => (
          <Text key={idx} style={styles.item}>
            {it.quantidade}x {it.nomeProduto}
          </Text>
        ))}
        <Text style={styles.total}>Total: {formatarReal(item.total)}</Text>
      </View>
    );
  }

  if (carregando && pedidos.length === 0) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: cores.fundo }}
      data={pedidos}
      keyExtractor={(p) => String(p.id)}
      renderItem={renderPedido}
      contentContainerStyle={{ padding: 14 }}
      refreshing={puxando}
      onRefresh={puxar}
      ListEmptyComponent={<Text style={styles.vazio}>Nenhum pedido finalizado ainda.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: cores.fundo },
  vazio: { textAlign: "center", color: cores.textoClaro, marginTop: 40 },
  card: {
    backgroundColor: cores.cartao, borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: cores.borda,
  },
  linhaTopo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pedidoId: { fontSize: 16, fontWeight: "800", color: cores.texto },
  cliente: { color: cores.textoClaro, fontSize: 12, marginTop: 2 },
  entrega: { color: cores.primariaEscura, fontSize: 13, fontWeight: "700", marginTop: 2, marginBottom: 8 },
  item: { color: cores.texto, fontSize: 15, lineHeight: 22 },
  total: { marginTop: 8, fontSize: 16, fontWeight: "800", color: cores.primariaEscura },
});
