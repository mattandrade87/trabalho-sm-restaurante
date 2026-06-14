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

        db.Database.ExecuteSqlRaw(
            "ALTER TABLE \"Usuarios\" ADD COLUMN IF NOT EXISTS \"Telefone\" text;" +
            "ALTER TABLE \"Usuarios\" ADD COLUMN IF NOT EXISTS \"Foto\" text;");

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

        if (!db.Pedidos.Any(p => p.DataHora < DateTime.UtcNow.Date))
        {
            var cliente = db.Usuarios.First(u => u.Perfil == Perfis.Cliente);
            var produtos = db.Produtos.ToList();

            Produto buscar(string nome) => produtos.First(p => p.Nome == nome);

            db.Pedidos.AddRange(
                MontarPedidoMock(cliente.Id, new DateTime(2026, 6, 11, 12, 30, 0, DateTimeKind.Utc), "Balcao", null, 5, "Tudo otimo!", new List<ItemPedido>
                {
                    ItemDe(buscar("X-Burguer"), 2),
                    ItemDe(buscar("Refrigerante Lata"), 2)
                }),
                MontarPedidoMock(cliente.Id, new DateTime(2026, 6, 13, 19, 15, 0, DateTimeKind.Utc), "Mesa", "4", 4, null, new List<ItemPedido>
                {
                    ItemDe(buscar("X-Bacon"), 1),
                    ItemDe(buscar("Batata Frita"), 1),
                    ItemDe(buscar("Suco Natural"), 1)
                }),
                MontarPedidoMock(cliente.Id, new DateTime(2026, 6, 15, 13, 0, 0, DateTimeKind.Utc), "Viagem", null, 5, null, new List<ItemPedido>
                {
                    ItemDe(buscar("Cachorro-Quente"), 3),
                    ItemDe(buscar("Refrigerante Lata"), 3)
                }),
                MontarPedidoMock(cliente.Id, new DateTime(2026, 6, 16, 20, 45, 0, DateTimeKind.Utc), "Balcao", null, null, null, new List<ItemPedido>
                {
                    ItemDe(buscar("X-Burguer"), 1),
                    ItemDe(buscar("Batata Frita"), 1),
                    ItemDe(buscar("Pudim"), 1)
                }),
                MontarPedidoMock(cliente.Id, new DateTime(2026, 6, 17, 12, 10, 0, DateTimeKind.Utc), "Mesa", "2", 3, "Demorou um pouco", new List<ItemPedido>
                {
                    ItemDe(buscar("X-Bacon"), 2),
                    ItemDe(buscar("Suco Natural"), 2)
                })
            );

            db.SaveChanges();
        }

        SemearClientesExemplo(db);
    }

    private static void SemearClientesExemplo(AppDbContext db)
    {
        var principal = db.Usuarios.FirstOrDefault(u => u.Email == "cliente@lanche.com");
        if (principal != null && principal.Telefone == null)
        {
            principal.Telefone = "(11) 99999-0001";
            db.SaveChanges();
        }

        var extras = new[]
        {
            new { Email = "joana@lanche.com", Nome = "Joana Silva", Telefone = "(11) 98888-1010" },
            new { Email = "carlos@lanche.com", Nome = "Carlos Souza", Telefone = "(11) 97777-2020" }
        };

        foreach (var e in extras)
        {
            if (!db.Usuarios.Any(u => u.Email == e.Email))
            {
                db.Usuarios.Add(new Usuario
                {
                    Nome = e.Nome,
                    Email = e.Email,
                    Telefone = e.Telefone,
                    Perfil = Perfis.Cliente,
                    SenhaHash = BCrypt.Net.BCrypt.HashPassword("123456")
                });
            }
        }
        db.SaveChanges();

        var produtos = db.Produtos.ToList();
        Produto buscar(string nome) => produtos.First(p => p.Nome == nome);

        var joana = db.Usuarios.First(u => u.Email == "joana@lanche.com");
        if (!db.Pedidos.Any(p => p.UsuarioId == joana.Id))
        {
            db.Pedidos.AddRange(
                MontarPedidoMock(joana.Id, new DateTime(2026, 6, 12, 18, 0, 0, DateTimeKind.Utc), "Mesa", "5", 5, "Atendimento rapido", new List<ItemPedido>
                {
                    ItemDe(buscar("X-Bacon"), 1),
                    ItemDe(buscar("Refrigerante Lata"), 1)
                }),
                MontarPedidoMock(joana.Id, new DateTime(2026, 6, 16, 12, 40, 0, DateTimeKind.Utc), "Viagem", null, 4, null, new List<ItemPedido>
                {
                    ItemDe(buscar("Batata Frita"), 2),
                    ItemDe(buscar("Suco Natural"), 2)
                })
            );
        }

        var carlos = db.Usuarios.First(u => u.Email == "carlos@lanche.com");
        if (!db.Pedidos.Any(p => p.UsuarioId == carlos.Id))
        {
            db.Pedidos.AddRange(
                MontarPedidoMock(carlos.Id, new DateTime(2026, 6, 14, 20, 30, 0, DateTimeKind.Utc), "Balcao", null, 5, "Muito bom", new List<ItemPedido>
                {
                    ItemDe(buscar("X-Burguer"), 2),
                    ItemDe(buscar("Pudim"), 1)
                })
            );
        }

        db.SaveChanges();
    }

    private static ItemPedido ItemDe(Produto produto, int quantidade)
    {
        return new ItemPedido
        {
            ProdutoId = produto.Id,
            NomeProduto = produto.Nome,
            PrecoUnitario = produto.Preco,
            Quantidade = quantidade,
            Subtotal = produto.Preco * quantidade
        };
    }

    private static Pedido MontarPedidoMock(int clienteId, DateTime data, string tipoEntrega, string? mesa, int? nota, string? comentario, List<ItemPedido> itens)
    {
        return new Pedido
        {
            UsuarioId = clienteId,
            DataHora = data,
            Status = StatusPedido.Entregue,
            TipoEntrega = tipoEntrega,
            Mesa = mesa,
            Nota = nota,
            Comentario = comentario,
            Itens = itens,
            Total = itens.Sum(i => i.Subtotal)
        };
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
