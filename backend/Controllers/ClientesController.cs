using LanchoneteApi.Data;
using LanchoneteApi.Dtos;
using LanchoneteApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LanchoneteApi.Controllers;

[ApiController]
[Route("api/clientes")]
[Authorize(Roles = Perfis.Admin)]
public class ClientesController : ControllerBase
{
    private readonly AppDbContext _db;

    public ClientesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ClienteResumoDto>>> Listar()
    {
        var clientes = await _db.Usuarios
            .Where(u => u.Perfil == Perfis.Cliente)
            .OrderBy(u => u.Nome)
            .Select(u => new ClienteResumoDto(
                u.Id, u.Nome, u.Email, u.Telefone, u.Pedidos.Count
            ))
            .ToListAsync();

        return Ok(clientes);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ClienteDetalheDto>> Detalhe(int id)
    {
        var cliente = await _db.Usuarios
            .Include(u => u.Pedidos)
            .ThenInclude(p => p.Itens)
            .FirstOrDefaultAsync(u => u.Id == id && u.Perfil == Perfis.Cliente);

        if (cliente == null)
            return NotFound("Cliente nao encontrado.");

        var pedidos = cliente.Pedidos
            .OrderByDescending(p => p.DataHora)
            .Select(p => PedidoMapper.Mapear(p, cliente.Nome))
            .ToList();

        return Ok(new ClienteDetalheDto(
            cliente.Id, cliente.Nome, cliente.Email, cliente.Telefone, cliente.Foto, pedidos.Count, pedidos
        ));
    }
}
