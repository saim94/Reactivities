using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class Notification
    {
        public int Id { get; set; }
        public string NotificationId { get; set; }
        public string Content { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public string Title { get; set; }
        public bool IsRead { get; set; }
        public bool IsCanceled { get; set; }
        public AppUser User { get; set; }
        public string UserId { get; set; }
        public AppUser SourceUser { get; set; } // The user because of whom the notification is created
        public string SourceUserId { get; set; }
        public string ActivityId { get; set; }
        //public ICollection<AppUserNotification> AppUserNotifications { get; set; } = new List<AppUserNotification>();
        public Notification(string content, string title, string sourceUserId, string activityId, AppUser sourceUser)
        {
            Content = content;
            Title = title;
            SourceUserId = sourceUserId;
            ActivityId = activityId;
            SourceUser = sourceUser;
        }
        public Notification() { }
    }
}
