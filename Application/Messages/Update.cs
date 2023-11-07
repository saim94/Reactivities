using Application.Core;
using Domain;
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
    public class Update // For Updating Message Read 
    {
        public class Command : IRequest<Result<Unit>>
        {
            public string MessageId { get; set; }
            public string ConversationId { get; set; }
            public string SenderName { get; set; }
        }
        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var conversation = await _context.Conversations
                    .Include(m => m.Messages).ThenInclude(s => s.Sender)
                    .FirstOrDefaultAsync(x => x.ConversationId == int.Parse(request.ConversationId));

                if (conversation == null) return null;

                var m = conversation.Messages
                    .TakeWhile(m => m.MessageId <= int.Parse(request.MessageId) && m.Sender.UserName == request.SenderName).ToList();

                conversation.Messages
                    .Where(m => m.MessageId <= int.Parse(request.MessageId) && m.Sender.UserName == request.SenderName)
                    .ToList().ForEach(m => m.IsRead = true);

                //updatedMessages.ForEach(m => m.IsRead = true);

                var result = await _context.SaveChangesAsync() > 0;

                if (result) return Result<Unit>.Success(Unit.Value);

                return Result<Unit>.Failure("Failed to update Message Status, Try refersh page");
            }
        }
    }
}
