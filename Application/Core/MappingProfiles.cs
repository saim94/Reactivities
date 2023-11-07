using Application.Activities;
using Application.Comments;
using Application.ReturnDTOs;
using AutoMapper;
using Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
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
            //CreateMap<Profiles.Profile, AppUser>()
            //    .ForMember(d => d.UserName, o => o.MapFrom(s => s.Username));
            CreateMap<Comment, CommentDto>()
                .ForMember(d => d.DisplayName, o => o.MapFrom(s => s.Author.DisplayName))
                .ForMember(d => d.Username, o => o.MapFrom(s => s.Author.UserName))
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
                .ForMember(d => d.Image, o => o.MapFrom(s => s.Photos.FirstOrDefault(x => x.IsMain).Url))
                .ForMember(d => d.Token, o => o.Ignore());

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
                .ForMember(dest => dest.User1_Id, opt => opt.MapFrom(src => src.User1_Id))
                .ForMember(dest => dest.User2_Id, opt => opt.MapFrom(src => src.User2_Id))
                .ForMember(dest => dest.User1, opt => opt.MapFrom(src => src.User1)) // Assuming you don't want to map User1
                .ForMember(dest => dest.User2, opt => opt.MapFrom(src => src.User2)) // Assuming you don't want to map User2
                .ForMember(dest => dest.Messages, opt => opt.MapFrom(src => src.Messages))
                .ForMember(
                    dest =>
                    dest.LatestMessage, opt => opt.MapFrom(src => (src.Messages.Count > 0) ?
                    src.Messages.ElementAt(src.Messages.Count - 1) : new Message())
                );


        }
    }
}
