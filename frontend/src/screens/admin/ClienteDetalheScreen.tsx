import React, { useState, useCallback, useLayoutEffect } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../../api";
import { useAuth } from "../../AuthContext";
import { cores } from "../../theme";
import { formatarReal, formatarDataHora, formatarEntrega } from "../../utils";
import Avatar from "../../components/Avatar";
import SeloStatus from "../../components/SeloStatus";

export default function ClienteDetalheScreen({ route, navigation }) {
  const { usuario } = useAuth();
  const { id, nome } = route.params;
  const [cliente, setCliente] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({ title: nome || "Cliente" });
  }, [navigation, nome]);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const d = await api.clienteDetalhe(usuario.token, id);
      setCliente(d);
    } catch (e) {
    } finally {
      setCarregando(false);
    }
  }, [usuario.token, id]);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  function renderPedido({ item }) {
    return (
      <View style={styles.card}>
        <View style={styles.linhaTopo}>
          <Text style={styles.pedidoId}>Pedido #{item.id}</Text>
          <SeloStatus status={item.status} />
        </View>
        <Text style={styles.data}>{formatarDataHora(item.dataHora)} • {formatarEntrega(item)}</Text>
        {item.itens.map((it, idx) => (
          <Text key={idx} style={styles.item}>{it.quantidade}x {it.nomeProduto}</Text>
        ))}
        <Text style={styles.total}>Total: {formatarReal(item.total)}</Text>
        {item.nota ? (
          <Text style={styles.nota}>{"★".repeat(item.nota)}{item.comentario ? " — " + item.comentario : ""}</Text>
        ) : null}
      </View>
    );
  }

  if (carregando || !cliente) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: cores.fundo }}
      data={cliente.pedidos}
      keyExtractor={(p) => String(p.id)}
      renderItem={renderPedido}
      contentContainerStyle={{ padding: 14 }}
      ListHeaderComponent={
        <View style={styles.cabecalho}>
          <Avatar foto={cliente.foto} nome={cliente.nome} tamanho={80} />
          <Text style={styles.nome}>{cliente.nome}</Text>
          <Text style={styles.contato}>{cliente.telefone || "Sem telefone"}</Text>
          <Text style={styles.contato}>{cliente.email}</Text>
          <Text style={styles.tituloLista}>Pedidos ({cliente.totalPedidos})</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.vazio}>Este cliente ainda não fez pedidos.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: cores.fundo },
  vazio: { textAlign: "center", color: cores.textoClaro, marginTop: 20 },
  cabecalho: { alignItems: "center", marginBottom: 14 },
  nome: { fontSize: 20, fontWeight: "800", color: cores.texto, marginTop: 10 },
  contato: { fontSize: 14, color: cores.textoClaro, marginTop: 2 },
  tituloLista: { alignSelf: "flex-start", fontSize: 15, fontWeight: "800", color: cores.texto, marginTop: 18 },
  card: {
    backgroundColor: cores.cartao, borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: cores.borda,
  },
  linhaTopo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pedidoId: { fontSize: 16, fontWeight: "800", color: cores.texto },
  data: { color: cores.textoClaro, fontSize: 12, marginTop: 2, marginBottom: 8 },
  item: { color: cores.texto, fontSize: 15, lineHeight: 22 },
  total: { marginTop: 8, fontSize: 16, fontWeight: "800", color: cores.primariaEscura },
  nota: { marginTop: 6, color: cores.amarelo, fontWeight: "700", fontSize: 13 },
});
