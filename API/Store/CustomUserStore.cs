using Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace API.Store
{
    public class CustomUserStore : UserStore<AppUser>
    {
        private readonly DataContext _context;

        public CustomUserStore(DataContext context) : base(context)
        {
            _context = context;
        }

        #region PhoneNumbers
        // Get all phone numbers of a user based on userId
        public async Task<List<PhoneNumber>> GetUserPhoneNumbersAsync(string userId, CancellationToken cancellationToken = default)
        {
            return await _context.PhoneNumbers
                .Where(x => x.UserId == userId)
                .ToListAsync(cancellationToken);
        }
        // Get an phone numbers of a user based on userId and emailId
        public async Task<PhoneNumber> GetUserPhoneNumberAsync(string userId, int phoneNumberId, CancellationToken cancellationToken = default)
        {
            return await _context.PhoneNumbers
                .FirstOrDefaultAsync(x => x.UserId == userId && x.Id == phoneNumberId, cancellationToken);
        }
        // Find a user by phone number using the custom PhoneNumber table
        public async Task<AppUser> FindByPhoneNumberAsync(string phone, CancellationToken cancellationToken = default)
        {
            var phoneNumber = await _context.PhoneNumbers
                .FirstOrDefaultAsync(e => e.Number == phone, cancellationToken);

            if (phoneNumber == null) return null;

            return await _context.Users
                .FirstOrDefaultAsync(u => u.Id == phoneNumber.UserId, cancellationToken);
        }
        // Check if a phone number is verified
        public async Task<bool> IsPhoneNumberVerifiedAsync(string number, CancellationToken cancellationToken = default)
        {
            var phoneNumber = await _context.PhoneNumbers
                .FirstOrDefaultAsync(e => e.Number == number, cancellationToken);

            return phoneNumber?.IsVerified ?? false;
        }
        // Retrieve the primary phone number for a user
        public async Task<PhoneNumber> GetPrimaryPhoneNumberAsync(string userId, CancellationToken cancellationToken = default)
        {
            var phoneNumber = await _context.PhoneNumbers
                .Where(e => e.UserId == userId && e.IsPrimary)
                .FirstOrDefaultAsync(cancellationToken);
            return phoneNumber;
        }
        // Add an phone number for a user
        public async Task<bool> AddPhoneNumberAsync(PhoneNumber phoneNumber, CancellationToken cancellationToken = default)
        {
            _context.PhoneNumbers.Add(phoneNumber);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }
        // Delete an phone number for a user
        public async Task<bool> DeletePhoneNumberAsync(PhoneNumber phoneNumber, CancellationToken cancellationToken = default)
        {
            _context.PhoneNumbers.Remove(phoneNumber);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }
        //Set a phone number primary
        public async Task<bool> SetPrimaryStatus(PhoneNumber phoneNumber, bool isPrimary, CancellationToken cancellationToken = default)
        {
            phoneNumber.IsPrimary = isPrimary;
            _context.PhoneNumbers.Update(phoneNumber);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }
        // Find an phone number for a user
        public async Task<PhoneNumber> FindPhoneNumberAsync(string number, CancellationToken cancellationToken = default)
        {
            return await _context.PhoneNumbers.FirstOrDefaultAsync(x => x.Number == number, cancellationToken);
        }
        // Mark an phone numnber as verified
        public async Task<bool> VerifyPhoneNumberAsync(string number, CancellationToken cancellationToken = default)
        {
            var phoneNumber = await _context.PhoneNumbers
                .FirstOrDefaultAsync(e => e.Number == number, cancellationToken);

            if (phoneNumber == null) return false;

            if (phoneNumber.IsVerified) return true;

            phoneNumber.IsVerified = true;
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        #endregion

        #region EmaildAddress

        // Get all email addresses of a user based on userId
        public async Task<List<EmailAddress>> GetUserEmailsAsync(string userId, CancellationToken cancellationToken = default)
        {
            return await _context.EmailAddresses
                .Where(x => x.UserId == userId)
                .ToListAsync(cancellationToken);
        }
        // Get an email address of a user based on userId and emailId
        public async Task<EmailAddress> GetUserEmailAsync(string userId, int emailId, CancellationToken cancellationToken = default)
        {
            return await _context.EmailAddresses
                .FirstOrDefaultAsync(x => x.UserId == userId && x.Id == emailId, cancellationToken);
        }
        // Find a user by email using the custom EmailAddresses table
        public override async Task<AppUser> FindByEmailAsync(string email, CancellationToken cancellationToken = default)
        {
            var emailAddress = await _context.EmailAddresses
                .FirstOrDefaultAsync(e => e.Email == email, cancellationToken);

            if (emailAddress == null) return null;

            return await _context.Users
                .FirstOrDefaultAsync(u => u.Id == emailAddress.UserId, cancellationToken);
        }
        // Check if an email is verified
        public async Task<bool> IsEmailVerifiedAsync(string email, CancellationToken cancellationToken = default)
        {
            var emailAddress = await _context.EmailAddresses
                .FirstOrDefaultAsync(e => e.Email == email, cancellationToken);

            return emailAddress?.IsVerified ?? false;
        }
        // Retrieve the primary email address for a user
        public async Task<EmailAddress> GetPrimaryEmailAsync(string userId, CancellationToken cancellationToken = default)
        {
            var emailAddress = await _context.EmailAddresses
                .Where(e => e.UserId == userId && e.IsPrimary)
                .FirstOrDefaultAsync(cancellationToken);

            return emailAddress;
        }

        // Retrieve a user by username or email, including their photos
        public async Task<AppUser> FindByUserNameOrEmailAsync(string identifier, CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .Include(u => u.Photos)
                .FirstOrDefaultAsync(u =>
                    u.UserName == identifier ||
                    _context.EmailAddresses.Any(e => e.UserId == u.Id && e.Email == identifier),
                    cancellationToken);
        }

        // Retrieve a user and their associated photos by email
        public async Task<AppUser> GetUserWithDetailsAsync(string email, CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .Include(u => u.Photos)
                .FirstOrDefaultAsync(u =>
                    _context.EmailAddresses.Any(e => e.UserId == u.Id && e.Email == email),
                    cancellationToken);
        }

        // Add an email address for a user
        public async Task<bool> AddEmailAsync(EmailAddress emailAddress, CancellationToken cancellationToken = default)
        {
            _context.EmailAddresses.Add(emailAddress);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        // Delete an email address for a user
        public async Task<bool> DeleteEmailAsync(EmailAddress emailAddress, CancellationToken cancellationToken = default)
        {
            _context.EmailAddresses.Remove(emailAddress);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        //// Mark an email primary
        //public async Task<bool> MarkEmailPrimary(EmailAddress emailAddress, CancellationToken cancellationToken = default)
        //{
        //    emailAddress.IsPrimary = true;
        //    _context.EmailAddresses.Update(emailAddress);
        //    return await _context.SaveChangesAsync(cancellationToken) > 0;
        //}

        //// UnMark an email primary
        //public async Task<bool> UnMarkEmailPrimary(EmailAddress emailAddress, CancellationToken cancellationToken = default)
        //{
        //    emailAddress.IsPrimary = false;
        //    _context.EmailAddresses.Update(emailAddress);
        //    return await _context.SaveChangesAsync(cancellationToken) > 0;
        //}

        // Mark status of an email primary/non primary
        public async Task<bool> SetPrimaryStatus(EmailAddress emailAddress, bool isPrimary, CancellationToken cancellationToken = default)
        {
            emailAddress.IsPrimary = isPrimary;
            _context.EmailAddresses.Update(emailAddress);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        // Find an email address for a user
        public async Task<EmailAddress> FindEmailAsync(string email, CancellationToken cancellationToken = default)
        {
            return await _context.EmailAddresses.FirstOrDefaultAsync(x => x.Email == email, cancellationToken);
        }

        // Mark an email address as verified
        public async Task<bool> VerifyEmailAsync(string email, CancellationToken cancellationToken = default)
        {
            var emailAddress = await _context.EmailAddresses
                .FirstOrDefaultAsync(e => e.Email == email, cancellationToken);

            if (emailAddress == null) return false;

            if (emailAddress.IsVerified) return true;

            emailAddress.IsVerified = true;
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        // Add a refresh token to a user's collection
        public async Task AddRefreshTokenAsync(AppUser user, RefreshToken refreshToken, CancellationToken cancellationToken = default)
        {
            user.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        // Find a user by email for password reset operations
        public async Task<AppUser> FindByEmailForPasswordResetAsync(string email, CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u =>
                    _context.EmailAddresses.Any(e => e.UserId == u.Id && e.Email == email),
                    cancellationToken);
        }

        // Find a user by username for refresh token validation
        public async Task<AppUser> FindByUserNameAsync(string username, CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => u.UserName == username, cancellationToken);
        }
        #endregion
    }
}