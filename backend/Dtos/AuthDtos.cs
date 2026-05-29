namespace LanchoneteApi.Dtos;

public record RegistroDto(string Nome, string Email, string Senha);
public record LoginDto(string Email, string Senha);
public record UsuarioRespostaDto(int Id, string Nome, string Email, string Perfil, string Token);
