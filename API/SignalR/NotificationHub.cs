using Application.Interfaces;
using Application.Notifications;
using Application.ReturnDTOs;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;


namespace API.SignalR
{
    [Authorize]
    public class NotificationHub : Hub
    {
        private readonly IMediator _mediator;
        private readonly IMapper _mapper;

        public NotificationHub(IMediator mediator, IMapper mapper)
        {
            _mediator = mediator;
            _mapper = mapper;
        }

        [HttpPost("UpdateActivityNotification")]
        public async Task UpdateActivityNotification(List<NotificationDto> notifications, string activityId)
        {
            Guid guid = Guid.Parse(activityId);
            var result = await _mediator.Send(new Create.Command { NotificationsList = notifications, ActivityId = guid });
            if (result.IsSuccess)
            {
                foreach (var attendee in result.Value)
                {
                    if (!attendee.IsHost)
                        await Clients.User(attendee.AppUser.UserName).SendAsync("ReceiveNotifications", notifications, null);
                }
            }
        }

        [HttpPost("CreateActivityNotification")]
        public async Task CreateActivityNotification(NotificationDto notification)
        {
            var result = await _mediator.Send(new CreateActivityNotification.Command { Notification = notification });
            if (result.IsSuccess)
            {
                foreach (var following in result.Value)
                {
                    await Clients.User(following.Observer.UserName).SendAsync("ReceiveNotifications", null, notification);
                }
            }
        }

        [HttpPost("FollowNotification")]
        public async Task FollowNotification(NotificationDto notification)
        {
            var result = await _mediator.Send(new FollowNotification.Command { Notification = notification });
            if (result.IsSuccess)
            {
                await Clients.User(notification.User.UserName).SendAsync("ReceiveNotifications", null, notification);
            }
        }

        [HttpPost("CommentNotification")]
        public async Task CommentNotification(Application.Comments.CommentDto comment)
        {
            var result = await _mediator.Send(new CommentNotification.Command { CommentDto = comment });
            if (result.IsSuccess)
            {
                foreach (var notification in result.Value)
                {
                    await Clients.User(notification.User.UserName).SendAsync("ReceiveNotifications", null, notification);
                }
                
            }
        }
    }
}
