import React, { useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../../api";
import { useAuth } from "../../AuthContext";
import { cores } from "../../theme";
import { formatarReal, formatarDataHora } from "../../utils";
import SeloStatus from "../../components/SeloStatus";

export default function AdminVendasScreen() {
  const { usuario } = useAuth();
  const [dados, setDados] = useState({ quantidadePedidos: 0, totalVendido: 0, pedidos: [] });
  const [carregando, setCarregando] = useState(true);
  const [puxando, setPuxando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const r = await api.vendas(usuario.token);
      setDados(r);
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
          <Text style={styles.pedidoId}>Pedido #{item.id} — {item.clienteNome}</Text>
          <SeloStatus status={item.status} />
        </View>
        <Text style={styles.data}>{formatarDataHora(item.dataHora)}</Text>
        <Text style={styles.total}>{formatarReal(item.total)}</Text>
      </View>
    );
  }

  if (carregando && dados.pedidos.length === 0) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: cores.fundo }}
      data={dados.pedidos}
      keyExtractor={(p) => String(p.id)}
      renderItem={renderPedido}
      contentContainerStyle={{ padding: 14 }}
      refreshing={puxando}
      onRefresh={puxar}
      ListHeaderComponent={
        <View style={styles.resumo}>
          <View style={[styles.resumoCard, { backgroundColor: cores.verde }]}>
            <Text style={styles.resumoLabel}>Total vendido</Text>
            <Text style={styles.resumoValor}>{formatarReal(dados.totalVendido)}</Text>
          </View>
          <View style={[styles.resumoCard, { backgroundColor: cores.azul }]}>
            <Text style={styles.resumoLabel}>Pedidos</Text>
            <Text style={styles.resumoValor}>{dados.quantidadePedidos}</Text>
          </View>
        </View>
      }
      ListEmptyComponent={<Text style={styles.vazio}>Nenhuma venda registrada ainda.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: cores.fundo },
  vazio: { textAlign: "center", color: cores.textoClaro, marginTop: 30 },
  resumo: { flexDirection: "row", gap: 10, marginBottom: 14 },
  resumoCard: { flex: 1, borderRadius: 12, padding: 16 },
  resumoLabel: { color: "#fff", fontSize: 13, opacity: 0.9 },
  resumoValor: { color: "#fff", fontSize: 22, fontWeight: "800", marginTop: 4 },
  card: {
    backgroundColor: cores.cartao, borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: cores.borda,
  },
  linhaTopo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pedidoId: { fontSize: 15, fontWeight: "800", color: cores.texto, flex: 1, paddingRight: 8 },
  data: { color: cores.textoClaro, fontSize: 12, marginTop: 2 },
  total: { marginTop: 6, fontSize: 16, fontWeight: "800", color: cores.primariaEscura },
});
