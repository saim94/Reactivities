using API.DTOs;
using Application.Core;
using Application.Messages;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class MessagesController : BaseApiController
    {
        [HttpPost("SendMessage")]
        public async Task<IActionResult> SendMessage(MessageDto message)
        {
            return HandleResult(await Mediator.Send(new Create.Command { MessageContent = message.Message, RecipientUserName = message.RecipientUserName }));
        }

        [HttpGet("GetMessages/{conversationId}/")]
        public async Task<IActionResult> GetMessages([FromQuery] PagingParams param, int conversationId)
        {
            return HandlePagedResult(await Mediator.Send(new List.Query { ConversationId = conversationId, Params = param }));
        }

        //[HttpDelete("DeleteMessage")]
        //public async Task<IActionResult> DeleteMessage()
    }
}
