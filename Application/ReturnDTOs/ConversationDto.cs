using Application.Core;
using Domain;
using System.Text.Json.Serialization;

namespace Application.ReturnDTOs
{
    public class ConversationDto
    {
        public int ConversationId { get; set; }
        public string CurrentUserId { get; set; }
        public UserDto CurrentUser { get; set; }
        public string OtherUserId { get; set; }
        public UserDto OtherUser { get; set; }
        public List<MessageDto> Messages { get; set; }
        public int UnreadMessageCount { get; set; }
        public int FirstUnreadMessageId { get; set; }

    }
}
