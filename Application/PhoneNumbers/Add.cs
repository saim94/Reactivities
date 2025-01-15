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

namespace Application.PhoneNumbers
{
    public class Add
    {
        public class Command : IRequest<Result<PhoneDto>>
        {
            public string PhoneNumber { get; set; }
        }
        public class Handler : IRequestHandler<Command, Result<PhoneDto>>
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
            public async Task<Result<PhoneDto>> Handle(Command request, CancellationToken cancellationToken)
            {
                // Get the currently authenticated user
                var user = await _userManager.GetUserAsync(_userAccessor.GetUsername());
                if (user == null)
                    return Result<PhoneDto>.Unauthorized("User not found.");

                if (string.IsNullOrEmpty(request.PhoneNumber))
                    return Result<PhoneDto>.Failure("Phone Number is required.");

                var existingPhoneNumber = await _userManager.FindPhoneNumberAsync(request.PhoneNumber);
                if (existingPhoneNumber != null)
                    return Result<PhoneDto>.Failure("This phone number is already in use.");

                // Add the new phone number
                var phoneNumber = new PhoneNumber
                {
                    Number = request.PhoneNumber,
                    UserId = user.Id
                };

                var result = await _userManager.AddPhoneNumberAsync(phoneNumber);

                var phoneDto = _mapper.Map<PhoneDto>(phoneNumber);

                if (result) return Result<PhoneDto>.Success(phoneDto);

                return Result<PhoneDto>.Failure("Failed to add phone number, please try again");
            }
        }
    }
}
