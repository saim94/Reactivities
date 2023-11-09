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
using System.Xml.Linq;

namespace Application.Conversations
{
    public class Details
    {
        public class Query : IRequest<Result<ReturnType<ConversationDto>>>
        {
            public string RecipientUserName { get; set; }
        }
        public class Handler : IRequestHandler<Query, Result<ReturnType<ConversationDto>>>
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
            public async Task<Result<ReturnType<ConversationDto>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var userName = _userAccessor.GetUsername();
                var conversation = await _context.Conversations
                    .Include(x => x.User1).ThenInclude(p => p.Photos)
                    .Include(x => x.User2).ThenInclude(p => p.Photos)
                    .Include(x => x.Messages).
                    FirstOrDefaultAsync(x =>
                        (x.User1.UserName == userName && x.User2.UserName == request.RecipientUserName) ||
                        (x.User1.UserName == request.RecipientUserName && x.User2.UserName == userName)
                    );//Modify to optimize
                if (conversation != null)
                {
                    var tempMessage = new List<Message>();

                    bool isCurrentUserUser1 = (conversation.User1 != null && conversation.User1.UserName == userName);
                    bool isCurrentUserUser2 = (conversation.User2 != null && conversation.User2.UserName == userName);
                    if (isCurrentUserUser1 && conversation.User1Deleted || isCurrentUserUser2 && conversation.User2Deleted)
                    {
                        tempMessage.AddRange(conversation.Messages);
                        conversation.Messages.Clear();
                    }
                    else
                    {
                        conversation.Messages = conversation.Messages
                            .Where(x => (!x.User1Deleted && isCurrentUserUser1) || (!x.User2Deleted && isCurrentUserUser2))
                            .OrderByDescending(x => x.MessageId) // Assuming you want to sort by MessageId, adjust as needed
                            .ToList();
                    }
                }
                else conversation = new Conversation();

                conversation = new Conversation();

                var conversationDto = _mapper.Map<Conversation, ConversationDto>(conversation);

                //return Result<PagedList<MessageDto>>.Success(
                //            await PagedList<MessageDto>.CreateAsync(query, request.Params.PageNumber,
                //            request.Params.PageSize)
                //            );

                return Result<ReturnType<ConversationDto>>.Success(ReturnType<ConversationDto>.Create(conversationDto, 1, 10));
            }
        }
    }
}
