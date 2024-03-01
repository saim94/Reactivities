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
        public string Content { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public string Title { get; set; }
        public bool IsRead { get; set; }
        public bool IsCanceled { get; set; }
        public ICollection<AppUserNotification> AppUserNotifications { get; set; } = new List<AppUserNotification>();
        public Notification(int id, string content, string title)
        {
            Id = id;
            Content = content;
            Title = title;
        }
    }
}
