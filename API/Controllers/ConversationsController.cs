using Application.Conversations;
using Domain;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class ConversationsController : BaseApiController
    {
        [HttpGet("{userName}")]
        public async Task<IActionResult> GetConversation(string userName)
        {
            return HandleTypedResult(await Mediator.Send(new Details.Query { RecipientUserName = userName }));
        }

        //[HttpGet("{userName}")]
        //public async Task<IActionResult> GetConversationPaged(string userName)
        //{
        //    return HandleResult(await Mediator.Send(new DetailsPaged.Query { RecipientUserName = userName }));
        //}

        [HttpGet]
        public async Task<IActionResult> GetConversations()
        {
            return HandleResult(await Mediator.Send(new List.Query()));
        }

        [HttpDelete("{conversationId}")]
        public async Task<IActionResult> DeleteConversation(string conversationId)
        {
            return HandleResult(await Mediator.Send(new Delete.Command { ConversationId = conversationId }));
        }
    }
}
