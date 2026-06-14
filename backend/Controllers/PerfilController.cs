using LanchoneteApi.Data;
using LanchoneteApi.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LanchoneteApi.Controllers;

[ApiController]
[Route("api/perfil")]
[Authorize]
public class PerfilController : ControllerBase
{
    private readonly AppDbContext _db;

    public PerfilController(AppDbContext db)
    {
        _db = db;
    }

    private int UsuarioLogadoId => int.Parse(User.FindFirst("id")!.Value);

    [HttpGet]
    public async Task<ActionResult<PerfilDto>> MeuPerfil()
    {
        var usuario = await _db.Usuarios.FindAsync(UsuarioLogadoId);
        if (usuario == null)
            return NotFound("Usuario nao encontrado.");

        return Ok(new PerfilDto(usuario.Id, usuario.Nome, usuario.Email, usuario.Perfil, usuario.Telefone, usuario.Foto));
    }

    [HttpPut]
    public async Task<ActionResult<PerfilDto>> Atualizar(AtualizarPerfilDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Nome))
            return BadRequest("O nome nao pode ficar vazio.");

        var usuario = await _db.Usuarios.FindAsync(UsuarioLogadoId);
        if (usuario == null)
            return NotFound("Usuario nao encontrado.");

        usuario.Nome = dto.Nome.Trim();
        usuario.Telefone = string.IsNullOrWhiteSpace(dto.Telefone) ? null : dto.Telefone.Trim();
        if (dto.Foto != null)
            usuario.Foto = dto.Foto == "" ? null : dto.Foto;

        await _db.SaveChangesAsync();

        return Ok(new PerfilDto(usuario.Id, usuario.Nome, usuario.Email, usuario.Perfil, usuario.Telefone, usuario.Foto));
    }

    [HttpPut("senha")]
    public async Task<IActionResult> AlterarSenha(AlterarSenhaDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.NovaSenha) || dto.NovaSenha.Length < 4)
            return BadRequest("A nova senha precisa ter pelo menos 4 caracteres.");

        var usuario = await _db.Usuarios.FindAsync(UsuarioLogadoId);
        if (usuario == null)
            return NotFound("Usuario nao encontrado.");

        if (!BCrypt.Net.BCrypt.Verify(dto.SenhaAtual, usuario.SenhaHash))
            return BadRequest("A senha atual esta incorreta.");

        usuario.SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.NovaSenha);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
