using Application.Core;
using Application.Messages;
using Application.ReturnDTOs;
using Domain;
using FluentValidation.AspNetCore;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json.Linq;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace API.SignalR
{
    [Authorize]
    public class MessageHub : Hub
    {
        private readonly IMediator _mediator;

        public MessageHub(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("SendMessage")]
        public async Task SendMessage(Create.Command command)
        {

            var result = await _mediator.Send(command);
            //await JoinSend(Context.ConnectionId, command.ConnectionId, result.Value.ConversationId.ToString(), result.Value);
            //await Groups.AddToGroupAsync(Context.ConnectionId, result.Value.ConversationId.ToString());
            await Clients.User(command.RecipientUserName).SendAsync("ReceiveMessage", result.Value);
            await Clients.Caller.SendAsync("ReceiveMessage", result.Value);
            //await Clients.Group(result.Value.ConversationId.ToString()).SendAsync("ReceiveMessage", "", result.Value);
        }

        [HttpPost("GetMessages")]
        public async Task GetMessages(int conversationId, int messageId, PagingParams param)
        {
            var result = await _mediator.Send(new List.Query { ConversationId = conversationId, Params = param });
            if (result.IsSuccess)
            {
                var pagination = new
                {
                    CurrentPage = (param.PageSize > 10) ? param.PageSize / 10 : result.Value.CurrentPage,
                    ItemsPerPage = (param.PageSize > 10) ? 10 : result.Value.PageSize,
                    TotalItems = result.Value.TotalCount,
                    TotalPages = (param.PageSize > 10) ?
                        (int)Math.Ceiling(result.Value.TotalCount / (double)10) : result.Value.Totalpages
                };

                await Clients.Caller.SendAsync("ReceivePreviousMessages", result.Value, pagination);
            }
        }


        [HttpPost("DeleteMessage")]
        public async Task DeleteMessage(Delete.Command command)
        {
            var value = 0;
            var result = await _mediator.Send(command);

            if (result.IsSuccess) value = int.Parse(command.MessageId);

            if (command.Method.Equals("Unsend"))
            {
                await Clients.User(command.Recipient).SendAsync("DeleteMessageStatus", value);
                await Clients.Caller.SendAsync("DeleteMessageStatus", value);
            }
            else if (command.Method.Equals("Delete")) await Clients.Caller.SendAsync("DeleteMessageStatus", value);
        }

        [HttpPost("UpdateIsRead")]
        public async Task UpdateIsRead(Update.Command command)
        {
            var result = await _mediator.Send(command);
            if (result != null && result.IsSuccess)
            {
                await Clients.User(command.SenderName).SendAsync("UpdateMessageStatus", command.MessageId);
            }

        }

        //[HttpPost("JoinConversation")]
        //public async Task JoinConversation(string conversationId, string connectionId)
        //{
        //    await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
        //    //await JoinSend(Context.ConnectionId, connectionId, conversationId.ToString();
        //}

        //[HttpPost("LeaveConversation")]
        //public async Task LeaveConversation(string conversationId)
        //{
        //    await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId);
        //}

        //public async Task SendMessageToClient(string conversationId, string senderUserName, ConversationDto content)
        //{
        //    await Clients.Group(conversationId).SendAsync("ReceiveMessage", senderUserName, content);
        //}

        //private async Task JoinSend(string currentConnectionId, string receivedConnectionId, string conversationId, ConversationDto conversation = null)
        //{
        //    if (!currentConnectionId.Equals(receivedConnectionId))
        //    {
        //        await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
        //        if (conversation != null)
        //            await SendMessageToClient(conversation.ConversationId.ToString(), Context.ConnectionId, conversation);
        //        else
        //            await Clients.Caller.SendAsync("ReceiveConnectionId", Context.ConnectionId);
        //    }
        //    else
        //    {
        //        if (conversation != null)
        //            await SendMessageToClient(conversation.ConversationId.ToString(), Context.ConnectionId, conversation);
        //        else
        //            await Clients.Caller.SendAsync("ReceiveConnectionId", Context.ConnectionId);
        //    }
        //}
    }
}
