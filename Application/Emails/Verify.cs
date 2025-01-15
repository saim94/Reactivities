using Application.Core;
using Application.Interfaces;
using MediatR;
using Microsoft.AspNetCore.WebUtilities;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Emails
{
    public class Verify
    {
        public class Command : IRequest<Result<Unit>>
        {
            public string Email { get; set; }
            public string Token { get; set; }
        }
        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly IUserManager _userManager;

            public Handler(IUserManager userManager)
            {
                _userManager = userManager;
            }
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var user = await _userManager.FindByEmailAsync(request.Email);
                if (user == null) return Result<Unit>.Unauthorized();

                if (await _userManager.IsEmailVerifiedAsync(request.Email))
                    return Result<Unit>.Success(Unit.Value);

                var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Token));
                var result = await _userManager.ConfirmEmailAsync(user, decodedToken);
                if (!result.Succeeded) return Result<Unit>.Failure("Could not verify email address");

                var verified = await _userManager.VerifyEmailAsync(request.Email);
                if (!verified) return Result<Unit>.Failure("Failed to update email verification status");

                return Result<Unit>.Success(Unit.Value);
                //user.EmailConfirmed = true;
                //await _userManager.UpdateAsync(user);
            }
        }
    }
}
