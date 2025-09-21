using System;
using System.Collections.Generic;

namespace dotnet_backend.Models
{
    public partial class Category
    {
        public int Id { get; set; }

        public string Name { get; set; } = null!;
    }
}
