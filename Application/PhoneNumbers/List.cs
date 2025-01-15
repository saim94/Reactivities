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

namespace Application.PhoneNumbers
{
    public class List
    {
        public class Query : IRequest<Result<List<PhoneDto>>> { }
        public class Handler : IRequestHandler<Query, Result<List<PhoneDto>>>
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
            public async Task<Result<List<PhoneDto>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var userId = _userAccessor.GetUserid();

                var phoneNumbers = await _context.PhoneNumbers
                    .Where(x => x.UserId == userId)
                    .ProjectTo<PhoneDto>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                return Result<List<PhoneDto>>.Success(phoneNumbers);
            }
        }
    }
}
