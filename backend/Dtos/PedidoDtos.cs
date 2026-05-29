namespace LanchoneteApi.Dtos;

public record ItemPedidoEntradaDto(int ProdutoId, int Quantidade);
public record CriarPedidoDto(List<ItemPedidoEntradaDto> Itens, string? Observacao);
public record AtualizarStatusDto(string Status);

public record ItemPedidoRespostaDto(
    int ProdutoId,
    string NomeProduto,
    decimal PrecoUnitario,
    int Quantidade,
    decimal Subtotal
);

public record PedidoRespostaDto(
    int Id,
    string ClienteNome,
    DateTime DataHora,
    string Status,
    decimal Total,
    string? Observacao,
    List<ItemPedidoRespostaDto> Itens
);
