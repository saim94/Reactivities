using Application.Photos;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Persistence;

namespace API.Controllers;

[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
{
    private static readonly string[] Summaries = new[]
    {
        "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
    };

    private readonly ILogger<WeatherForecastController> _logger;
    private readonly UserManager<AppUser> _userManager;
    private readonly DataContext _context;
    private readonly IMediator _mediator;

    public WeatherForecastController(ILogger<WeatherForecastController> logger, UserManager<AppUser> userManager, DataContext context, IMediator mediator)
    {
        _logger = logger; //Dependency Injection
        _userManager = userManager;
        _context = context;
        _mediator = mediator;
    }

    [HttpGet(Name = "GetWeatherForecast")]
    public IEnumerable<WeatherForecast> Get()
    {

        return Enumerable.Range(1, 5).Select(index => new WeatherForecast
        {
            Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(index)),
            TemperatureC = Random.Shared.Next(-20, 55),
            Summary = Summaries[Random.Shared.Next(Summaries.Length)]
        })
        .ToArray();
    }

    //[HttpGet(Name = "GetWeatherForecast")]
    //public Task<IEnumerable<WeatherForecast>> Get()
    //{
    //    //var userNamesText = "test4,msaimsajid94@gmail.com,test5,msaimsajid356@gmail.com,emily@example.com,test2,test6,jane,test7,frank@example.com,grace@example.com,test3,henry@example.com,saim.stsr@gmail.com,tom,bob@example.com,jane@example.com,tom@example.com,alice@example.com,ivy@example.com,charlie@example.com,david@example.com,jack@example.com,katie@example.com,luke@example.com,nora@example.com,oscar@example.com,penny@example.com,quincy@example.com,ruby@example.com,sam@example.com,bob";

    //    //var userNames = userNamesText.Split(",").ToList();

    //    //for (int i = 0; i < userNames.Count; i++)
    //    //{
    //    //    await SetPhoto(_mediator, userNames[i]);
    //    //}

    //    return Enumerable.Range(1, 5).Select(index => new WeatherForecast
    //    {
    //        Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(index)),
    //        TemperatureC = Random.Shared.Next(-20, 55),
    //        Summary = Summaries[Random.Shared.Next(Summaries.Length)]
    //    })
    //    .ToArray();
    //}
    //public static async Task SetPhoto(IMediator mediator, string userName)
    //{
    //    HttpClient client = new HttpClient();
    //    var response = await client.GetAsync("https://randomuser.me/api/");

    //    // Ensure successful response
    //    if (response.IsSuccessStatusCode)
    //    {
    //        // Deserialize the JSON response
    //        var responseData = await response.Content.ReadAsStringAsync();
    //        var userResponse = JsonConvert.DeserializeObject<dynamic>(responseData);

    //        // Extract the picture URL
    //        string pictureUrl = userResponse.results[0].picture.large;

    //        using (var imageClient = new HttpClient())
    //        {
    //            var responseResponse = await imageClient.GetAsync(pictureUrl);

    //            if (response.IsSuccessStatusCode)
    //            {
    //                using (HttpClient httpClient = new HttpClient())
    //                {
    //                    // Download the image stream
    //                    using (Stream imageStream = await httpClient.GetStreamAsync(pictureUrl))
    //                    {
    //                        await mediator.Send(new Add.Command { FileStream = imageStream, UserName = userName });
    //                    }
    //                }
    //            }
    //            else
    //            {
    //                // Handle download failure
    //            }
    //        }

    //    }
    //    else
    //    {
    //        Console.WriteLine("Failed to fetch random user data.");
    //    }
    //}
}
