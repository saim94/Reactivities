using Application.Core;
using Application.Interfaces;
using Application.ReturnDTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Notifications
{
    public class CreateActivityNotification
    {
        public class Command : IRequest<Result<List<UserFollowing>>>
        {
            public NotificationDto Notification { get; set; }
        }
        public class Hanlder : IRequestHandler<Command, Result<List<UserFollowing>>>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;

            public Hanlder(DataContext context, IUserAccessor userAccessor)
            {
                _context = context;
                _userAccessor = userAccessor;
            }
            public async Task<Result<List<UserFollowing>>> Handle(Command request, CancellationToken cancellationToken)
            {
                var currentUserId = _userAccessor.GetUserid();
                var followings = _context
                    .UserFollowings.Include(f => f.Observer).ThenInclude(o => o.Photos)
                    .Include(f => f.Target).ThenInclude(t => t.Photos)
                    .Where(x => x.TargetId == currentUserId)
                    .ToList();

                if (followings.Count > 0)
                {
                    foreach (var follow in followings)
                    {
                        _context.Notifications.Add(GetNotification(request.Notification, follow.ObserverId));
                    }
                }
                var result = await _context.SaveChangesAsync() > 0;
                if (result) return Result<List<UserFollowing>>.Success(followings);

                return Result<List<UserFollowing>>.Failure("Failed to send notifications, try refresh again");
            }
            public static Notification GetNotification(NotificationDto notification, string userId)
            {
                Guid uuid = Guid.NewGuid();
                var notificationId = uuid.ToString();
                notification.NotificationId = notificationId;
                return new Notification
                {
                    Content = notification.Content,
                    Title = notification.Title,
                    NotificationId = notificationId,
                    UserId = userId,
                    SourceUserId = notification.SourceUserId,
                    ActivityId = notification.ActivityId,
                };
            }
        }
    }
}
