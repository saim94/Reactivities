using Application.Core;
using Domain;
using MediatR;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Conversations
{
    public class Create
    {
        public class Command : IRequest<Result<Conversation>>
        {
            public string User1Id { get; set; }
            public string User2Id { get; set; }
        }
        public class Handler : IRequestHandler<Command, Result<Conversation>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Result<Conversation>> Handle(Command request, CancellationToken cancellationToken)
            {
                var conversation = new Conversation
                {
                    User1_Id = request.User1Id,
                    User2_Id = request.User2Id,
                    Messages = new List<Message>()
                };

                _context.Conversations.Add(conversation);

                var result = await _context.SaveChangesAsync() > 0;
                if (result) return Result<Conversation>.Success(conversation);

                return Result<Conversation>.Failure("Problem starting a new coversation, please try again.");
            }
        }
    }
}
