using Application.Core;
using Application.Interfaces;
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
    public class ReadAll
    {
        public class Command : IRequest<Result<Unit>> { }
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
                var currentUserId = _userAccessor.GetUserid();
                var unreadNotifications = await _context
                    .Notifications
                    .Where(n => n.UserId == currentUserId && !n.IsRead)
                    .ToListAsync();
                unreadNotifications.ForEach(notification => notification.IsRead = true);
                var result = await _context.SaveChangesAsync() > 0;
                
                if (result) return Result<Unit>.Success(Unit.Value);

                return Result<Unit>.Failure("Failed to update Notification Read, Try refersh page");
            }
        }
    }
}
