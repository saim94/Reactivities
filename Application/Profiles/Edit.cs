using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Profiles
{
    public class Edit
    {

        public class Command : IRequest<Result<Unit>>
        {
            public string DisplayName { get; set; }
            public string Bio { get; set; }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.DisplayName).NotEmpty();
            }
        }


        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                _context = context;
                _userAccessor = userAccessor;
            }
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var user = await _context.Users.FirstOrDefaultAsync(x => x.UserName == _userAccessor.GetUsername());

                if (user == null) return null;

                user.Bio = request.Bio ?? user.Bio;
                user.DisplayName = request.DisplayName ?? user.DisplayName;

                //_context.Entry(user).State = EntityState.Modified;

                var success = await _context.SaveChangesAsync() > 0;

                if (success) return Result<Unit>.Success(Unit.Value);


                return Result<Unit>.Failure("Problem updating profile");
            }
        }

        //public class Command : IRequest<Result<Unit>>
        //{
        //    public Profile Profile { get; set; }
        //}

        //public class Handler : IRequestHandler<Command, Result<Unit>>
        //{
        //    private readonly DataContext _context;
        //    private readonly IMapper _mapper;
        //    private readonly IUserAccessor _userAccessor;

        //    public Handler(DataContext context, IMapper mapper, IUserAccessor userAccessor)
        //    {
        //        _context = context;
        //        _mapper = mapper;
        //        _userAccessor = userAccessor;
        //    }

        //    public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        //    {
        //        var currentUser = await _context.Users.FirstOrDefaultAsync(x =>
        //        x.UserName == _userAccessor.GetUsername());

        //        if (currentUser == null) return null;

        //        var user = await _context.Users
        //            .FirstOrDefaultAsync(x => x.UserName == currentUser.UserName);

        //        if (user == null) return null;


        //        request.Profile.Username = currentUser.UserName;
        //        var isSameDisplayName = user.DisplayName == request.Profile.DisplayName;
        //        var isSameBio = user.Bio == request.Profile.Bio;
        //        if (isSameDisplayName || isSameBio)
        //            return Result<Unit>.Failure("Displayname or bio cannot be same");

        //        _mapper.Map(request.Profile, user);

        //        //if (!isSameBio)
        //        //    user.Bio = request.Profile.Bio;
        //        //if (!isSameDisplayName)
        //        //    user.DisplayName = request.Profile.DisplayName;

        //        var result = await _context.SaveChangesAsync() > 0;

        //        if (result) return Result<Unit>.Success(Unit.Value);

        //        return Result<Unit>.Failure("Failed to update Profile");
        //    }
        //}

    }
}
