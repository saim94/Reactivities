using Application.Core;
using Application.Interfaces;
using Application.ReturnDTOs;
using AutoMapper.QueryableExtensions;
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
    public class UnreadNotificationsCount
    {
        public class Query : IRequest<Result<int>> { }
        public class Handler : IRequestHandler<Query, Result<int>>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                _context = context;
                _userAccessor = userAccessor;
            }
            public async Task<Result<int>> Handle(Query request, CancellationToken cancellationToken)
            {
                var user = _userAccessor.GetUserid();

                int unreadCount;
                try
                {
                    unreadCount = await _context.Notifications
                                                .Where(x => x.UserId == user && !x.IsRead)
                                                .CountAsync();
                    return Result<int>.Success(unreadCount);
                }
                catch (Exception)
                {
                    return Result<int>.Failure("Something failed try refresh page");
                }
            }
        }
    }
}
