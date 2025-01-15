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

namespace Application.Emails
{
    public class List
    {
        public class Query : IRequest<Result<List<EmailDto>>> { }
        public class Handler : IRequestHandler<Query, Result<List<EmailDto>>>
        {
            private readonly IUserAccessor _userAccessor;
            private readonly DataContext _context;
            private readonly IMapper _mapper;

            public Handler(IUserAccessor userAccessor, DataContext context, IMapper mapper)
            {
                _userAccessor = userAccessor;
                _context = context;
                _mapper = mapper;
            }
            public async Task<Result<List<EmailDto>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var userId = _userAccessor.GetUserid();

                var userEmails = await _context.EmailAddresses
                    .Where(x => x.UserId == userId)
                    .ProjectTo<EmailDto>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                return Result<List<EmailDto>>.Success(userEmails);
            }
        }
    }
}
