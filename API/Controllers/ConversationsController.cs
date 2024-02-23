using Application.Conversations;
using Application.Core;
using Domain;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class ConversationsController : BaseApiController
    {
        [HttpGet("{userName}")]
        public async Task<IActionResult> GetConversation(string userName)
        {
            return HandleResult(await Mediator.Send(new Details.Query { RecipientUserName = userName }));
        }

        [HttpGet]
        public async Task<IActionResult> GetConversations([FromQuery] PagingParams param, string id = "")
        {
            return HandlePagedResult(await Mediator.Send(new List.Query { Params = param, Id = id }));
        }

        [HttpDelete("{conversationId}")]
        public async Task<IActionResult> DeleteConversation(string conversationId)
        {
            return HandleResult(await Mediator.Send(new Delete.Command { ConversationId = conversationId }));
        }
    }
}
