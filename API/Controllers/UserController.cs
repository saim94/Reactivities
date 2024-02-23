using Application.Users;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class UserController : BaseApiController
    {
        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] string searchQuery)
        {
            return HandleResult(await Mediator.Send(new List.Query { SearchQuery = searchQuery }));
        }
        [HttpGet("Count")]
        public async Task<IActionResult> Count() //for getting unread messages count
        {
            return HandleResult(await Mediator.Send(new Count.Query()));
        }
    }
}
