import React, { useState, useLayoutEffect } from "react";
import {
  View, Text, TextInput, Switch, Pressable, StyleSheet, Alert, ActivityIndicator, ScrollView,
} from "react-native";
import { api } from "../../api";
import { useAuth } from "../../AuthContext";
import { cores } from "../../theme";

const CATEGORIAS = ["Lanche", "Porcao", "Bebida", "Sobremesa", "Outros"];

export default function ProdutoFormScreen({ route, navigation }) {
  const { usuario } = useAuth();
  const produtoEditar = route.params ? route.params.produto : null;
  const editando = !!produtoEditar;

  const [nome, setNome] = useState(produtoEditar ? produtoEditar.nome : "");
  const [descricao, setDescricao] = useState(produtoEditar ? produtoEditar.descricao : "");
  const [preco, setPreco] = useState(
    produtoEditar ? String(produtoEditar.preco).replace(".", ",") : ""
  );
  const [categoria, setCategoria] = useState(produtoEditar ? produtoEditar.categoria : "Lanche");
  const [disponivel, setDisponivel] = useState(produtoEditar ? produtoEditar.disponivel : true);
  const [salvando, setSalvando] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: editando ? "Editar produto" : "Novo produto" });
  }, [navigation, editando]);

  async function salvar() {
    const precoNum = parseFloat(String(preco).replace(",", "."));
    if (!nome.trim()) {
      Alert.alert("Atenção", "Informe o nome do produto.");
      return;
    }
    if (isNaN(precoNum) || precoNum <= 0) {
      Alert.alert("Atenção", "Informe um preço válido.");
      return;
    }

    const dados = {
      nome: nome.trim(),
      descricao: descricao.trim(),
      preco: precoNum,
      categoria: categoria,
      disponivel,
    };

    try {
      setSalvando(true);
      if (editando) {
        await api.editarProduto(usuario.token, produtoEditar.id, dados);
      } else {
        await api.criarProduto(usuario.token, dados);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert("Erro ao salvar", e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: cores.fundo }} contentContainerStyle={{ padding: 18 }}>
      <Text style={styles.label}>Nome</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: X-Burguer" />

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={[styles.input, { height: 70, textAlignVertical: "top" }]}
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Ingredientes..."
        multiline
      />

      <Text style={styles.label}>Preço (R$)</Text>
      <TextInput
        style={styles.input}
        value={preco}
        onChangeText={setPreco}
        placeholder="0,00"
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Categoria</Text>
      <View style={styles.categorias}>
        {CATEGORIAS.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setCategoria(cat)}
            style={[styles.catChip, categoria === cat && styles.catChipAtivo]}
          >
            <Text style={[styles.catChipTexto, categoria === cat && styles.catChipTextoAtivo]}>{cat}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.linhaSwitch}>
        <Text style={styles.label}>Disponível no cardápio</Text>
        <Switch
          value={disponivel}
          onValueChange={setDisponivel}
          trackColor={{ true: cores.primaria }}
        />
      </View>

      <Pressable style={[styles.btn, salvando && { opacity: 0.7 }]} onPress={salvar} disabled={salvando}>
        {salvando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnTexto}>{editando ? "Salvar alterações" : "Cadastrar"}</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: "700", color: cores.texto, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: cores.borda, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: cores.texto,
  },
  categorias: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 16, backgroundColor: "#fff",
    borderWidth: 1, borderColor: cores.borda,
  },
  catChipAtivo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  catChipTexto: { color: cores.texto, fontWeight: "600", fontSize: 14 },
  catChipTextoAtivo: { color: "#fff" },
  linhaSwitch: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  btn: { backgroundColor: cores.primaria, borderRadius: 10, paddingVertical: 15, alignItems: "center", marginTop: 28 },
  btnTexto: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
