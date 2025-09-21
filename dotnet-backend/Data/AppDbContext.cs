using Microsoft.EntityFrameworkCore;
using dotnet_backend.Models;
using System;
using System.Linq;

namespace dotnet_backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
    }
}
