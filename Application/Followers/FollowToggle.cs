using Application.Core;
using Application.Interfaces;
using Application.ReturnDTOs;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Followers
{
    public class FollowToggle
    {
        public class Command : IRequest<Result<NotificationDto>>
        {
            public string TargetUsername { get; set; }
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
                var observer = await _context.Users.Include(u => u.Photos).FirstOrDefaultAsync(x =>
                x.UserName == _userAccessor.GetUsername());

                var target = await _context.Users.FirstOrDefaultAsync(x =>
                x.UserName == request.TargetUsername);

                var notification = new Notification();

                if (target == null) return null;

                var following = await _context.UserFollowings.FindAsync(observer.Id, target.Id);

                if (following == null)
                {
                    following = new UserFollowing
                    {
                        Observer = observer,
                        Target = target
                    };

                    _context.UserFollowings.Add(following);
                    notification = new Notification(" Started following You",
                        " following ", observer.Id, "", observer);
                    notification.UserId = target.Id;
                    notification.User = target;
                }
                else
                {
                    _context.UserFollowings.Remove(following);
                }

                var success = await _context.SaveChangesAsync() > 0;

                var notificationDto = _mapper.Map<Notification, NotificationDto>(notification);

                if (success) return Result<NotificationDto>.Success(notificationDto);

                return Result<NotificationDto>.Failure("Failed to update following");
            }
        }
    }
}
