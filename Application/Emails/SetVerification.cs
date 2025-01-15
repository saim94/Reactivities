using Application.Core;
using Application.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Emails
{
    public class SetVerification
    {
        public class Command : IRequest<Result<Unit>>
        {
            public int EmailId { get; set; }
        }
        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly IUserManager _userManager;
            private readonly IUserAccessor _userAccessor;

            public Handler(IUserManager userManager, IUserAccessor userAccessor)
            {
                _userManager = userManager;
                _userAccessor = userAccessor;
            }
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {

                if (request.EmailId <= 0)
                    return Result<Unit>.Failure("Invalid email");

                // Get the currently authenticated user
                var user = await _userManager.GetUserAsync(_userAccessor.GetUsername());
                if (user == null)
                    return Result<Unit>.Unauthorized("User not found.");

                var email = await _userManager.GetUserEmailAsync(_userAccessor.GetUserid(), request.EmailId);
                if (email == null)
                    return Result<Unit>.Failure("Email does not exist");

                var result = await _userManager.VerifyEmailAsync(email.Email);

                if (!result) return Result<Unit>.Failure("Failed to verify email, please try again");

                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}
