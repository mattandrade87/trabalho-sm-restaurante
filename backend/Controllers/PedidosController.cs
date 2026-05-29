using LanchoneteApi.Data;
using LanchoneteApi.Dtos;
using LanchoneteApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LanchoneteApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PedidosController : ControllerBase
{
    private readonly AppDbContext _db;

    public PedidosController(AppDbContext db)
    {
        _db = db;
    }

    private int UsuarioLogadoId => int.Parse(User.FindFirst("id")!.Value);

    [HttpPost]
    [Authorize(Roles = Perfis.Cliente)]
    public async Task<ActionResult<PedidoRespostaDto>> Criar(CriarPedidoDto dto)
    {
        if (dto.Itens == null || dto.Itens.Count == 0)
            return BadRequest("O pedido precisa ter pelo menos um item.");

        var pedido = new Pedido
        {
            UsuarioId = UsuarioLogadoId,
            DataHora = DateTime.UtcNow,
            Status = StatusPedido.Recebido,
            Observacao = dto.Observacao
        };

        foreach (var itemDto in dto.Itens)
        {
            if (itemDto.Quantidade <= 0)
                return BadRequest("A quantidade de cada item deve ser maior que zero.");

            var produto = await _db.Produtos.FindAsync(itemDto.ProdutoId);
            if (produto == null || !produto.Disponivel)
                return BadRequest($"Produto indisponivel (id {itemDto.ProdutoId}).");

            pedido.Itens.Add(new ItemPedido
            {
                ProdutoId = produto.Id,
                NomeProduto = produto.Nome,
                PrecoUnitario = produto.Preco,
                Quantidade = itemDto.Quantidade,
                Subtotal = produto.Preco * itemDto.Quantidade
            });
        }

        pedido.Total = pedido.Itens.Sum(i => i.Subtotal);

        _db.Pedidos.Add(pedido);
        await _db.SaveChangesAsync();

        return Ok(MontarResposta(pedido, User.Identity?.Name ?? ""));
    }

    [HttpGet("meus")]
    [Authorize(Roles = Perfis.Cliente)]
    public async Task<ActionResult<IEnumerable<PedidoRespostaDto>>> MeusPedidos()
    {
        var pedidos = await _db.Pedidos
            .Include(p => p.Itens)
            .Include(p => p.Usuario)
            .Where(p => p.UsuarioId == UsuarioLogadoId)
            .OrderByDescending(p => p.DataHora)
            .ToListAsync();

        return Ok(pedidos.Select(p => MontarResposta(p, p.Usuario!.Nome)).ToList());
    }

    [HttpGet("cozinha")]
    [Authorize(Roles = $"{Perfis.Cozinha},{Perfis.Admin}")]
    public async Task<ActionResult<IEnumerable<PedidoRespostaDto>>> FilaCozinha()
    {
        var pedidos = await _db.Pedidos
            .Include(p => p.Itens)
            .Include(p => p.Usuario)
            .Where(p => p.Status != StatusPedido.Entregue && p.Status != StatusPedido.Cancelado)
            .OrderBy(p => p.DataHora)
            .ToListAsync();

        return Ok(pedidos.Select(p => MontarResposta(p, p.Usuario!.Nome)).ToList());
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = $"{Perfis.Cozinha},{Perfis.Admin}")]
    public async Task<IActionResult> AtualizarStatus(int id, AtualizarStatusDto dto)
    {
        var statusValidos = new[]
        {
            StatusPedido.Recebido, StatusPedido.EmPreparo,
            StatusPedido.Pronto, StatusPedido.Entregue, StatusPedido.Cancelado
        };
        if (!statusValidos.Contains(dto.Status))
            return BadRequest("Status invalido.");

        var pedido = await _db.Pedidos.FindAsync(id);
        if (pedido == null)
            return NotFound("Pedido nao encontrado.");

        pedido.Status = dto.Status;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("vendas")]
    [Authorize(Roles = Perfis.Admin)]
    public async Task<ActionResult<object>> Vendas()
    {
        var pedidos = await _db.Pedidos
            .Include(p => p.Itens)
            .Include(p => p.Usuario)
            .OrderByDescending(p => p.DataHora)
            .ToListAsync();

        var validos = pedidos.Where(p => p.Status != StatusPedido.Cancelado).ToList();

        return Ok(new
        {
            QuantidadePedidos = validos.Count,
            TotalVendido = validos.Sum(p => p.Total),
            Pedidos = pedidos.Select(p => MontarResposta(p, p.Usuario!.Nome)).ToList()
        });
    }

    private static PedidoRespostaDto MontarResposta(Pedido p, string clienteNome)
    {
        var itens = p.Itens.Select(i => new ItemPedidoRespostaDto(
            i.ProdutoId, i.NomeProduto, i.PrecoUnitario, i.Quantidade, i.Subtotal
        )).ToList();

        return new PedidoRespostaDto(
            p.Id, clienteNome, p.DataHora, p.Status, p.Total, p.Observacao, itens
        );
    }
}
