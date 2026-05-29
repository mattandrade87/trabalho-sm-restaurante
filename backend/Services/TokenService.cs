using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LanchoneteApi.Models;
using Microsoft.IdentityModel.Tokens;

namespace LanchoneteApi.Services;

public class TokenService
{
    private readonly IConfiguration _config;

    public TokenService(IConfiguration config)
    {
        _config = config;
    }

    public string GerarToken(Usuario usuario)
    {
        var chave = _config["Jwt:Key"]!;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(chave));
        var credenciais = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim("id", usuario.Id.ToString()),
            new Claim("nome", usuario.Nome),
            new Claim("email", usuario.Email),
            new Claim("role", usuario.Perfil)
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: credenciais
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
