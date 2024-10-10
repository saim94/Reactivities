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

    //[HttpGet(Name = "GetWeatherForecast")]
    //public IEnumerable<WeatherForecast> Get()
    //{

    //    return Enumerable.Range(1, 5).Select(index => new WeatherForecast
    //    {
    //        Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(index)),
    //        TemperatureC = Random.Shared.Next(-20, 55),
    //        Summary = Summaries[Random.Shared.Next(Summaries.Length)]
    //    })
    //    .ToArray();
    //}

    [HttpGet(Name = "GetWeatherForecast")]
    public async Task<IActionResult> Get()
    {
        var userNamesText = "jane@example.com, tom@example.com, alice@example.com, charlie@example.com, david@example.com, emily@example.com, frank@example.com, grace@example.com, henry@example.com, ivy@example.com, jack@example.com, katie@example.com, luke@example.com, nora@example.com, oscar@example.com, penny@example.com, quincy@example.com, ruby@example.com, sam@example.com, bob, jane, tom, bob@example.com";

        var userNames = userNamesText.Split(",").ToList();

        for (int i = 0; i < userNames.Count; i++)
        {
            await SetPhoto(_mediator, userNames[i]);
        }

        //return Enumerable.Range(1, 5).Select(index => new WeatherForecast
        //{
        //    Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(index)),
        //    TemperatureC = Random.Shared.Next(-20, 55),
        //    Summary = Summaries[Random.Shared.Next(Summaries.Length)]
        //})
        //.ToArray();
        return Ok();
    }
    public static async Task SetPhoto(IMediator mediator, string userName)
    {
        HttpClient client = new HttpClient();
        var response = await client.GetAsync("https://randomuser.me/api/");

        // Ensure successful response
        if (response.IsSuccessStatusCode)
        {
            // Deserialize the JSON response
            var responseData = await response.Content.ReadAsStringAsync();
            var userResponse = JsonConvert.DeserializeObject<dynamic>(responseData);

            // Extract the picture URL
            string pictureUrl = userResponse.results[0].picture.large;

            using (var imageClient = new HttpClient())
            {
                var responseResponse = await imageClient.GetAsync(pictureUrl);

                if (response.IsSuccessStatusCode)
                {
                    using (HttpClient httpClient = new HttpClient())
                    {
                        // Download the image stream
                        using (Stream imageStream = await httpClient.GetStreamAsync(pictureUrl))
                        {
                            await mediator.Send(new Add2.Command { FileStream = imageStream, UserName = userName });
                        }
                    }
                }
                else
                {
                    // Handle download failure
                }
            }

        }
        else
        {
            Console.WriteLine("Failed to fetch random user data.");
        }
    }
}
