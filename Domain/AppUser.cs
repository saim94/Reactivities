using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class AppUser : IdentityUser
    {
        public string DisplayName { get; set; }
        public string Bio { get; set; }
        public ICollection<ActivityAttendee> Activities { get; set; }
        public ICollection<Photo> Photos { get; set; }
        public ICollection<UserFollowing> Followings { get; set; }
        public ICollection<UserFollowing> Followers { get; set; }
        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
        public ICollection<Conversation> Conversations { get; set; }
        //public ICollection<AppUserNotification> Notifications { get; set; } = new List<AppUserNotification>();
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
        public ICollection<EmailAddress> EmailAddresses { get; set; } = new List<EmailAddress>();
        public ICollection<PhoneNumber> PhoneNumbers { get; set; } = new List<PhoneNumber>();

    }
}
