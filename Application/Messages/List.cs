using Application.Conversations;
using Application.Core;
using Application.Interfaces;
using Application.ReturnDTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query.Internal;
using Microsoft.VisualBasic;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;

namespace Application.Messages
{
    public class List
    {
        public class Query : IRequest<Result<PagedList<MessageDto>>>
        {
            public int ConversationId { get; set; }
            public PagingParams Params { get; set; }
        }
        public class Handler : IRequestHandler<Query, Result<PagedList<MessageDto>>>
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
            public async Task<Result<PagedList<MessageDto>>> Handle(Query request, CancellationToken cancellationToken)
            {
                //var userName = _userAccessor.GetUsername();
                //var conversation = await _context.Conversations
                //    .Include(x => x.User1).ThenInclude(p => p.Photos)
                //    .Include(x => x.User2).ThenInclude(p => p.Photos)
                //    .Include(x => x.Messages).
                //    FirstOrDefaultAsync(x =>
                //        (x.User1.UserName == userName && x.User2.UserName == request.UserName) ||
                //        (x.User1.UserName == request.UserName && x.User2.UserName == userName)
                //    );//Modify to optimize
                var loggedInUserName = _userAccessor.GetUsername();

                //var query = _context.Messages
                //                .Where(x => x.ConversationId == request.ConversationId)
                //                .Where(x => (!x.User1Deleted || !x.User2Deleted))
                //                .OrderByDescending(x => x.MessageId) // Assuming you want to sort by MessageId, adjust as needed
                //                .ProjectTo<MessageDto>(_mapper.ConfigurationProvider)
                //                .AsQueryable();

                //var query = _context.Messages
                //    .Where(c => c.ConversationId == request.ConversationId)
                //    .Where(x =>
                //                (x.Sender.UserName == loggedInUserName && !x.User1Deleted)
                //                                            ||
                //                (x.Sender.UserName != loggedInUserName && !x.User2Deleted))
                //    .OrderByDescending(x => x.MessageId) // Assuming you want to sort by MessageId, adjust as needed
                //    .ProjectTo<MessageDto>(_mapper.ConfigurationProvider)
                //    .AsQueryable();

                /*Temporary*/
                var query = _context.Messages
                    .Include(c => c.Conversation)
                        .ThenInclude(u => u.User1)
                    .Include(c => c.Conversation)
                        .ThenInclude(u => u.User2)
                    .Where(c => c.ConversationId == request.ConversationId)
                    .Where(m =>
                                (!m.User1Deleted && m.Conversation.User1.UserName == loggedInUserName)
                                                                ||
                                (!m.User2Deleted && m.Conversation.User2.UserName == loggedInUserName))
                    .OrderByDescending(x => x.MessageId) // Assuming you want to sort by MessageId, adjust as needed
                    .ProjectTo<MessageDto>(_mapper.ConfigurationProvider)
                    .AsQueryable();

                //var messageDtos = new List<MessageDto>();
                //var scorce = query.ToList();
                //for (int i = 0; i < scorce.Count; i++)
                //{
                //    var x = scorce[i];
                //    var s1 = string.Empty;
                //    if (scorce.ElementAt(i).Content.Equals("176"))
                //    {
                //        var s = s1;
                //    }

                //    if ((x.Sender.UserName == loggedInUserName && !x.User1Deleted) || (x.Sender.UserName != loggedInUserName && !x.User2Deleted))
                //    {
                //        messageDtos.Add(x);
                //    }
                //}

                /*Temporary*/
                //var query = _context.Messages
                //    .Where(x => x.ConversationId == request.ConversationId)
                //    .Where(x => (!x.User1Deleted && x.Sender.UserName == loggedInUserName) ||
                //                (!x.User2Deleted && x.Sender.UserName != loggedInUserName))
                //    .OrderByDescending(x => x.MessageId) // Assuming you want to sort by MessageId, adjust as needed
                //    .ProjectTo<MessageDto>(_mapper.ConfigurationProvider)
                //    .AsQueryable();

                return Result<PagedList<MessageDto>>.Success(
                    await PagedList<MessageDto>.CreateAsync(query, request.Params.PageNumber,
                    request.Params.PageSize)
                    );
            }
        }
    }
}
