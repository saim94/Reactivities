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
    public class Delete
    {
        public class Command : IRequest<Result<Unit>>
        {
            public int PhoneNumberId { get; set; }
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
                if (request.PhoneNumberId <= 0)
                    return Result<Unit>.Failure("Invalid phone number");

                // Get the currently authenticated user
                var user = await _userManager.GetUserAsync(_userAccessor.GetUsername());
                if (user == null)
                    return Result<Unit>.Unauthorized("User not found.");
                //// Validate email format
                //if (!IsValidEmail(email))
                //    return BadRequest("Invalid email format.");

                var existingPhoneNumber = await _userManager.GetUserPhoneNumberAsync(_userAccessor.GetUserid(), request.PhoneNumberId);
                if (existingPhoneNumber == null)
                    return Result<Unit>.Failure("Phone number does not exist");

                if (existingPhoneNumber.IsPrimary) return Result<Unit>.Failure("Cannot delete the primary phone number");

                var result = await _userManager.DeletePhoneNumberAsync(existingPhoneNumber);

                if (result) return Result<Unit>.Success(Unit.Value);

                return Result<Unit>.Failure("Failed to delete phone number, please try again");
            }
        }
    }
}
