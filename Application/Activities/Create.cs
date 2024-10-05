using Application.Core;
using Application.Interfaces;
using Application.ReturnDTOs;
using AutoMapper;
using Domain;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata.Ecma335;
using System.Text;
using System.Threading.Tasks;

namespace Application.Activities
{
    public class Create
    {
        public class Command : IRequest<Result<NotificationDto>>
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

                var user = await _context.Users
                    .Include(u => u.Photos)
                    .FirstOrDefaultAsync(x => x.UserName == _userAccessor.GetUsername());

                var attendee = new ActivityAttendee
                {
                    AppUser = user,
                    Activity = request.Activity,
                    IsHost = true
                };

                request.Activity.Attendees.Add(attendee);

                _context.Activities.Add(request.Activity);
                var result = await _context.SaveChangesAsync() > 0;

                var notification = new Notification("Started an activity " + request.Activity.Title,
                    "Started an activity", user.Id, request.Activity.Id.ToString(), user);

                var notificationDto = _mapper.Map<Notification, NotificationDto>(notification);

                if (!result) return Result<NotificationDto>.Failure("Failed to create Activity");

                return Result<NotificationDto>.Success(notificationDto);
            }
        }
    }
}
