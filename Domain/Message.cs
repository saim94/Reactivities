using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class Message
    {
        public int MessageId { get; set; }
        public AppUser Sender { get; set; }
        public string Content { get; set; }
        public DateTime SentAt { get; set; }
        public bool User1Deleted { get; set; }
        public bool User2Deleted { get; set; }
        public bool IsRead { get; set; }
        public int ConversationId { get; set; }
        public virtual Conversation Conversation { get; set; }

    }
}
