namespace LanchoneteApi.Dtos;

public record ProdutoDto(
    string Nome,
    string Descricao,
    decimal Preco,
    string Categoria,
    bool Disponivel
);
