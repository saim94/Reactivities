using Application.Core;
using Application.Interfaces;
using Application.ReturnDTOs;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities
{
    public class UpdateAttendance
    {
        public class Command : IRequest<Result<NotificationDto>>
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<NotificationDto>>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;
            private readonly IMapper _mapper;

            public Handler(DataContext context, IUserAccessor userAccessor, IMapper mapper)
            {
                _context = context;
                _userAccessor = userAccessor;
                _mapper = mapper;
            }

            public async Task<Result<NotificationDto>> Handle(Command request, CancellationToken cancellationToken)
            {
                var activity = await _context.Activities
                    .Include(a => a.Attendees).ThenInclude(a => a.AppUser)
                    .SingleOrDefaultAsync(x => x.Id == request.Id);

                if (activity == null) return null;

                var user = await _context.Users.Include(u => u.Photos).FirstOrDefaultAsync(x =>
                x.UserName == _userAccessor.GetUsername());

                if (user == null) return null;

                var hostUsername = activity.Attendees.FirstOrDefault(x => x.IsHost)?.AppUser?.UserName;

                var attendance = activity.Attendees.FirstOrDefault(x => x.AppUser.UserName == user.UserName);

                var notification = new Notification();

                if (attendance != null && hostUsername == user.UserName)
                {
                    var action = (activity.IsCancelled) ? "Scheduled the activity " : "Cancelled the activity ";
                    notification = new Notification(action + activity.Title,
                        action, user.Id, activity.Id.ToString(), user);
                    activity.IsCancelled = !activity.IsCancelled;
                }

                if (attendance != null && hostUsername != user.UserName)
                {
                    activity.Attendees.Remove(attendance);
                }

                if (attendance == null)
                {
                    attendance = new ActivityAttendee
                    {
                        AppUser = user,
                        Activity = activity,
                        IsHost = false
                    };
                    activity.Attendees.Add(attendance);
                    notification = new Notification(" Is going to " + activity.Title,
                        "Going to ", user.Id, activity.Id.ToString(), user);
                }

                var notificationDto = _mapper.Map<Notification, NotificationDto>(notification);

                var result = await _context.SaveChangesAsync() > 0;

                return result ? Result<NotificationDto>.Success(notificationDto) : Result<NotificationDto>.Failure("Problem updating attendance");
            }
        }
    }
}
