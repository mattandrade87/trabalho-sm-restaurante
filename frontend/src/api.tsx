import { API_URL } from "./config";

async function requisitar(caminho, opcoes = {}) {
  const { metodo = "GET", corpo, token } = opcoes;

  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = "Bearer " + token;

  const resposta = await fetch(API_URL + caminho, {
    method: metodo,
    headers,
    body: corpo ? JSON.stringify(corpo) : undefined,
  });

  const texto = await resposta.text();
  let dados = null;
  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch (e) {
      dados = texto;
    }
  }

  if (!resposta.ok) {
    let msg = "Nao foi possivel completar a operacao.";
    if (typeof dados === "string" && dados) msg = dados;
    else if (dados && dados.title) msg = dados.title;
    else if (resposta.status === 401) msg = "Sessao expirada. Entre novamente.";
    else if (resposta.status === 403) msg = "Voce nao tem permissao para isso.";
    throw new Error(msg);
  }

  return dados;
}

export const api = {
  login: (email, senha) =>
    requisitar("/api/auth/login", { metodo: "POST", corpo: { email, senha } }),
  registrar: (nome, email, senha) =>
    requisitar("/api/auth/registro", { metodo: "POST", corpo: { nome, email, senha } }),

  listarCardapio: (token) => requisitar("/api/produtos", { token }),
  listarProdutosAdmin: (token) => requisitar("/api/produtos/admin", { token }),
  criarProduto: (token, produto) =>
    requisitar("/api/produtos", { metodo: "POST", corpo: produto, token }),
  editarProduto: (token, id, produto) =>
    requisitar("/api/produtos/" + id, { metodo: "PUT", corpo: produto, token }),
  excluirProduto: (token, id) =>
    requisitar("/api/produtos/" + id, { metodo: "DELETE", token }),

  criarPedido: (token, itens, observacao) =>
    requisitar("/api/pedidos", { metodo: "POST", corpo: { itens, observacao }, token }),
  meusPedidos: (token) => requisitar("/api/pedidos/meus", { token }),
  filaCozinha: (token) => requisitar("/api/pedidos/cozinha", { token }),
  atualizarStatus: (token, id, status) =>
    requisitar("/api/pedidos/" + id + "/status", { metodo: "PUT", corpo: { status }, token }),
  vendas: (token) => requisitar("/api/pedidos/vendas", { token }),
};
