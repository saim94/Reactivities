using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class AppUserNotification
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public virtual AppUser User { get; set; }
        public int NotificationId { get; set; }
        public virtual Notification Notification { get; set; }
    }
}
