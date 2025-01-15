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
    public class SetVerification
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

                var result = await _userManager.VerifyPhoneNumberAsync(phoneNumber.Number);

                if (!result) return Result<Unit>.Failure("Failed to verify phone number, please try again");

                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}
