using Application.Core;
using Application.Interfaces;
using Application.ReturnDTOs;
using AutoMapper;
using Domain;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Messages
{
    public class Create
    {
        public class Command : IRequest<Result<MessageDto>>
        {
            public string RecipientUserName { get; set; }
            public string MessageContent { get; set; }
            public string ConnectionId { get; set; }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.MessageContent).NotEmpty();
            }
        }

        public class Handler : IRequestHandler<Command, Result<MessageDto>>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;
            private readonly IMediator _mediator;
            private readonly IMapper _mapper;

            public Handler(DataContext context, IUserAccessor userAccessor, IMediator mediator, IMapper mapper)
            {
                _context = context;
                _userAccessor = userAccessor;
                _mediator = mediator;
                _mapper = mapper;
            }

            public async Task<Result<MessageDto>> Handle(Command request, CancellationToken cancellationToken)
            {
                var sender = await _context.Users.Include(p => p.Photos)
                    .Include(c => c.Conversations).ThenInclude(x => x.Messages)
                    .FirstOrDefaultAsync(x => x.UserName == _userAccessor.GetUsername());
                var recipient = await _context.Users.Include(p => p.Photos)
                    .Include(c => c.Conversations).ThenInclude(x => x.Messages)
                    .FirstOrDefaultAsync(x => x.UserName == request.RecipientUserName);

                if (sender == null) return null;

                var conversationSender = sender.Conversations.FirstOrDefault(x => x.User1_Id == recipient.Id || x.User2_Id == recipient.Id);
                var conversationRecipient = recipient.Conversations.FirstOrDefault(x => x.User1_Id == sender.Id || x.User2_Id == sender.Id);
                var conversation = new Conversation();

                if (conversationSender == null && conversationRecipient == null)
                {
                    var createResult = await _mediator.Send(new Conversations.Create.Command { User1Id = sender.Id, User2Id = recipient.Id });
                    if (createResult.Value != null)
                        conversation = createResult.Value;
                }
                else if (conversationSender == null)
                {
                    conversation = conversationRecipient;
                    //conversation.Messages = conversation.Messages.Where(x => !x.User2Deleted && !x.User1Deleted).ToList();
                }
                else if (conversationRecipient == null)
                {
                    conversation = conversationSender;
                    //conversation.Messages = conversation.Messages.Where(x => !x.User1Deleted && !x.User2Deleted).ToList();
                }

                if (conversation.User1Deleted) conversation.User1Deleted = false;
                if (conversation.User2Deleted) conversation.User2Deleted = false;

                var message = new Message
                {
                    Content = request.MessageContent,
                    Sender = sender,
                    SentAt = DateTime.UtcNow,
                    IsRead = false,
                };


                conversation.Messages.Add(message);

                var result = await _context.SaveChangesAsync() > 0;

                //conversation.Messages = conversation.Messages.Where(x => !x.User2Deleted && !x.User1Deleted).ToList();

                var newMessage = conversation.Messages.Last();
                if (result) return Result<MessageDto>.Success(_mapper.Map<Message, MessageDto>(newMessage));

                return Result<MessageDto>.Failure("Problem sending message");
            }
        }
    }
}
