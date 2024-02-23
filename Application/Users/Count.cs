using Application.Core;
using Application.Interfaces;
using Application.Profiles;
using MediatR;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Users
{
    public class Count
    {
        public class Query : IRequest<Result<int>>
        {
        }
        public class Handler : IRequestHandler<Query, Result<int>>
        {
            private readonly IUserAccessor _userAccessor;
            private readonly IMediator _mediator;

            public Handler(IUserAccessor userAccessor, IMediator mediator)
            {
                _userAccessor = userAccessor;
                _mediator = mediator;
            }

            public async Task<Result<int>> Handle(Query request, CancellationToken cancellationToken)
            {
                var currentUser = _userAccessor.GetUsername();
                if (currentUser != null)
                {
                    var user = await _mediator.Send(new Details.Query { Username = currentUser });
                    if (user != null)
                    {
                        return Result<int>.Success(user.Value.UnreadMessageCount);
                    }

                }
                return Result<int>.Failure("Failed to get the Unread message count");
            }
        }
    }
}
