using LanchoneteApi.Data;
using LanchoneteApi.Dtos;
using LanchoneteApi.Models;
using LanchoneteApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LanchoneteApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TokenService _tokenService;

    public AuthController(AppDbContext db, TokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    [AllowAnonymous]
    [HttpPost("registro")]
    public async Task<ActionResult<UsuarioRespostaDto>> Registro(RegistroDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Nome) ||
            string.IsNullOrWhiteSpace(dto.Email) ||
            string.IsNullOrWhiteSpace(dto.Senha))
        {
            return BadRequest("Preencha nome, email e senha.");
        }

        var email = dto.Email.Trim().ToLower();

        if (await _db.Usuarios.AnyAsync(u => u.Email == email))
            return BadRequest("Ja existe um usuario com esse email.");

        var usuario = new Usuario
        {
            Nome = dto.Nome.Trim(),
            Email = email,
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha),
            Perfil = Perfis.Cliente
        };

        _db.Usuarios.Add(usuario);
        await _db.SaveChangesAsync();

        return Ok(MontarResposta(usuario));
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<UsuarioRespostaDto>> Login(LoginDto dto)
    {
        var email = (dto.Email ?? "").Trim().ToLower();
        var usuario = await _db.Usuarios.FirstOrDefaultAsync(u => u.Email == email);

        if (usuario == null || !BCrypt.Net.BCrypt.Verify(dto.Senha, usuario.SenhaHash))
            return Unauthorized("Email ou senha invalidos.");

        return Ok(MontarResposta(usuario));
    }

    private UsuarioRespostaDto MontarResposta(Usuario usuario)
    {
        var token = _tokenService.GerarToken(usuario);
        return new UsuarioRespostaDto(usuario.Id, usuario.Nome, usuario.Email, usuario.Perfil, token);
    }
}
