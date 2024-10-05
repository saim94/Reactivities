using Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.ReturnDTOs
{
    public class NotificationDto
    {
        public string NotificationId { get; set; }
        public string Content { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public string Title { get; set; }
        public bool IsRead { get; set; }
        public UserDto User { get; set; }
        public string UserId { get; set; }
        public UserDto SourceUser { get; set; } // The user because of whom the notification is created
        public string SourceUserId { get; set; }
        public string ActivityId { get; set; }
    }
}
