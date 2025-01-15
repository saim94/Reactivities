using Application.ReturnDTOs;

namespace API.DTOs
{
    public class UserDto
    {
        public string Id { get; set; }
        public string DisplayName { get; set; }
        public string Token { get; set; }
        public string Image { get; set; }
        public string UserName { get; set; }
        //public string Email { get; set; }
        public List<EmailDto> Emails { get; set; } = new List<EmailDto>();
        public List<PhoneDto> Phones { get; set; } = new List<PhoneDto>();
    }
}
