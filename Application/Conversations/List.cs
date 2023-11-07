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

namespace Application.Conversations
{
    public class List
    {
        public class Query : IRequest<Result<List<ConversationDto>>> { }
        public class Handler : IRequestHandler<Query, Result<List<ConversationDto>>>
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
            public async Task<Result<List<ConversationDto>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var currentUser = _userAccessor.GetUsername();

                var conversations = await _context.Conversations
                    .Include(x => x.User1)
                    .Include(x => x.User2)
                    .Include(x => x.Messages)
                    //.Where(x => (x.User1.UserName == currentUser) || (x.User2.UserName == currentUser))
                    .Where(u =>
                        (u.User1.UserName == currentUser && !u.User1Deleted) || (u.User2.UserName == currentUser && !u.User2Deleted)
                    )
                    //.ProjectTo<ConversationDto>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                foreach (var conversation in conversations)
                {
                    var user1 = conversation.User1;
                    var user2 = conversation.User2;
                    bool isCurrentUserUser1 = (conversation.User1 != null && conversation.User1.UserName == currentUser);
                    bool isCurrentUserUser2 = (conversation.User2 != null && conversation.User2.UserName == currentUser);

                    conversation.Messages = conversation.Messages
                        .Where(x => !x.User1Deleted || isCurrentUserUser2)
                        .Where(x => !x.User2Deleted || isCurrentUserUser1)
                        .ToList();
                }

                var consersionDtos = _mapper.Map<List<Conversation>, List<ConversationDto>>(conversations);

                return Result<List<ConversationDto>>.Success(consersionDtos);
            }
        }
    }
}
