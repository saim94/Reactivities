namespace Domain
{
    public class EmailAddress
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public bool IsPrimary { get; set; } = false;
        public bool IsVerified { get; set; } = false;
        public string UserId { get; set; }
        public AppUser User { get; set; }
    }
}
