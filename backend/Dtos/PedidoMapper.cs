using LanchoneteApi.Models;

namespace LanchoneteApi.Dtos;

public static class PedidoMapper
{
    public static PedidoRespostaDto Mapear(Pedido p, string clienteNome)
    {
        var itens = p.Itens.Select(i => new ItemPedidoRespostaDto(
            i.ProdutoId, i.NomeProduto, i.PrecoUnitario, i.Quantidade, i.Subtotal
        )).ToList();

        return new PedidoRespostaDto(
            p.Id, clienteNome, p.DataHora, p.Status, p.Total, p.Observacao,
            p.TipoEntrega, p.Mesa, p.Nota, p.Comentario, itens
        );
    }
}
