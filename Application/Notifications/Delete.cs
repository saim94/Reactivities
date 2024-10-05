using Application.Core;
using Application.Interfaces;
using AutoMapper;
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
    public class Delete
    {
        public class Command : IRequest<Result<Unit>>
        {
            public string NotificationId { get; set; }
        }
        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                _context = context;
                _userAccessor = userAccessor;
            }
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var user = _context.Users
                    .Include(u => u.Notifications)
                    .FirstOrDefault(x => x.UserName == _userAccessor.GetUsername());

                if (user == null) return null;

                var notification = user.Notifications.FirstOrDefault(n => n.NotificationId == request.NotificationId);

                if (notification == null) return null;

                user.Notifications.Remove(notification);

                var result = await _context.SaveChangesAsync() > 0;

                if (result) return Result<Unit>.Success(Unit.Value);


                return Result<Unit>.Failure("Failed to remove notification, please try again");
            }
        }
    }
}
