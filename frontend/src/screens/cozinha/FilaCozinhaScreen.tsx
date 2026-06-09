import React, { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../../api";
import { useAuth } from "../../AuthContext";
import { cores } from "../../theme";
import { formatarDataHora, formatarEntrega } from "../../utils";
import SeloStatus from "../../components/SeloStatus";

function proximaAcao(status) {
  if (status === "Recebido") return { label: "Iniciar preparo", novo: "EmPreparo", cor: cores.amarelo };
  if (status === "EmPreparo") return { label: "Marcar pronto", novo: "Pronto", cor: cores.verde };
  if (status === "Pronto") return { label: "Marcar entregue", novo: "Entregue", cor: cores.azul };
  return null;
}

export default function FilaCozinhaScreen() {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [puxando, setPuxando] = useState(false);
  const [atualizandoId, setAtualizandoId] = useState(null);

  const carregar = useCallback(async () => {
    try {
      const lista = await api.filaCozinha(usuario.token);
      setPedidos(lista);
    } catch (e) {
    } finally {
      setCarregando(false);
    }
  }, [usuario.token]);

  useFocusEffect(
    useCallback(() => {
      carregar();
      const intervalo = setInterval(carregar, 8000);
      return () => clearInterval(intervalo);
    }, [carregar])
  );

  async function puxarParaAtualizar() {
    setPuxando(true);
    await carregar();
    setPuxando(false);
  }

  async function mudarStatus(pedido, novoStatus) {
    try {
      setAtualizandoId(pedido.id);
      await api.atualizarStatus(usuario.token, pedido.id, novoStatus);
      await carregar();
    } catch (e) {
      Alert.alert("Erro", e.message);
    } finally {
      setAtualizandoId(null);
    }
  }

  function confirmarCancelar(pedido) {
    Alert.alert("Cancelar pedido", "Deseja cancelar o pedido #" + pedido.id + "?", [
      { text: "Não", style: "cancel" },
      { text: "Sim, cancelar", style: "destructive", onPress: () => mudarStatus(pedido, "Cancelado") },
    ]);
  }

  function renderPedido({ item }) {
    const acao = proximaAcao(item.status);
    const ocupado = atualizandoId === item.id;
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
        {!!item.observacao && <Text style={styles.obs}>Obs: {item.observacao}</Text>}

        <View style={styles.botoes}>
          {acao && (
            <Pressable
              style={[styles.btn, { backgroundColor: acao.cor }, ocupado && { opacity: 0.6 }]}
              onPress={() => mudarStatus(item, acao.novo)}
              disabled={ocupado}
            >
              {ocupado ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTexto}>{acao.label}</Text>}
            </Pressable>
          )}
          <Pressable
            style={[styles.btn, styles.btnCancelar]}
            onPress={() => confirmarCancelar(item)}
            disabled={ocupado}
          >
            <Text style={[styles.btnTexto, { color: cores.vermelho }]}>Cancelar</Text>
          </Pressable>
        </View>
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
      onRefresh={puxarParaAtualizar}
      ListEmptyComponent={<Text style={styles.vazio}>Nenhum pedido na fila no momento. 🎉</Text>}
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
  obs: { color: cores.textoClaro, fontStyle: "italic", marginTop: 4 },
  botoes: { flexDirection: "row", marginTop: 12, gap: 8 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  btnTexto: { color: "#fff", fontWeight: "700", fontSize: 14 },
  btnCancelar: { backgroundColor: "#fff", borderWidth: 1, borderColor: cores.vermelho },
});
