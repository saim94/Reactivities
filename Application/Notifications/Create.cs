using Application.Core;
using Application.ReturnDTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Notifications
{
    public class Create
    {
        public class Command : IRequest<Result<List<ActivityAttendee>>>
        {
            public List<NotificationDto> NotificationsList { get; set; }
            public Guid ActivityId { get; set; }
        }
        public class Handler : IRequestHandler<Command, Result<List<ActivityAttendee>>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Result<List<ActivityAttendee>>> Handle(Command request, CancellationToken cancellationToken)
            {

                var attendees = _context.ActivityAttendees
                    .Include(a => a.AppUser).ThenInclude(a => a.Photos)
                    .Where(x => x.ActivityId == request.ActivityId).ToList();

                if (attendees.Count > 0)
                {
                    foreach (var attendee in attendees)
                    {
                        foreach (var noti in request.NotificationsList)
                        {
                            //_context.Notifications.Add(noti);
                            if (!attendee.IsHost)
                            {
                                //attendee.AppUser.Notifications.Add(GetNotification(newNoti));

                                _context.Notifications.Add(GetNotification(noti, attendee.AppUserId));
                            }
                        }
                    }
                    await _context.SaveChangesAsync();
                }

                return Result<List<ActivityAttendee>>.Success(attendees);
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
