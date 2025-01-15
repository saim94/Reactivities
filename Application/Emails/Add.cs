using Application.Core;
using Application.Interfaces;
using Application.ReturnDTOs;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Emails
{
    public class Add
    {
        public class Command : IRequest<Result<EmailDto>>
        {
            public string Email { get; set; }
        }
        public class Handler : IRequestHandler<Command, Result<EmailDto>>
        {
            private readonly IUserAccessor _userAccessor;
            private readonly IUserManager _userManager;
            private readonly IMapper _mapper;

            public Handler(IUserAccessor userAccessor, IUserManager userManager, IMapper mapper)
            {
                _userAccessor = userAccessor;
                _userManager = userManager;
                _mapper = mapper;
            }
            public async Task<Result<EmailDto>> Handle(Command request, CancellationToken cancellationToken)
            {
                if (string.IsNullOrEmpty(request.Email))
                    return Result<EmailDto>.Failure("Email is required.");

                //// Validate email format
                //if (!IsValidEmail(email))
                //    return BadRequest("Invalid email format.");

                var existingEmail = await _userManager.FindEmailAsync(request.Email);
                if (existingEmail != null)
                    return Result<EmailDto>.Failure("This email is already in use.");

                // Get the currently authenticated user
                var user = await _userManager.GetUserAsync(_userAccessor.GetUsername());
                if (user == null)
                    return Result<EmailDto>.Unauthorized("User not found.");

                // Add the new email
                var emailAddress = new EmailAddress
                {
                    Email = request.Email,
                    UserId = user.Id
                };

                var result = await _userManager.AddEmailAsync(emailAddress);

                var emailDto = _mapper.Map<EmailDto>(emailAddress);

                if (result) return Result<EmailDto>.Success(emailDto);

                return Result<EmailDto>.Failure("Failed to add email, please try again");
            }
        }
    }
}
