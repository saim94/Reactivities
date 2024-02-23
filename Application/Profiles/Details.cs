using Application.Core;
using Application.Interfaces;
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

namespace Application.Profiles
{
    public class Details
    {
        public class Query : IRequest<Result<Profile>>
        {
            public string Username { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<Profile>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IMapper mapper, IUserAccessor userAccessor)
            {
                _context = context;
                _mapper = mapper;
                _userAccessor = userAccessor;
            }
            public async Task<Result<Profile>> Handle(Query request, CancellationToken cancellationToken)
            {
                var currentUserName = _userAccessor.GetUsername();
                var user = await _context.Users
                    .ProjectTo<Profile>(_mapper.ConfigurationProvider,
                        new { currentUsername = currentUserName })
                    .SingleOrDefaultAsync(x => x.Username == request.Username);

                user.UnreadMessageCount = await CalculateUnreadMessageCount(user, currentUserName, request.Username, _context);

                if (user == null) return null;

                return Result<Profile>.Success(user);
            }

            private static async Task<int> CalculateUnreadMessageCount(Profile profile, string currentUserName, string receivedUsername, DataContext _context)
            {
                var unReadMessageCount = 0;
                var firstUnreadMessageId = 0;
                if (receivedUsername == currentUserName)
                {
                    var conversations = await _context.Conversations
                        .Include(u => u.User1)
                        .Include(u => u.User2)
                        .Where(x => (x.User1.UserName == currentUserName && !x.User1Deleted) || (x.User2.UserName == currentUserName && !x.User2Deleted))
                        .Include(c => c.Messages
                            .Where(x =>
                                    (!x.User1Deleted && x.Conversation.User1.UserName == currentUserName)
                                                            ||
                                    (!x.User2Deleted && x.Conversation.User2.UserName == currentUserName)
                                )
                            .OrderByDescending(m => m.MessageId)
                        )
                        .ToListAsync();


                    //var conversations = user1.Conversations;

                    if (conversations != null)
                        foreach (var conversation in conversations)
                        {
                            if (conversation.Messages != null)
                            {
                                var messages = conversation.Messages
                                .Where(m => m.Sender.UserName != currentUserName && !m.IsRead).ToList();
                                unReadMessageCount += messages.Count;
                            }

                        }

                }
                else
                {
                    var conversation = await _context.Conversations
                                        .Include(x => x.User1).ThenInclude(p => p.Photos)
                                        .Include(x => x.User2).ThenInclude(p => p.Photos)
                                        .Include(x => x.Messages)
                                        .FirstOrDefaultAsync(x =>
                                            (x.User1.UserName == currentUserName && x.User2.UserName == receivedUsername) ||
                                            (x.User1.UserName == receivedUsername && x.User2.UserName == currentUserName)
                                        );

                    if (conversation != null)
                    {
                        if (conversation.Messages != null)
                        {
                            var messages = conversation.Messages
                                .Where(m => m.Sender.UserName != currentUserName && !m.IsRead).OrderBy(m => m.MessageId).ToList();
                            if (messages.Count > 0)
                                firstUnreadMessageId = messages[0].MessageId;
                            unReadMessageCount = messages.Count;
                        }

                    }

                }
                profile.UnreadMessageCount = unReadMessageCount;
                profile.FirstUnreadMessageId = firstUnreadMessageId;
                return unReadMessageCount;
            }
        }
    }
}
