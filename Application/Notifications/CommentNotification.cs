using Application.Comments;
using Application.Core;
using Application.ReturnDTOs;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Notifications
{
    public class CommentNotification
    {
        public class Command : IRequest<Result<List<NotificationDto>>>
        {
            public CommentDto CommentDto { get; set; }
        }
        public class Handler : IRequestHandler<Command, Result<List<NotificationDto>>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;

            public Handler(DataContext context, IMapper mapper)
            {
                _context = context;
                _mapper = mapper;
            }
            public async Task<Result<List<NotificationDto>>> Handle(Command request, CancellationToken cancellationToken)
            {
                var sourceUser = _context.Users
                    .Include(u => u.Photos)
                    .FirstOrDefault(x => x.UserName == request.CommentDto.Username);

                var uniqueAuthors = await _context.Comments
                    .Include(c => c.Author)
                    .Where(x => x.Activity.Id.ToString() == request.CommentDto.ActivityId && x.Author.UserName != request.CommentDto.Username)
                    .Select(c => c.Author)
                    .Distinct()
                    .ToListAsync();

                var notifications = uniqueAuthors.Select(author => GetNotification(
                        " Also commented on the activity You commented on",
                        "New comment",
                        author,
                        sourceUser,
                        request.CommentDto.ActivityId
                    )).ToList();

                _context.Notifications.AddRange(notifications);

                var result = await _context.SaveChangesAsync() > 0;

                if (result)
                    return Result<List<NotificationDto>>.Success(_mapper.Map<List<Notification>, List<NotificationDto>>(notifications));

                return Result<List<NotificationDto>>.Failure("Failed to send Notifications");
            }

            public static Notification GetNotification(string content, string title, AppUser receiver, AppUser source, string activityId)
            {
                Guid uuid = Guid.NewGuid();
                var notificationId = uuid.ToString();
                return new Notification
                {
                    Content = content,
                    Title = title,
                    NotificationId = notificationId,
                    UserId = receiver.Id,
                    User = receiver,
                    SourceUserId = source.Id,
                    SourceUser = source,
                    ActivityId = activityId,
                };
            }
        }
    }
}
