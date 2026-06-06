import React, { useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../../api";
import { useAuth } from "../../AuthContext";
import { cores } from "../../theme";
import { formatarReal, formatarDataHora } from "../../utils";
import SeloStatus from "../../components/SeloStatus";

export default function MeusPedidosScreen() {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const lista = await api.meusPedidos(usuario.token);
      setPedidos(lista);
    } catch (e) {
    } finally {
      setCarregando(false);
    }
  }, [usuario.token]);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  function confirmarCancelar(pedido) {
    Alert.alert("Cancelar pedido", "Deseja cancelar o pedido #" + pedido.id + "?", [
      { text: "Não", style: "cancel" },
      {
        text: "Sim, cancelar",
        style: "destructive",
        onPress: async () => {
          try {
            await api.cancelarPedido(usuario.token, pedido.id);
            carregar();
          } catch (e) {
            Alert.alert("Não foi possível cancelar", e.message);
          }
        },
      },
    ]);
  }

  function renderPedido({ item }) {
    return (
      <View style={styles.card}>
        <View style={styles.linhaTopo}>
          <Text style={styles.pedidoId}>Pedido #{item.id}</Text>
          <SeloStatus status={item.status} />
        </View>
        <Text style={styles.data}>{formatarDataHora(item.dataHora)}</Text>

        {item.itens.map((it, idx) => (
          <Text key={idx} style={styles.item}>
            {it.quantidade}x {it.nomeProduto} — {formatarReal(it.subtotal)}
          </Text>
        ))}

        {!!item.observacao && <Text style={styles.obs}>Obs: {item.observacao}</Text>}
        <Text style={styles.total}>Total: {formatarReal(item.total)}</Text>

        {item.status === "Recebido" && (
          <Pressable style={styles.btnCancelar} onPress={() => confirmarCancelar(item)}>
            <Text style={styles.btnCancelarTexto}>Cancelar pedido</Text>
          </Pressable>
        )}
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
      refreshing={carregando}
      onRefresh={carregar}
      ListEmptyComponent={<Text style={styles.vazio}>Você ainda não fez pedidos.</Text>}
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
  data: { color: cores.textoClaro, fontSize: 12, marginTop: 2, marginBottom: 8 },
  item: { color: cores.texto, fontSize: 14, lineHeight: 20 },
  obs: { color: cores.textoClaro, fontStyle: "italic", marginTop: 4 },
  total: { marginTop: 8, fontSize: 16, fontWeight: "800", color: cores.primariaEscura },
  btnCancelar: {
    marginTop: 12, borderWidth: 1, borderColor: cores.vermelho, borderRadius: 10,
    paddingVertical: 10, alignItems: "center",
  },
  btnCancelarTexto: { color: cores.vermelho, fontWeight: "700" },
});
