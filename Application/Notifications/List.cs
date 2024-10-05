using Application.Core;
using Application.Interfaces;
using Application.ReturnDTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
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
    public class List
    {
        public class Query : IRequest<Result<PagedList<NotificationDto>>>
        {
            public PagingParams Params { get; set; }
            public bool UnRead { get; set; }
        }
        public class Handler : IRequestHandler<Query, Result<PagedList<NotificationDto>>>
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
            public async Task<Result<PagedList<NotificationDto>>> Handle(Query request, CancellationToken cancellationToken)
            {

                var user = _userAccessor.GetUserid();
                //var query = _context
                //    .Notifications
                //    .Where(x => x.UserId == user && ( request.UnRead && ))
                //    .ProjectTo<NotificationDto>(_mapper.ConfigurationProvider)
                //    .OrderByDescending(x => x.CreatedDate)
                //    .AsQueryable();

                var query = _context.Notifications
                    .Where(x => x.UserId == user)
                    .ProjectTo<NotificationDto>(_mapper.ConfigurationProvider)
                    .OrderByDescending(x => x.CreatedDate)
                    .AsQueryable();

                if (request.UnRead)
                {
                    query = query.Where(x => !x.IsRead);
                }

                //return Result<List<NotificationDto>>.Success(notifications);
                return Result<PagedList<NotificationDto>>.Success(
                    await PagedList<NotificationDto>.CreateAsync(query, request.Params.PageNumber,
                    request.Params.PageSize, request.Params.ToSkip)
                    );

            }
        }
    }
}
