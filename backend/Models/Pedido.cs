namespace LanchoneteApi.Models;

public class Pedido
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }
    public DateTime DataHora { get; set; }
    public string Status { get; set; } = StatusPedido.Recebido;
    public decimal Total { get; set; }
    public string? Observacao { get; set; }
    public List<ItemPedido> Itens { get; set; } = new();
}
