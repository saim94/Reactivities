using API.Manager;
using Application.PhoneNumbers;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace API.Controllers
{
    public class PhonesController : BaseApiController
    {
        private readonly IConfiguration _config;

        public PhonesController(IConfiguration config)
        {
            _config = config;
        }

        [HttpGet]
        public async Task<IActionResult> GetUserPhones()
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

        [HttpDelete("{phoneNumberId}")]
        public async Task<IActionResult> Delete(int phoneNumberId)
        {
            return HandleResult(await Mediator.Send(new Delete.Command { PhoneNumberId = phoneNumberId }));
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

        [HttpGet("config")]
        public async Task<ActionResult> GetFirebaseConfig()
        {
            var firebaseConfig = new
            {
                ApiKey = _config["FIREBASE_API_KEY"],
                AuthDomain = _config["FIREBASE_AUTH_DOMAIN"],
                ProjectId = _config["FIREBASE_PROJECT_ID"],
                StorageBucket = _config["FIREBASE_STORAGE_BUCKET"],
                MessagingSenderId = _config["FIREBASE_MESSAGING_SENDER_ID"],
                AppId = _config["FIREBASE_APP_ID"]
            };

            return Ok(firebaseConfig);
        }
    }
}
