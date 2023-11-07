//using Application.Core;
//using Application.Interfaces;
//using Application.ReturnDTOs;
//using AutoMapper;
//using AutoMapper.QueryableExtensions;
//using Domain;
//using MediatR;
//using Microsoft.EntityFrameworkCore;
//using Persistence;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;
//using System.Xml.Linq;

//namespace Application.Conversations
//{
//    public class DetailsPaged
//    {
//        public class Query : IRequest<Result<ConversationDto>>
//        {
//            public string RecipientUserName { get; set; }
//        }
//        public class Handler : IRequestHandler<Query, Result<ConversationDto>>
//        {
//            private readonly DataContext _context;
//            private readonly IMediator _mediator;
//            private readonly IUserAccessor _userAccessor;
//            private readonly IMapper _mapper;

//            public Handler(DataContext context, IMediator mediator, IUserAccessor userAccessor, IMapper mapper)
//            {
//                _context = context;
//                _mediator = mediator;
//                _userAccessor = userAccessor;
//                _mapper = mapper;
//            }
//            public async Task<Result<ConversationDto>> Handle(Query request, CancellationToken cancellationToken)
//            {
//                var userName = _userAccessor.GetUsername();
//                var conversation = await _context.Conversations
//                    .Include(x => x.User1).ThenInclude(p=>p.Photos)
//                    .Include(x => x.User2).ThenInclude(p => p.Photos)
//                    .Include(x => x.Messages).
//                    FirstOrDefaultAsync(x =>
//                        (x.User1.UserName == userName && x.User2.UserName == request.RecipientUserName) ||
//                        (x.User1.UserName == request.RecipientUserName && x.User2.UserName == userName)
//                    );
//                if (conversation != null)
//                {
//                    var tempMessage = new List<Message>();

//                    bool isCurrentUserUser1 = (conversation.User1 != null && conversation.User1.UserName == userName);
//                    bool isCurrentUserUser2 = (conversation.User2 != null && conversation.User2.UserName == userName);
//                    if (isCurrentUserUser1 && conversation.User1Deleted || isCurrentUserUser2 && conversation.User2Deleted)
//                    {
//                        tempMessage.AddRange(conversation.Messages);
//                        conversation.Messages.Clear();
//                    }
//                    else
//                    {
//                        conversation.Messages = conversation.Messages
//                            .Where(x => (!x.User1Deleted && isCurrentUserUser1) || (!x.User2Deleted && isCurrentUserUser2))
//                            .ToList();


//                    }
//                }
//                else conversation = new Conversation();

//                var messages = conversation.Messages
//                .OrderByDescending(x => x.MessageId) // Assuming you want to sort by MessageId, adjust as needed
//                .AsQueryable();

//                var pagedMessages = await PagedList<MessageDto>.CreateAsync(messages, request.PageNumber, request.PageSize);

//                // Create the ConversationDto
//                var conversationDto = _mapper.Map<Conversation, ConversationDto>(conversation);
//                conversationDto.Messages = pagedMessages; // Assign the paged list of messages to the ConversationDto

//                return Result<ConversationDto>.Success(conversationDto);
//            }
//        }
//    }
//}
