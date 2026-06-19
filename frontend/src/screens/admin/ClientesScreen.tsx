import React, { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../../api";
import { useAuth } from "../../AuthContext";
import { cores } from "../../theme";
import Avatar from "../../components/Avatar";

export default function ClientesScreen({ navigation }) {
  const { usuario } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [puxando, setPuxando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const lista = await api.listarClientes(usuario.token);
      setClientes(lista);
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

  function renderCliente({ item }) {
    return (
      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate("ClienteDetalhe", { id: item.id, nome: item.nome })}
      >
        <Avatar foto={item.foto} nome={item.nome} tamanho={48} />
        <View style={styles.info}>
          <Text style={styles.nome}>{item.nome}</Text>
          <Text style={styles.telefone}>{item.telefone || "Sem telefone"}</Text>
        </View>
        <View style={styles.contador}>
          <Text style={styles.contadorNum}>{item.totalPedidos}</Text>
          <Text style={styles.contadorLabel}>pedidos</Text>
        </View>
      </Pressable>
    );
  }

  if (carregando && clientes.length === 0) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: cores.fundo }}
      data={clientes}
      keyExtractor={(c) => String(c.id)}
      renderItem={renderCliente}
      contentContainerStyle={{ padding: 14 }}
      refreshing={puxando}
      onRefresh={puxar}
      ListEmptyComponent={<Text style={styles.vazio}>Nenhum cliente cadastrado ainda.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: cores.fundo },
  vazio: { textAlign: "center", color: cores.textoClaro, marginTop: 40 },
  card: {
    backgroundColor: cores.cartao, borderRadius: 12, padding: 12, marginBottom: 10,
    flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: cores.borda,
  },
  info: { flex: 1, marginLeft: 12 },
  nome: { fontSize: 16, fontWeight: "700", color: cores.texto },
  telefone: { fontSize: 13, color: cores.textoClaro, marginTop: 2 },
  contador: { alignItems: "center", marginLeft: 8 },
  contadorNum: { fontSize: 18, fontWeight: "800", color: cores.primaria },
  contadorLabel: { fontSize: 11, color: cores.textoClaro },
});
