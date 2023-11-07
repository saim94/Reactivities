using Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.ReturnDTOs
{
    public class MessageDto
    {
        public int MessageId { get; set; }
        public UserDto Sender { get; set; }
        public string Content { get; set; }
        public DateTime SentAt { get; set; }
        public bool IsRead { get; set; }
        public int ConversationId { get; set; }
        public virtual ConversationDto Conversation { get; set; }
        public bool User1Deleted { get; set; }
        public bool User2Deleted { get; set;}
    }
}
