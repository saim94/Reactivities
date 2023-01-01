using Microsoft.EntityFrameworkCore;
using Persistence;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Add any services in this section
builder.Services.AddControllers(); //Add Controllers Service
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer(); //Add swaggger Service
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<DataContext>(opt =>
    {
        opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
    }
);

var app = builder.Build(); //Build the APP

// Configure the HTTP request pipeline.
//Add Any middleware in this section
if (app.Environment.IsDevelopment()) // Middleware for Swagger for Development Environment
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection(); // Middleware for Https Redirection 

app.UseAuthorization(); // Middleware for Authorization 

app.MapControllers(); // Middleware for Map our Controllers

using var scop = app.Services.CreateScope();
var service = scop.ServiceProvider;

try
{
    var context = service.GetRequiredService<DataContext>();
    await context.Database.MigrateAsync();
    await Seed.SeedData(context);
}
catch (Exception ex)
{
    var logger = service.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error accured during migration");
}

app.Run();
