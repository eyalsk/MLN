using Microsoft.AspNetCore.Mvc;
using dotnet_backend.Data;
using dotnet_backend.Models;
using Microsoft.EntityFrameworkCore;

// Ensure the correct AppDbContext is used
using AppDbContext = dotnet_backend.Data.AppDbContext;

namespace dotnet_backend.Controllers
{
    [ApiController]
    [Route("api/categories")]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            return await _context.Categories.ToListAsync();
        }

        [HttpGet("{categoryId}/products")]
        public async Task<ActionResult<IEnumerable<Product>>> GetProductsByCategory(int categoryId)
        {
            var products = await _context.Products
                .Where(p => p.CategoryId == categoryId)
                .ToListAsync();

            if (products == null || !products.Any())
            {
                return NotFound();
            }

            return products;
        }

        [HttpPost]
        public async Task<ActionResult<Category>> AddCategory([FromBody] Category category)
        {
            if (category == null || string.IsNullOrWhiteSpace(category.Name))
            {
                return BadRequest("Invalid category data.");
            }
category.Name = category.Name.Trim();
            var existingCategory = await _context.Categories.FirstOrDefaultAsync(c => c.Name == category.Name);
            if (existingCategory != null)
            {
                return Ok(existingCategory);
            }

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategories), new { id = category.Id }, category);
        }

        [HttpPost("{categoryId}/products")]
        public async Task<ActionResult<Product>> AddProduct(int categoryId, [FromBody] Product product)
        {
            product.Name = product.Name.Trim();

            if (product == null || string.IsNullOrWhiteSpace(product.Name))
            {
                return BadRequest("Invalid product data.");
            }

            var category = await _context.Categories.FindAsync(categoryId);
            if (category == null)
            {
                return NotFound("Category not found.");
            }

            var existingProduct = await _context.Products.FirstOrDefaultAsync(p => p.Name == product.Name && p.CategoryId == categoryId);
            if (existingProduct != null)
            {
                return Ok(existingProduct);
            }

            product.CategoryId = categoryId;
            product.Category = category;
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProductsByCategory), new { categoryId = categoryId }, product);
        }
    }
}
