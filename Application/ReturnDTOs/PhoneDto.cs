using Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.ReturnDTOs
{
    public class PhoneDto
    {
        public int Id { get; set; }
        public string Number { get; set; } //Phone Number
        public bool IsPrimary { get; set; }
        public bool IsVerified { get; set; }
        public string UserId { get; set; }
        public UserDto User { get; set; }
    }
}
