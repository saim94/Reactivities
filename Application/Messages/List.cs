using Application.Core;
using Application.Interfaces;
using Application.ReturnDTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query.Internal;
using Microsoft.VisualBasic;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;

namespace Application.Messages
{
    public class List
    {
        public class Query : IRequest<Result<PagedList<MessageDto>>>
        {
            public int ConversationId { get; set; }
            public PagingParams Params { get; set; }
        }
        public class Handler : IRequestHandler<Query, Result<PagedList<MessageDto>>>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;
            private readonly IMapper _mapper;
            private readonly IMediator _mediator;

            public Handler(DataContext context, IUserAccessor userAccessor, IMapper mapper, IMediator mediator)
            {
                _context = context;
                _userAccessor = userAccessor;
                _mapper = mapper;
                _mediator = mediator;
            }
            public async Task<Result<PagedList<MessageDto>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var loggedInUserName = _userAccessor.GetUsername();

                var query = _context.Messages
                    .Include(c => c.Conversation)
                        .ThenInclude(u => u.User1)
                    .Include(c => c.Conversation)
                        .ThenInclude(u => u.User2)
                    .Where(c => c.ConversationId == request.ConversationId)
                    .Where(m =>
                                (!m.User1Deleted && m.Conversation.User1.UserName == loggedInUserName)
                                                                ||
                                (!m.User2Deleted && m.Conversation.User2.UserName == loggedInUserName))
                    .OrderByDescending(x => x.MessageId) // Assuming you want to sort by MessageId, adjust as needed
                    .ProjectTo<MessageDto>(_mapper.ConfigurationProvider)
                    .AsQueryable();

                return Result<PagedList<MessageDto>>.Success(
                    await PagedList<MessageDto>.CreateAsync(query, request.Params.PageNumber,
                    request.Params.PageSize)
                    );
            }
        }
    }
}
