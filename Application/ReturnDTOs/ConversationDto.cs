using Application.Core;
using Domain;
using System.Text.Json.Serialization;

namespace Application.ReturnDTOs
{
    public class ConversationDto
    {
        public int ConversationId { get; set; }
        public string User1_Id { get; set; }
        public UserDto User1 { get; set; }
        public string User2_Id { get; set; }
        public UserDto User2 { get; set; }
        public List<MessageDto> Messages { get; set; }
        //public PagedList<MessageDto> Messages { get; set; }
        public MessageDto LatestMessage { get; set; }
    }
}
