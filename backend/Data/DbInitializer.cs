using LanchoneteApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;

namespace LanchoneteApi.Data;

public static class DbInitializer
{
    public static void Seed(AppDbContext db)
    {
        if (!TabelasJaExistem(db))
        {
            db.GetService<IRelationalDatabaseCreator>().CreateTables();
        }

        db.Database.ExecuteSqlRaw(
            "ALTER TABLE \"Pedidos\" ADD COLUMN IF NOT EXISTS \"TipoEntrega\" text NOT NULL DEFAULT 'Balcao';" +
            "ALTER TABLE \"Pedidos\" ADD COLUMN IF NOT EXISTS \"Mesa\" text;" +
            "ALTER TABLE \"Pedidos\" ADD COLUMN IF NOT EXISTS \"Nota\" integer;" +
            "ALTER TABLE \"Pedidos\" ADD COLUMN IF NOT EXISTS \"Comentario\" text;");

        if (!db.Usuarios.Any())
        {
            db.Usuarios.AddRange(
                new Usuario
                {
                    Nome = "Administrador",
                    Email = "admin@lanche.com",
                    Perfil = Perfis.Admin,
                    SenhaHash = BCrypt.Net.BCrypt.HashPassword("123456")
                },
                new Usuario
                {
                    Nome = "Funcionario Cozinha",
                    Email = "cozinha@lanche.com",
                    Perfil = Perfis.Cozinha,
                    SenhaHash = BCrypt.Net.BCrypt.HashPassword("123456")
                },
                new Usuario
                {
                    Nome = "Cliente Teste",
                    Email = "cliente@lanche.com",
                    Perfil = Perfis.Cliente,
                    SenhaHash = BCrypt.Net.BCrypt.HashPassword("123456")
                }
            );
        }

        if (!db.Produtos.Any())
        {
            db.Produtos.AddRange(
                new Produto { Nome = "X-Burguer", Descricao = "Pao, hamburguer, queijo e salada", Preco = 18.00m, Categoria = "Lanche" },
                new Produto { Nome = "X-Bacon", Descricao = "Hamburguer com bacon crocante e queijo", Preco = 22.00m, Categoria = "Lanche" },
                new Produto { Nome = "Cachorro-Quente", Descricao = "Salsicha, molho, batata palha e milho", Preco = 14.00m, Categoria = "Lanche" },
                new Produto { Nome = "Batata Frita", Descricao = "Porcao de batata frita media", Preco = 12.00m, Categoria = "Porcao" },
                new Produto { Nome = "Refrigerante Lata", Descricao = "Lata 350ml", Preco = 6.00m, Categoria = "Bebida" },
                new Produto { Nome = "Suco Natural", Descricao = "Copo 400ml (laranja ou maracuja)", Preco = 8.00m, Categoria = "Bebida" },
                new Produto { Nome = "Pudim", Descricao = "Fatia de pudim de leite", Preco = 9.00m, Categoria = "Sobremesa" }
            );
        }

        db.SaveChanges();
    }

    private static bool TabelasJaExistem(AppDbContext db)
    {
        return db.Database
            .SqlQueryRaw<bool>(
                "SELECT EXISTS (SELECT 1 FROM information_schema.tables " +
                "WHERE table_schema = 'public' AND table_name = 'Usuarios') AS \"Value\"")
            .AsEnumerable()
            .First();
    }
}
