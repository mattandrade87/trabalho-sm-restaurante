using LanchoneteApi.Models;
using Microsoft.EntityFrameworkCore;

namespace LanchoneteApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Produto> Produtos => Set<Produto>();
    public DbSet<Pedido> Pedidos => Set<Pedido>();
    public DbSet<ItemPedido> ItensPedido => Set<ItemPedido>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Produto>().Property(p => p.Preco).HasPrecision(10, 2);
        modelBuilder.Entity<Pedido>().Property(p => p.Total).HasPrecision(10, 2);
        modelBuilder.Entity<ItemPedido>().Property(i => i.PrecoUnitario).HasPrecision(10, 2);
        modelBuilder.Entity<ItemPedido>().Property(i => i.Subtotal).HasPrecision(10, 2);

        modelBuilder.Entity<Usuario>().HasIndex(u => u.Email).IsUnique();

        modelBuilder.Entity<Pedido>()
            .HasMany(p => p.Itens)
            .WithOne(i => i.Pedido)
            .HasForeignKey(i => i.PedidoId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ItemPedido>()
            .HasOne(i => i.Produto)
            .WithMany()
            .HasForeignKey(i => i.ProdutoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
