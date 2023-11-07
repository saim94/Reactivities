using API.Extensions;
using API.Middleware;
using API.SignalR;
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

app.UseXContentTypeOptions();
app.UseReferrerPolicy(opt => opt.NoReferrer());
app.UseXXssProtection(opt => opt.EnabledWithBlockMode());
app.UseXfo(opt => opt.Deny());
app.UseCsp(opt => opt
    .BlockAllMixedContent()
    .StyleSources(s => s.Self()
        .CustomSources("https://fonts.googleapis.com/", "sha256-DpOoqibK/BsYhobWHnU38Pyzt5SjDZuR/mFsAiVN7kk=", "sha256-4Su6mBWzEIFnH4pAGMOuaeBrstwJN4Z3pq/s1Kn4/KQ="))
    .FontSources(s => s.Self().CustomSources("https://fonts.gstatic.com/", "data:"))
    .FormActions(s => s.Self())
    .FrameAncestors(s => s.Self())
    .ImageSources(s => s.Self()
        .CustomSources("blob:", "data:", "https://res.cloudinary.com/", "https://platform-lookaside.fbsbx.com", "https://graph.facebook.com"))
    .ScriptSources(s => s.Self().CustomSources("https://connect.facebook.net"))
);

if (app.Environment.IsDevelopment()) // Middleware for Swagger for Development Environment
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.Use(async (context, next) =>
    {
        context.Response.Headers.Add("Strict-Transport-Security", "max-age=31536000");
        await next.Invoke();
    });
}

app.UseCors("CorsPolicy");

app.UseHttpsRedirection(); // Middleware for Https Redirection 

app.UseAuthentication(); //Middleware for Authentication(must be before Authorization)
app.UseAuthorization(); // Middleware for Authorization 

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers(); // Middleware for Map our Controllers

app.MapHub<ChatHub>("/chat");

app.MapHub<MessageHub>("/message");

app.MapFallbackToController("Index", "Fallback");

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
