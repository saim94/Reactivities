using Application.Core;
using Application.Notifications;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class NotificationController : BaseApiController
    {
        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] PagingParams param, [FromQuery] bool unRead = false)
        {
            return HandlePagedResult(await Mediator.Send(new List.Query { Params = param, UnRead = unRead }));
        }

        [HttpPost("mark-as-read")]
        public async Task<IActionResult> MarkNotificationsAsRead()
        {
            return HandleResult(await Mediator.Send(new ReadAll.Command()));
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteNotification(string notificationId)
        {
            return HandleResult(await Mediator.Send(new Delete.Command { NotificationId = notificationId }));
        }

        [HttpPost("{notificationId}")]
        public async Task<IActionResult> ReadNotification(string notificationId)
        {
            return HandleResult(await Mediator.Send(new Read.Command { NotificationId = notificationId }));
        }

        [HttpGet("GetUnreadNotificationsCount")]
        public async Task<IActionResult> GetUnreadNotificationsCount()
        {
            return HandleResult(await Mediator.Send(new UnreadNotificationsCount.Query()));
        }
    }
}
