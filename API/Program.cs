using API.Extensions;
using API.Middleware;
using Application.Activities;
using Application.Core;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Persistence;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Add any services in this section
builder.Services.AddControllers(opt =>
{
    var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
    opt.Filters.Add(new AuthorizeFilter(policy));
}); //Add Controllers Service
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle

builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);


var app = builder.Build(); //Build the APP

// Configure the HTTP request pipeline.
//Add Any middleware in this section
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment()) // Middleware for Swagger for Development Environment
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("CorsPolicy");

app.UseHttpsRedirection(); // Middleware for Https Redirection 

app.UseAuthentication(); //Middleware for Authentication(must be before Authorization)

app.UseAuthorization(); // Middleware for Authorization 

app.MapControllers(); // Middleware for Map our Controllers

using var scop = app.Services.CreateScope();
var service = scop.ServiceProvider;

try
{
    var context = service.GetRequiredService<DataContext>();
    var userManager = service.GetRequiredService<UserManager<AppUser>>();
    await context.Database.MigrateAsync();
    await Seed.SeedData(context, userManager);
}
catch (Exception ex)
{
    var logger = service.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error accured during migration");
}

app.Run();
