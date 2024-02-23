using Application.Core;
using Application.Interfaces;
using Application.ReturnDTOs;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Conversations
{
    public class List
    {
        //public class Query : IRequest<Result<List<ConversationDto>>> { }
        public class Query : IRequest<Result<PagedList<ConversationDto>>>
        {
            public PagingParams Params { get; set; }
            public string Id { get; set; }
        }
        public class Handler : IRequestHandler<Query, Result<PagedList<ConversationDto>>>
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
            public async Task<Result<PagedList<ConversationDto>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var currentUser = _userAccessor.GetUsername();
                var currentUserId = _userAccessor.GetUserid();
                try
                {
                    var query = _context.Conversations
                        .Include(u => u.User1).ThenInclude(u => u.Photos)
                        .Include(u => u.User2).ThenInclude(u => u.Photos)
                        .Where(x => (x.User1.UserName == currentUser && !x.User1Deleted) || (x.User2.UserName == currentUser && !x.User2Deleted))
                        .Include(c => c.Messages
                            .Where(x =>
                                    (!x.User1Deleted && x.Conversation.User1.UserName == currentUser)
                                                            ||
                                    (!x.User2Deleted && x.Conversation.User2.UserName == currentUser)
                                )
                            .OrderByDescending(m => m.MessageId)
                            .Take(1)
                        )
                        .AsQueryable();

                    var pagedList = await PagedList<ConversationDto>.CreateAsync<Conversation, ConversationDto>(query, _mapper, request.Params.PageNumber, request.Params.PageSize);

                    if (!string.IsNullOrEmpty(request.Id) && !DoesConversationExist(pagedList, request.Id, currentUserId))
                    {
                        var user = await _context.Users.FindAsync(request.Id); // Change later
                        if (user != null)
                        {
                            var result = await _mediator.Send(new Details.Query { RecipientUserName = user.UserName });
                            if (result.IsSuccess)
                            {
                                pagedList.Add(result.Value);
                            }
                        }
                    }

                    await GetUnreadCountMessageCountAndId(pagedList, _mediator);

                    return Result<PagedList<ConversationDto>>.Success(pagedList);
                }
                catch (Exception ex)
                {
                    return Result<PagedList<ConversationDto>>.Failure("An error occurred while fetching conversations: " + ex.Message);
                }

            }

            public static bool DoesConversationExist(PagedList<ConversationDto> conversations, string receivedUserId, string currentUserId)
            {
                foreach (var conversation in conversations)
                {
                    if ((conversation.CurrentUser.Id == receivedUserId && conversation.OtherUser.Id == currentUserId)
                        || (conversation.CurrentUser.Id == currentUserId && conversation.OtherUser.Id == receivedUserId))
                        return true;
                }
                return false;
            }

            public static async Task<int> GetUnreadCountMessageCountAndId(PagedList<ConversationDto> conversationDtos, IMediator mediator)
            {
                foreach (var conversation in conversationDtos)
                {
                    var result = await mediator.Send(new Profiles.Details.Query { Username = conversation.OtherUser.UserName });
                    if (result.IsSuccess)
                    {
                        conversation.UnreadMessageCount = result.Value.UnreadMessageCount;
                        conversation.FirstUnreadMessageId = result.Value.FirstUnreadMessageId;
                    }
                }
                return 0;
            }
        }
    }
}
