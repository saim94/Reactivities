using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.ReturnDTOs
{
    public class EmailDto
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public bool IsPrimary { get; set; }
        public bool IsVerified { get; set; }
        public string UserId { get; set; }
        //public UserDto User { get; set; }
    }
}
