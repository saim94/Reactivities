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

namespace Application.Messages
{
    public class Delete
    {
        public class Command : IRequest<Result<Unit>>
        {
            public string MessageId { get; set; }
            public string ConversationId { get; set; }
            public string Method { get; set; }
            public string Recipient { get; set; }
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
                var conversation = await _context.Conversations
                    .Include(x => x.Messages)
                    .Include(x => x.User1)
                    .Include(x => x.User2)
                    .FirstOrDefaultAsync(x => x.ConversationId == int.Parse(request.ConversationId));
                var message = conversation.Messages.FirstOrDefault(m => m.MessageId == int.Parse(request.MessageId));
                var currentUser = _userAccessor.GetUsername();
                if (conversation != null)
                {
                    bool isSender = (message.Sender.UserName == currentUser) ? true : false;

                    if (isSender) conversation.Messages.Remove(message);
                    else _ = (conversation.User1.UserName == currentUser) ? message.User1Deleted = true : message.User2Deleted = true;

                    //if (conversation.Messages.Count == 0) _context.Conversations.Remove(conversation);
                    if (conversation.Messages.All(m => m.User1Deleted)) conversation.User1Deleted = true;
                    else if (conversation.Messages.All(m => m.User2Deleted)) conversation.User2Deleted = true;

                    if (conversation.User1Deleted && conversation.User2Deleted || conversation.Messages.Count == 0)
                        _context.Conversations.Remove(conversation);
                }
                var result = await _context.SaveChangesAsync() > 0;
                if (result) return Result<Unit>.Success(Unit.Value);

                return Result<Unit>.Failure("Problem accured, try again");
            }
        }
    }
}
