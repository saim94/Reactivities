using Application.Core;
using Application.Interfaces;
using Application.ReturnDTOs;
using AutoMapper;
using Domain;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Activities
{
    public class Edit
    {
        public class Command : IRequest<Result<List<Notification>>>
        {
            public Activity Activity { get; set; }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.Activity).SetValidator(new ActivityValidator());
            }
        }

        public class Handler : IRequestHandler<Command, Result<List<Notification>>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;
            private readonly IUserAccessor _userAccessor;

            //private readonly INotificationHub _notificationHub;

            public Handler(DataContext context, IMapper mapper, IUserAccessor userAccessor)
            {
                _context = context;
                _mapper = mapper;
                _userAccessor = userAccessor;
            }

            public async Task<Result<List<Notification>>> Handle(Command request, CancellationToken cancellationToken)
            {
                var currentUserId = _userAccessor.GetUserid();
                var currentUser = _context
                                    .Users
                                    .Include(u => u.Photos)
                                    .FirstOrDefault(x => x.Id == currentUserId);
                var activity = await _context.Activities.FindAsync(request.Activity.Id);

                if (activity == null) return null;

                var notifications = GetNotificationList(activity, request.Activity, currentUser);

                //var notificationDtos = _mapper.Map<List<Notification>, List<NotificationDto>>(notifications);
                _mapper.Map(request.Activity, activity);

                var result = await _context.SaveChangesAsync() > 0;

                if (!result) return Result<List<Notification>>.Failure("Failed to update activity");

                return Result<List<Notification>>.Success(notifications);
            }

            private static List<Notification> GetNotificationList(Activity activitySource, Activity activityDestination, AppUser currentUser)
            {
                var notifications = new List<Notification>();
                if (activitySource.City != activityDestination.City)
                {
                    var content = "Changed the event  " + activitySource.Title + " City from " + activitySource.City + " to " + activityDestination.City;
                    notifications.Add(new Notification(content, "Changed the event City", currentUser.Id, activitySource.Id.ToString(), currentUser));
                    //list.Add("Changed the event City from " + activitySource.City + " to " + activityDestination.City);
                }
                else if (activitySource.Category != activityDestination.Category)
                {
                    var content = "Changed the event " + activitySource.Title + " Category from " + activitySource.Category + " to " + activityDestination.Category;
                    notifications.Add(new Notification(content, "Changed the event Category", currentUser.Id, activitySource.Id.ToString(), currentUser));
                    //list.Add("Changed the event Category from " + activitySource.Category + " to " + activityDestination.Category);
                }
                else if (activitySource.Date != activityDestination.Date)
                {
                    var content = "Changed the event " + activitySource.Title + " Date/Time from " + activitySource.Date + " to " + activityDestination.Date;
                    notifications.Add(new Notification(content, "Changed the event Date/Time", currentUser.Id, activitySource.Id.ToString(), currentUser));
                    //list.Add("Changed the event Date/Time from " + activitySource.Date + " to " + activityDestination.Date);
                }
                else if (activitySource.Description != activityDestination.Description)
                {
                    var content = "Changed the event " + activitySource.Title + " Description to " + activityDestination.Description;
                    notifications.Add(new Notification(content, "Changed the event Description", currentUser.Id, activitySource.Id.ToString(), currentUser));
                    //list.Add("Changed the event Description to " + activityDestination.Description);
                }
                else if (activitySource.Title != activityDestination.Title)
                {
                    var content = "Changed the event Name to " + activityDestination.Title;
                    notifications.Add(new Notification(content, "Changed the event Name", currentUser.Id, activitySource.Id.ToString(), currentUser));
                    //list.Add("Changed the event Name to " + activityDestination.Title);
                }
                else if (activitySource.Venue != activityDestination.Venue)
                {
                    var content = "Changed the event " + activitySource.Title + " Venue from " + activitySource.Venue + " to " + activityDestination.Venue;
                    notifications.Add(new Notification(content, "Changed the event Venue", currentUser.Id, activitySource.Id.ToString(), currentUser));
                    //list.Add("Changed the event Venue from " + activitySource.Venue + " to " + activityDestination.Venue);
                }
                return notifications;
            }

        }
    }
}
