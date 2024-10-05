
using Application.Activities;
using Application.Comments;
using Application.Interfaces;
using Application.ReturnDTOs;
using AutoMapper;
using Domain;
using Microsoft.Extensions.Logging;

namespace Application.Core
{
    public class MappingProfiles : Profile
    {
        //private readonly IUserAccessor _userAccessor;
        //private readonly ILogger<MappingProfiles> _logger;
        //private string _currentUsername;
        public MappingProfiles(IUserAccessor userAccessor, ILogger<MappingProfiles> logger)
        {
            try
            {

                //_userAccessor = userAccessor ?? throw new ArgumentNullException(nameof(userAccessor));
                //_logger = logger ?? throw new ArgumentNullException(nameof(logger));

                var _currentUsername = userAccessor.GetUsername();
                string currentUsername = null;

                CreateMap<Activity, Activity>();
                CreateMap<Activity, ActivityDto>()
                    .ForMember(d => d.HostUsername, o => o.MapFrom(s => s.Attendees.
                    FirstOrDefault(x => x.IsHost).AppUser.UserName));

                CreateMap<ActivityAttendee, AttendeeDto>()
                    .ForMember(d => d.DisplayName, o => o.MapFrom(s => s.AppUser.DisplayName))
                    .ForMember(d => d.Username, o => o.MapFrom(s => s.AppUser.UserName))
                    .ForMember(d => d.Bio, o => o.MapFrom(s => s.AppUser.Bio))
                    .ForMember(d => d.Image, o => o.MapFrom(s => s.AppUser.Photos.FirstOrDefault(x => x.IsMain).Url))
                    .ForMember(d => d.FollowersCount, o => o.MapFrom(s => s.AppUser.Followers.Count))
                    .ForMember(d => d.FollowingCount, o => o.MapFrom(s => s.AppUser.Followings.Count))
                    .ForMember(d => d.Following,
                    o => o.MapFrom(s => s.AppUser.Followers.Any(x => x.Observer.UserName == currentUsername)));
                CreateMap<AppUser, Profiles.Profile>()
                    .ForMember(d => d.Image, o => o.MapFrom(s => s.Photos.FirstOrDefault(x => x.IsMain).Url))
                    .ForMember(d => d.FollowersCount, o => o.MapFrom(s => s.Followers.Count))
                    .ForMember(d => d.FollowingCount, o => o.MapFrom(s => s.Followings.Count))
                    .ForMember(d => d.Following,
                    o => o.MapFrom(s => s.Followers.Any(x => x.Observer.UserName == currentUsername)));

                CreateMap<Comment, CommentDto>()
                    .ForMember(d => d.DisplayName, o => o.MapFrom(s => s.Author.DisplayName))
                    .ForMember(d => d.Username, o => o.MapFrom(s => s.Author.UserName))
                    .ForMember(d => d.ActivityId, o => o.MapFrom(s => s.Activity.Id))
                    .ForMember(d => d.Image, o => o.MapFrom(s => s.Author.Photos.FirstOrDefault(x => x.IsMain).Url));

                CreateMap<ActivityAttendee, Profiles.UserActivityDto>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.Activity.Id))
                    .ForMember(d => d.Title, o => o.MapFrom(s => s.Activity.Title))
                    .ForMember(d => d.Category, o => o.MapFrom(s => s.Activity.Category))
                    .ForMember(d => d.Date, o => o.MapFrom(s => s.Activity.Date))
                    .ForMember(d => d.HostUsername, o => o.
                    MapFrom(s => s.Activity.Attendees.FirstOrDefault(x => x.IsHost).AppUser.UserName));

                CreateMap<AppUser, UserDto>()
                    .ForMember(d => d.UserName, o => o.MapFrom(s => s.UserName))
                    .ForMember(d => d.DisplayName, o => o.MapFrom(s => s.DisplayName))
                    .ForMember(d => d.Image, o => o.MapFrom(s =>
                        s.Photos.FirstOrDefault(p => p.IsMain) != null ?
                        s.Photos.FirstOrDefault(p => p.IsMain).Url :
                        s.Photos.FirstOrDefault().Url))
                    .ForMember(d => d.Token, o => o.Ignore())
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.Id));

                CreateMap<Message, MessageDto>()
                   .ForMember(d => d.MessageId, o => o.MapFrom(s => s.MessageId))
                   .ForMember(d => d.Sender, o => o.MapFrom(s => s.Sender))
                   .ForMember(d => d.Content, o => o.MapFrom(s => s.Content))
                   .ForMember(d => d.SentAt, o => o.MapFrom(s => s.SentAt))
                   .ForMember(d => d.IsRead, o => o.MapFrom(s => s.IsRead))
                   .ForMember(d => d.ConversationId, o => o.MapFrom(s => s.ConversationId))
                   .ForMember(d => d.Conversation, o => o.Ignore())
                   .ForMember(d => d.User1Deleted, o => o.MapFrom(s => s.User1Deleted))
                   .ForMember(d => d.User2Deleted, o => o.MapFrom(s => s.User2Deleted));

                CreateMap<Conversation, ConversationDto>()
                    .ForMember(dest => dest.ConversationId, opt => opt.MapFrom(src => src.ConversationId))
                    .ForMember(dest => dest.CurrentUserId, opt => opt.MapFrom(src => GetCurrentUserId(src, _currentUsername)))
                    .ForMember(dest => dest.OtherUserId, opt => opt.MapFrom(src => GetOtherUserId(src, _currentUsername)))
                    .ForMember(dest => dest.CurrentUser, opt => opt.MapFrom(src => GetCurrentUser(src, _currentUsername)))
                    .ForMember(dest => dest.OtherUser, opt => opt.MapFrom(src => GetOtherUser(src, _currentUsername)))
                    .ForMember(dest => dest.Messages, opt => opt.MapFrom(src => src.Messages));

                CreateMap<Notification, NotificationDto>()
                    .ForMember(d => d.NotificationId, opt => opt.MapFrom(src => src.NotificationId))
                    .ForMember(d => d.Content, opt => opt.MapFrom(src => src.Content))
                    .ForMember(d => d.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate))
                    .ForMember(d => d.Title, opt => opt.MapFrom(src => src.Title))
                    .ForMember(d => d.IsRead, opt => opt.MapFrom(src => src.IsRead))
                    .ForMember(d => d.UserId, opt => opt.MapFrom(src => src.UserId))
                    .ForMember(d => d.User, opt => opt.MapFrom(src => src.User))
                    .ForMember(d => d.SourceUserId, opt => opt.MapFrom(src => src.SourceUserId))
                    .ForMember(d => d.SourceUser, opt => opt.MapFrom(src => src.SourceUser))
                    .ForMember(d => d.ActivityId, opt => opt.MapFrom(src => src.ActivityId));
                //.ForAllMembers(opt => opt.Condition((src, dest, member) =>
                //{
                //    _logger.LogInformation($"Mapping {src.GetType().Name}.{member} to {dest.GetType().Name}.{member}");
                //    return true;
                //}));

            }
            catch (Exception e)
            {
                logger.LogError("Error while mapping: " + e.Message);
            }
        }

        public MappingProfiles()
        {

        }

        private static AppUser GetCurrentUser(Conversation src, string currentUsername)
        {
            if (src.User1.UserName.Equals(currentUsername))
                return src.User1;
            else
                return src.User2;
        }
        private static AppUser GetOtherUser(Conversation src, string currentUsername)
        {
            if (!src.User1.UserName.Equals(currentUsername))
                return src.User1;
            else
                return src.User2;
        }
        private static string GetOtherUserId(Conversation src, string currentUsername)
        {
            if (!src.User1.UserName.Equals(currentUsername))
                return src.User1.Id;
            else
                return src.User2.Id;
        }
        private static string GetCurrentUserId(Conversation src, string currentUsername)
        {
            if (src.User1.UserName.Equals(currentUsername))
                return src.User1.Id;
            else
                return src.User2.Id;
        }
    }
}
