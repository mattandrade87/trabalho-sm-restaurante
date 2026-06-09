import React, { useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../../api";
import { useAuth } from "../../AuthContext";
import { cores, rotuloStatus } from "../../theme";
import { formatarReal, formatarDataHora } from "../../utils";
import SeloStatus from "../../components/SeloStatus";

export default function AdminVendasScreen() {
  const { usuario } = useAuth();
  const [dados, setDados] = useState({
    quantidadePedidos: 0,
    totalVendido: 0,
    porStatus: [],
    maisVendidos: [],
    pedidos: [],
  });
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
        {item.nota ? (
          <Text style={styles.aval}>
            {"★".repeat(item.nota)}{item.comentario ? " — " + item.comentario : ""}
          </Text>
        ) : null}
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
        <View>
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

          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Mais vendidos</Text>
            {dados.maisVendidos.length === 0 ? (
              <Text style={styles.vazioPeq}>Sem dados ainda.</Text>
            ) : (
              dados.maisVendidos.map((m, i) => (
                <View key={i} style={styles.linhaRank}>
                  <Text style={styles.rankPos}>{i + 1}º</Text>
                  <Text style={styles.rankNome}>{m.nome}</Text>
                  <Text style={styles.rankQtd}>{m.quantidade} un.</Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Pedidos por status</Text>
            <View style={styles.statusWrap}>
              {dados.porStatus.map((s, i) => (
                <View key={i} style={styles.statusChip}>
                  <Text style={styles.statusChipTexto}>
                    {(rotuloStatus[s.status] || s.status) + ": " + s.quantidade}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.tituloLista}>Últimos pedidos</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.vazio}>Nenhuma venda registrada ainda.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: cores.fundo },
  vazio: { textAlign: "center", color: cores.textoClaro, marginTop: 30 },
  vazioPeq: { color: cores.textoClaro, fontSize: 13 },
  resumo: { flexDirection: "row", gap: 10, marginBottom: 12 },
  resumoCard: { flex: 1, borderRadius: 12, padding: 16 },
  resumoLabel: { color: "#fff", fontSize: 13, opacity: 0.9 },
  resumoValor: { color: "#fff", fontSize: 22, fontWeight: "800", marginTop: 4 },
  secao: {
    backgroundColor: cores.cartao, borderRadius: 12, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: cores.borda,
  },
  secaoTitulo: { fontSize: 15, fontWeight: "800", color: cores.texto, marginBottom: 10 },
  linhaRank: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  rankPos: { width: 28, fontWeight: "800", color: cores.primaria },
  rankNome: { flex: 1, color: cores.texto },
  rankQtd: { color: cores.textoClaro, fontWeight: "700" },
  statusWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statusChip: {
    backgroundColor: cores.fundo, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: cores.borda,
  },
  statusChipTexto: { color: cores.texto, fontSize: 13, fontWeight: "600" },
  tituloLista: { fontSize: 15, fontWeight: "800", color: cores.texto, marginBottom: 8 },
  card: {
    backgroundColor: cores.cartao, borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: cores.borda,
  },
  linhaTopo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pedidoId: { fontSize: 15, fontWeight: "800", color: cores.texto, flex: 1, paddingRight: 8 },
  data: { color: cores.textoClaro, fontSize: 12, marginTop: 2 },
  total: { marginTop: 6, fontSize: 16, fontWeight: "800", color: cores.primariaEscura },
  aval: { marginTop: 4, color: cores.amarelo, fontWeight: "700", fontSize: 13 },
});
