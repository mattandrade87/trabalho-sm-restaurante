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
    public string TipoEntrega { get; set; } = "Balcao";
    public string? Mesa { get; set; }
    public int? Nota { get; set; }
    public string? Comentario { get; set; }
    public List<ItemPedido> Itens { get; set; } = new();
}
