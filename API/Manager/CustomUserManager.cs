using API.Store;
using Domain;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace API.Manager
{
    public class CustomUserManager : UserManager<AppUser>
    {
        private readonly CustomUserStore _userStore;

        public CustomUserManager(
            CustomUserStore userStore,
            IPasswordHasher<AppUser> passwordHasher,
            IEnumerable<IUserValidator<AppUser>> userValidators,
            IEnumerable<IPasswordValidator<AppUser>> passwordValidators,
            ILookupNormalizer keyNormalizer,
            IdentityErrorDescriber errors,
            IOptions<IdentityOptions> optionsAccessor,
            IServiceProvider services,
            ILogger<UserManager<AppUser>> logger)
            : base(userStore, optionsAccessor, passwordHasher, userValidators, passwordValidators, keyNormalizer, errors, services, logger)
        {
            _userStore = userStore;
        }

        #region PhoneNumbers

        public async Task<List<PhoneNumber>> GetUserPhoneNumbersAsync(string userId)
        {
            return await _userStore.GetUserPhoneNumbersAsync(userId);
        }
        public async Task<PhoneNumber> GetUserPhoneNumberAsync(string userId, int phoneNumberId)
        {
            return await _userStore.GetUserPhoneNumberAsync(userId, phoneNumberId);
        }
        public async Task<AppUser> FindByPhoneNumberAsync(string phone)
        {
            return await _userStore.FindByPhoneNumberAsync(phone);
        }
        public async Task<bool> IsPhoneNumberVerifiedAsync(string number)
        {
            return await _userStore.IsPhoneNumberVerifiedAsync(number);
        }
        public async Task<PhoneNumber> GetPrimaryPhoneNumberAsync(string userId)
        {
            return await _userStore.GetPrimaryPhoneNumberAsync(userId);
        }
        public async Task<bool> AddPhoneNumberAsync(PhoneNumber phoneNumber)
        {
            return await _userStore.AddPhoneNumberAsync(phoneNumber);
        }
        public async Task<bool> DeletePhoneNumberAsync(PhoneNumber phoneNumber)
        {
            return await _userStore.DeletePhoneNumberAsync(phoneNumber);
        }
        public async Task<bool> SetPrimaryStatus(PhoneNumber phoneNumber, bool isPrimary)
        {
            return await _userStore.SetPrimaryStatus(phoneNumber, isPrimary);
        }
        public async Task<PhoneNumber> FindPhoneNumberAsync(string number)
        {
            return await _userStore.FindPhoneNumberAsync(number);
        }
        public async Task<bool> VerifyPhoneNumberAsync(string number)
        {
            return await _userStore.VerifyPhoneNumberAsync(number);
        }
        #endregion


        #region EmailAddress

        // Delegate methods to CustomUserStore
        public override Task<AppUser> FindByEmailAsync(string email)
        {
            return _userStore.FindByEmailAsync(email);
        }

        public override Task<string> GenerateEmailConfirmationTokenAsync(AppUser user)
        {
            return base.GenerateUserTokenAsync(user, "Default", "EmailConfirmation");
        }

        public override Task<string> GeneratePasswordResetTokenAsync(AppUser user)
        {
            return base.GenerateUserTokenAsync(user, "Default", "ResetPassword");
        }


        public Task<bool> IsEmailVerifiedAsync(string email)
        {
            return _userStore.IsEmailVerifiedAsync(email);
        }

        public Task<EmailAddress> GetPrimaryEmailAsync(string userId)
        {
            return _userStore.GetPrimaryEmailAsync(userId);
        }

        public Task<List<EmailAddress>> GetUserEmailsAsync(string userId)
        {
            return _userStore.GetUserEmailsAsync(userId);
        }
        public Task<EmailAddress> GetUserEmailAsync(string userId, int emailId)
        {
            return _userStore.GetUserEmailAsync(userId, emailId);
        }

        public Task<bool> AddEmailAsync(EmailAddress emailAddress)
        {
            return _userStore.AddEmailAsync(emailAddress);
        }
        public Task<bool> SetPrimaryStatus(EmailAddress emailAddress, bool isPrimary)
        {
            return _userStore.SetPrimaryStatus(emailAddress, isPrimary);
        }
        public Task<EmailAddress> FindEmailAsync(string emailAddress)
        {
            return _userStore.FindEmailAsync(emailAddress);
        }
        public Task<bool> DeleteEmailAsync(EmailAddress emailAddress)
        {
            return _userStore.DeleteEmailAsync(emailAddress);
        }
        public Task<bool> VerifyEmailAsync(string email)
        {
            return _userStore.VerifyEmailAsync(email);
        }

        public Task<AppUser> FindByUserNameOrEmailAsync(string identifier)
        {
            return _userStore.FindByUserNameOrEmailAsync(identifier);
        }

        public Task<AppUser> GetUserWithDetailsAsync(string email)
        {
            return _userStore.GetUserWithDetailsAsync(email);
        }

        public Task AddRefreshTokenAsync(AppUser user, RefreshToken refreshToken)
        {
            return _userStore.AddRefreshTokenAsync(user, refreshToken);
        }

        public Task<AppUser> FindByEmailForPasswordResetAsync(string email)
        {
            return _userStore.FindByEmailForPasswordResetAsync(email);
        }

        public Task<AppUser> FindByUserNameAsync(string username)
        {
            return _userStore.FindByUserNameAsync(username);
        }
        #endregion
    }
}
