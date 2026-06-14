namespace LanchoneteApi.Dtos;

public record PerfilDto(int Id, string Nome, string Email, string Perfil, string? Telefone, string? Foto);
public record AtualizarPerfilDto(string Nome, string? Telefone, string? Foto);
public record AlterarSenhaDto(string SenhaAtual, string NovaSenha);

public record ClienteResumoDto(int Id, string Nome, string Email, string? Telefone, int TotalPedidos);
public record ClienteDetalheDto(
    int Id,
    string Nome,
    string Email,
    string? Telefone,
    string? Foto,
    int TotalPedidos,
    List<PedidoRespostaDto> Pedidos
);
