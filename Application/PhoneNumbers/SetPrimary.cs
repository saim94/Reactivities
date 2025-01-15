using Application.Core;
using Application.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.PhoneNumbers
{
    public class SetPrimary
    {
        public class Command : IRequest<Result<Unit>>
        {
            public int PhoneNumberId { get; set; }
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
                if (request.PhoneNumberId <= 0)
                    return Result<Unit>.Failure("Invalid phone number");

                // Get the currently authenticated user
                var user = await _userManager.GetUserAsync(_userAccessor.GetUsername());
                if (user == null)
                    return Result<Unit>.Unauthorized("User not found.");

                var phoneNumber = await _userManager.GetUserPhoneNumberAsync(_userAccessor.GetUserid(), request.PhoneNumberId);
                if (phoneNumber == null)
                    return Result<Unit>.Failure("Phone number does not exist");

                var primaryPhoneNumber = await _userManager.GetPrimaryPhoneNumberAsync(user.Id);
                //if (primaryPhoneNumber == null)
                //    return Result<Unit>.Failure("Bad Request");

                try
                {
                    if (primaryPhoneNumber != null)
                    {
                        // Unset the current primary phone number
                        var unsetResult = await _userManager.SetPrimaryStatus(primaryPhoneNumber, false);
                        if (!unsetResult)
                            return Result<Unit>.Failure("Failed to unset the previous primary phone number.");
                    }

                    // Set the new primary phone number
                    var setResult = await _userManager.SetPrimaryStatus(phoneNumber, true);
                    if (!setResult && primaryPhoneNumber != null)
                    {
                        // Rollback the previous primary phone number
                        await _userManager.SetPrimaryStatus(primaryPhoneNumber, true);
                        return Result<Unit>.Failure("Failed to update the primary phone number. Changes have been rolled back.");
                    }
                    else if (!setResult)
                        return Result<Unit>.Failure("Failed to update the primary phone number");

                    return Result<Unit>.Success(Unit.Value);
                }
                catch (Exception ex)
                {
                    // Rollback in case of any exception
                    if (primaryPhoneNumber != null)
                        await _userManager.SetPrimaryStatus(primaryPhoneNumber, true);
                    return Result<Unit>.Failure($"An error occurred: {ex.Message}");
                }
            }

        }
    }
}
