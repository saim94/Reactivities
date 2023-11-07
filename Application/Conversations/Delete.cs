using Application.Core;
using Application.Interfaces;
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
    public class Delete
    {
        public class Command : IRequest<Result<Unit>>
        {
            public string ConversationId { get; set; }
        }
        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                _context = context;
                _userAccessor = userAccessor;
            }
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                //var currentUser = _context.Users.FirstOrDefaultAsync(x => x.UserName == _userAccessor.GetUsername());
                //var otherUser = _context.Users.FirstOrDefaultAsync(x => x.UserName == request.UserName);

                var conversation = await _context
                    .Conversations
                    .Include(u => u.User1)
                    .Include(u => u.User2)
                    .Include(m => m.Messages)
                    .FirstOrDefaultAsync(x => x.ConversationId == int.Parse(request.ConversationId));

                if (conversation != null)
                {
                    var user1 = conversation.User1;
                    var user2 = conversation.User2;

                    bool isCurrentUserUser1 = (user1 != null && user1.UserName == _userAccessor.GetUsername());
                    bool isCurrentUserUSer2 = (user2 != null && user2.UserName == _userAccessor.GetUsername());

                    if (isCurrentUserUser1)
                    {
                        conversation.User1Deleted = true;
                        conversation.Messages.ForEach(m => m.User1Deleted = true);
                    }
                    else if (isCurrentUserUSer2)
                    {
                        conversation.User2Deleted = true;
                        conversation.Messages.ForEach(m => m.User2Deleted = true);
                    }

                    if (conversation.User1Deleted && conversation.User2Deleted)
                    {
                        _context.Messages.RemoveRange(conversation.Messages);
                        _context.Conversations.Remove(conversation);
                    }
                }

                var result = await _context.SaveChangesAsync() > 0;

                if (result) return Result<Unit>.Success(Unit.Value);

                return Result<Unit>.Failure("Problem deleting conversation, Please try again");
            }
        }
    }
}
