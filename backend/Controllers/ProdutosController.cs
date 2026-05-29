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
public class ProdutosController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProdutosController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Produto>>> Listar()
    {
        var produtos = await _db.Produtos
            .Where(p => p.Disponivel)
            .OrderBy(p => p.Categoria).ThenBy(p => p.Nome)
            .ToListAsync();

        return Ok(produtos);
    }

    [HttpGet("admin")]
    [Authorize(Roles = Perfis.Admin)]
    public async Task<ActionResult<IEnumerable<Produto>>> ListarTodos()
    {
        var produtos = await _db.Produtos
            .OrderBy(p => p.Categoria).ThenBy(p => p.Nome)
            .ToListAsync();

        return Ok(produtos);
    }

    [HttpPost]
    [Authorize(Roles = Perfis.Admin)]
    public async Task<ActionResult<Produto>> Criar(ProdutoDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Nome))
            return BadRequest("O nome do produto e obrigatorio.");
        if (dto.Preco <= 0)
            return BadRequest("O preco deve ser maior que zero.");

        var produto = new Produto
        {
            Nome = dto.Nome.Trim(),
            Descricao = dto.Descricao ?? "",
            Preco = dto.Preco,
            Categoria = string.IsNullOrWhiteSpace(dto.Categoria) ? "Outros" : dto.Categoria.Trim(),
            Disponivel = dto.Disponivel
        };

        _db.Produtos.Add(produto);
        await _db.SaveChangesAsync();

        return Ok(produto);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = Perfis.Admin)]
    public async Task<ActionResult<Produto>> Editar(int id, ProdutoDto dto)
    {
        var produto = await _db.Produtos.FindAsync(id);
        if (produto == null)
            return NotFound("Produto nao encontrado.");

        produto.Nome = dto.Nome.Trim();
        produto.Descricao = dto.Descricao ?? "";
        produto.Preco = dto.Preco;
        produto.Categoria = string.IsNullOrWhiteSpace(dto.Categoria) ? "Outros" : dto.Categoria.Trim();
        produto.Disponivel = dto.Disponivel;

        await _db.SaveChangesAsync();
        return Ok(produto);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = Perfis.Admin)]
    public async Task<IActionResult> Excluir(int id)
    {
        var produto = await _db.Produtos.FindAsync(id);
        if (produto == null)
            return NotFound("Produto nao encontrado.");

        var usadoEmPedidos = await _db.ItensPedido.AnyAsync(i => i.ProdutoId == id);
        if (usadoEmPedidos)
            return BadRequest("Este produto ja foi usado em pedidos. Marque como indisponivel em vez de excluir.");

        _db.Produtos.Remove(produto);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
