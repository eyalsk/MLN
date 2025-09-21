using System;
using System.Collections.Generic;

namespace dotnet_backend.Models
{
    public partial class Product
    {
        public int Id { get; set; }

        public string Name { get; set; } = null!;

        [System.ComponentModel.DataAnnotations.Schema.Column("category_id")]
        public int CategoryId { get; set; }

        public virtual Category? Category { get; set; } // Make Category optional
    }
}
