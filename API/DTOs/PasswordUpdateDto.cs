using System.ComponentModel.DataAnnotations;

namespace API.DTOs
{
    public class PasswordUpdateDto
    {
        /// <summary>
        /// Password to update
        /// </summary>
        [RegularExpression("^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).{6,15}$", ErrorMessage = "Your password must be 6-15 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., @, #, $, %, ^, &, +, =).")]
        public string Password { get; set; }
        public string CurrentPassword { get; set; }
        public string Email { get; set; }
        public string Token { get; set; }
    }
}
