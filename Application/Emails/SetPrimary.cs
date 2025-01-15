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
    public class SetPrimary
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

                var email = await _userManager.GetUserEmailAsync(user.Id, request.EmailId);
                if (email == null)
                    return Result<Unit>.Failure("Email does not exist");

                var primaryEmail = await _userManager.GetPrimaryEmailAsync(user.Id);
                if (primaryEmail == null)
                    return Result<Unit>.Failure("Bad Request");

                try
                {
                    // Unset the current primary email
                    var unsetResult = await _userManager.SetPrimaryStatus(primaryEmail, false);
                    if (!unsetResult)
                        return Result<Unit>.Failure("Failed to unset the previous primary email.");

                    // Set the new primary email
                    var setResult = await _userManager.SetPrimaryStatus(email, true);
                    if (!setResult)
                    {
                        // Rollback the previous primary email
                        await _userManager.SetPrimaryStatus(primaryEmail, true);
                        return Result<Unit>.Failure("Failed to update the primary email. Changes have been rolled back.");
                    }

                    return Result<Unit>.Success(Unit.Value);
                }
                catch (Exception ex)
                {
                    // Rollback in case of any exception
                    await _userManager.SetPrimaryStatus(primaryEmail, true);
                    return Result<Unit>.Failure($"An error occurred: {ex.Message}");
                }
            }

        }
    }
}
