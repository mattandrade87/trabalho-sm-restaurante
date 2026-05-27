namespace LanchoneteApi.Models;

public class Usuario
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
    public string Perfil { get; set; } = Perfis.Cliente;
    public List<Pedido> Pedidos { get; set; } = new();
}
