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
    public class Delete
    {
        public class Command : IRequest<Result<Unit>>
        {
            public int EmailId { get; set; }
        }
        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly IUserAccessor _userAccessor;
            private readonly IUserManager _userManager;

            public Handler(IUserAccessor userAccessor, IUserManager userManager)
            {
                _userAccessor = userAccessor;
                _userManager = userManager;
            }
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                if (request.EmailId <= 0)
                    return Result<Unit>.Failure("Invalid email");

                // Get the currently authenticated user
                var user = await _userManager.GetUserAsync(_userAccessor.GetUsername());
                if (user == null)
                    return Result<Unit>.Unauthorized("User not found.");
                //// Validate email format
                //if (!IsValidEmail(email))
                //    return BadRequest("Invalid email format.");

                var existingEmail = await _userManager.GetUserEmailAsync(_userAccessor.GetUserid(), request.EmailId);
                if (existingEmail == null)
                    return Result<Unit>.Failure("Email does not exist");

                if (existingEmail.IsPrimary) return Result<Unit>.Failure("Cannot delete the primary email address");

                var result = await _userManager.DeleteEmailAsync(existingEmail);

                if (result) return Result<Unit>.Success(Unit.Value);

                return Result<Unit>.Failure("Failed to delete email, please try again");
            }
        }
    }
}
