using Application.Core;
using Application.ReturnDTOs;
using AutoMapper;
using Domain;
using MediatR;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Notifications
{
    public class FollowNotification
    {
        public class Command : IRequest<Result<Unit>>
        {
            public NotificationDto Notification { get; set; }
        }
        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;

            public Handler(DataContext context, IMapper mapper)
            {
                _context = context;
                _mapper = mapper;
            }
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var receiverUser = _context.Users.Find(request.Notification.UserId);

                request.Notification.User = _mapper.Map<AppUser, UserDto>(receiverUser);

                _context.Notifications.Add(GetNotification(request.Notification));

                var result = await _context.SaveChangesAsync() > 0;

                if (result) return Result<Unit>.Success(Unit.Value);

                return Result<Unit>.Failure("Failed to send Notification");
            }
            public static Notification GetNotification(NotificationDto notification)
            {
                Guid uuid = Guid.NewGuid();
                var notificationId = uuid.ToString();
                notification.NotificationId = notificationId;
                return new Notification
                {
                    Content = notification.Content,
                    Title = notification.Title,
                    NotificationId = notificationId,
                    UserId = notification.UserId,
                    SourceUserId = notification.SourceUserId,
                    ActivityId = notification.ActivityId,
                };
            }
        }

    }
}
