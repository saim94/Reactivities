namespace Domain
{
    public class PhoneNumber
    {
        public int Id { get; set; }
        public string Number { get; set; } //Phone Number
        public bool IsPrimary { get; set; } = false;
        public bool IsVerified { get; set; } = false;
        public string UserId { get; set; }
        public AppUser User { get; set; }

    }
}
