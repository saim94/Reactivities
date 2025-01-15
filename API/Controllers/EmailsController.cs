using API.Manager;
using Application.Emails;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using System.Text;

namespace API.Controllers
{
    public class EmailsController : BaseApiController
    {

        [HttpGet]
        public async Task<IActionResult> GetUserEmails()
        {
            return HandleResult(await Mediator.Send(new List.Query()));
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] Add.Command command)
        {
            return HandleResult(await Mediator.Send(command));
        }

        [HttpDelete]
        public async Task<IActionResult> Delete([FromBody] Delete.Command command)
        {
            return HandleResult(await Mediator.Send(command));
        }

        [HttpDelete("{emailId}")]
        public async Task<IActionResult> Delete(int emailId)
        {
            return HandleResult(await Mediator.Send(new Delete.Command { EmailId = emailId }));
        }

        [HttpPost("SetPrimary")]
        public async Task<IActionResult> SetPrimary([FromBody] SetPrimary.Command command)
        {
            return HandleResult(await Mediator.Send(command));
        }

        [HttpPost("SetVerification")]
        public async Task<IActionResult> SetVerification([FromBody] SetVerification.Command command)
        {
            return HandleResult(await Mediator.Send(command));
        }

        [AllowAnonymous]
        [HttpPost("VerifyEmail")]
        public async Task<IActionResult> VerifyEmail([FromQuery] Verify.Command command)
        {
            return HandleResult(await Mediator.Send(command));
        }
    }
}
