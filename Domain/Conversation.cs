using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Domain
{
    public class Conversation
    {
        public int ConversationId { get; set; }
        public string User1_Id { get; set; }
        [JsonIgnore]
        public AppUser User1 { get; set; }
        public string User2_Id { get; set; }
        [JsonIgnore]
        public AppUser User2 { get; set; }
        public List<Message> Messages { get; set; }
        public bool User1Deleted { get; set; }
        public bool User2Deleted { get; set; }
    }
}
