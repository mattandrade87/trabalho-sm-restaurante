import React, { useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable, Alert, TextInput } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../../api";
import { useAuth } from "../../AuthContext";
import { cores } from "../../theme";
import { formatarReal, formatarDataHora, formatarEntrega } from "../../utils";
import SeloStatus from "../../components/SeloStatus";

export default function MeusPedidosScreen() {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [avaliandoId, setAvaliandoId] = useState(null);
  const [notaSel, setNotaSel] = useState(0);
  const [comentario, setComentario] = useState("");

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

  function abrirAvaliacao(pedido) {
    setAvaliandoId(pedido.id);
    setNotaSel(0);
    setComentario("");
  }

  async function enviarAvaliacao(pedido) {
    if (notaSel < 1) {
      Alert.alert("Atenção", "Escolha de 1 a 5 estrelas.");
      return;
    }
    try {
      await api.avaliarPedido(usuario.token, pedido.id, notaSel, comentario.trim() || null);
      setAvaliandoId(null);
      carregar();
    } catch (e) {
      Alert.alert("Erro", e.message);
    }
  }

  async function pedirNovamente(pedido) {
    const itens = pedido.itens.map((it) => ({ produtoId: it.produtoId, quantidade: it.quantidade }));
    try {
      await api.criarPedido(usuario.token, itens, pedido.observacao || null, pedido.tipoEntrega, pedido.mesa);
      Alert.alert("Pedido refeito! 🎉", "Seu novo pedido foi enviado.");
      carregar();
    } catch (e) {
      Alert.alert("Não foi possível repetir", e.message);
    }
  }

  function renderPedido({ item }) {
    return (
      <View style={styles.card}>
        <View style={styles.linhaTopo}>
          <Text style={styles.pedidoId}>Pedido #{item.id}</Text>
          <SeloStatus status={item.status} />
        </View>
        <Text style={styles.data}>{formatarDataHora(item.dataHora)} • {formatarEntrega(item)}</Text>

        {item.itens.map((it, idx) => (
          <Text key={idx} style={styles.item}>
            {it.quantidade}x {it.nomeProduto} — {formatarReal(it.subtotal)}
          </Text>
        ))}

        {!!item.observacao && <Text style={styles.obs}>Obs: {item.observacao}</Text>}
        <Text style={styles.total}>Total: {formatarReal(item.total)}</Text>

        {(item.status === "Entregue" || item.status === "Cancelado") && (
          <Pressable style={styles.btnRepetir} onPress={() => pedirNovamente(item)}>
            <Text style={styles.btnRepetirTexto}>Pedir novamente</Text>
          </Pressable>
        )}

        {item.status === "Recebido" && (
          <Pressable style={styles.btnCancelar} onPress={() => confirmarCancelar(item)}>
            <Text style={styles.btnCancelarTexto}>Cancelar pedido</Text>
          </Pressable>
        )}

        {item.status === "Entregue" && item.nota ? (
          <Text style={styles.avaliado}>
            Sua avaliação: {"★".repeat(item.nota)}{item.comentario ? " — " + item.comentario : ""}
          </Text>
        ) : null}

        {item.status === "Entregue" && !item.nota && avaliandoId !== item.id ? (
          <Pressable style={styles.btnAvaliar} onPress={() => abrirAvaliacao(item)}>
            <Text style={styles.btnAvaliarTexto}>Avaliar pedido</Text>
          </Pressable>
        ) : null}

        {item.status === "Entregue" && !item.nota && avaliandoId === item.id ? (
          <View style={styles.boxAval}>
            <View style={styles.estrelas}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable key={n} onPress={() => setNotaSel(n)}>
                  <Text style={styles.estrela}>{n <= notaSel ? "★" : "☆"}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={styles.inputAval}
              placeholder="Comentário (opcional)"
              value={comentario}
              onChangeText={setComentario}
            />
            <View style={styles.linhaAval}>
              <Pressable style={styles.btnEnviarAval} onPress={() => enviarAvaliacao(item)}>
                <Text style={styles.btnEnviarAvalTexto}>Enviar avaliação</Text>
              </Pressable>
              <Pressable onPress={() => setAvaliandoId(null)}>
                <Text style={styles.cancelarAval}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
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
  btnRepetir: {
    marginTop: 12, backgroundColor: cores.primaria, borderRadius: 10,
    paddingVertical: 11, alignItems: "center",
  },
  btnRepetirTexto: { color: "#fff", fontWeight: "700" },
  btnCancelar: {
    marginTop: 12, borderWidth: 1, borderColor: cores.vermelho, borderRadius: 10,
    paddingVertical: 10, alignItems: "center",
  },
  btnCancelarTexto: { color: cores.vermelho, fontWeight: "700" },
  avaliado: { marginTop: 10, color: cores.amarelo, fontWeight: "700" },
  btnAvaliar: {
    marginTop: 12, borderWidth: 1, borderColor: cores.primaria, borderRadius: 10,
    paddingVertical: 10, alignItems: "center",
  },
  btnAvaliarTexto: { color: cores.primaria, fontWeight: "700" },
  boxAval: { marginTop: 12, borderTopWidth: 1, borderTopColor: cores.borda, paddingTop: 10 },
  estrelas: { flexDirection: "row", justifyContent: "center", marginBottom: 8 },
  estrela: { fontSize: 32, color: cores.amarelo, marginHorizontal: 4 },
  inputAval: {
    backgroundColor: cores.fundo, borderWidth: 1, borderColor: cores.borda, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, color: cores.texto, marginBottom: 10,
  },
  linhaAval: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  btnEnviarAval: { backgroundColor: cores.primaria, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 18, alignItems: "center" },
  btnEnviarAvalTexto: { color: "#fff", fontWeight: "700" },
  cancelarAval: { color: cores.textoClaro, fontWeight: "600", paddingHorizontal: 10 },
});
