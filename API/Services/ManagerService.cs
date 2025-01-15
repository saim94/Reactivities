using API.Manager;
using Application.Interfaces;
using Domain;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace API.Services
{
    public class ManagerService : IUserManager
    {
        private readonly CustomUserManager _userManager;

        public ManagerService(CustomUserManager userManager)
        {
            _userManager = userManager;
        }

        #region EmailAddress

        public Task<AppUser> FindByEmailAsync(string email)
        {
            return _userManager.FindByEmailAsync(email);
        }

        public Task<AppUser> GetUserAsync(ClaimsPrincipal user)
        {
            return _userManager.GetUserAsync(user);
        }

        public Task<AppUser> GetUserAsync(string identifier)
        {
            return _userManager.FindByUserNameOrEmailAsync(identifier);
        }

        public Task<bool> AddEmailAsync(EmailAddress emailAddress)
        {
            return _userManager.AddEmailAsync(emailAddress);
        }
        public Task<bool> SetPrimaryStatus(EmailAddress emailAddress, bool isPrimary)
        {
            return _userManager.SetPrimaryStatus(emailAddress, isPrimary);
        }
        public Task<EmailAddress> FindEmailAsync(string emailAddress)
        {
            return _userManager.FindEmailAsync(emailAddress);
        }
        public Task<EmailAddress> GetPrimaryEmailAsync(string userId)
        {
            return _userManager.GetPrimaryEmailAsync(userId);
        }
        public Task<bool> DeleteEmailAsync(EmailAddress emailAddress)
        {
            return _userManager.DeleteEmailAsync(emailAddress);
        }

        public Task<bool> IsEmailVerifiedAsync(string email)
        {
            return _userManager.IsEmailVerifiedAsync(email);
        }

        public Task<IdentityResult> ConfirmEmailAsync(AppUser user, string token)
        {
            return _userManager.ConfirmEmailAsync(user, token);
        }

        public Task<bool> VerifyEmailAsync(string email)
        {
            return _userManager.VerifyEmailAsync(email);
        }

        public Task<EmailAddress> GetUserEmailAsync(string userId, int emailId)
        {
            return _userManager.GetUserEmailAsync(userId, emailId);
        }
        #endregion

        #region PhoneNumber
        public async Task<List<PhoneNumber>> GetUserPhoneNumbersAsync(string userId)
        {
            return await _userManager.GetUserPhoneNumbersAsync(userId);
        }
        public async Task<PhoneNumber> GetUserPhoneNumberAsync(string userId, int phoneNumberId)
        {
            return await _userManager.GetUserPhoneNumberAsync(userId, phoneNumberId);
        }
        public async Task<AppUser> FindByPhoneNumberAsync(string phone)
        {
            return await _userManager.FindByPhoneNumberAsync(phone);
        }
        public async Task<bool> IsPhoneNumberVerifiedAsync(string number)
        {
            return await _userManager.IsPhoneNumberVerifiedAsync(number);
        }
        public async Task<PhoneNumber> GetPrimaryPhoneNumberAsync(string userId)
        {
            return await _userManager.GetPrimaryPhoneNumberAsync(userId);
        }
        public async Task<bool> AddPhoneNumberAsync(PhoneNumber phoneNumber)
        {
            return await _userManager.AddPhoneNumberAsync(phoneNumber);
        }
        public async Task<bool> DeletePhoneNumberAsync(PhoneNumber phoneNumber)
        {
            return await _userManager.DeletePhoneNumberAsync(phoneNumber);
        }
        public async Task<bool> SetPrimaryStatus(PhoneNumber phoneNumber, bool isPrimary)
        {
            return await _userManager.SetPrimaryStatus(phoneNumber, isPrimary);
        }
        public async Task<PhoneNumber> FindPhoneNumberAsync(string number)
        {
            return await _userManager.FindPhoneNumberAsync(number);
        }
        public async Task<bool> VerifyPhoneNumberAsync(string number)
        {
            return await _userManager.VerifyPhoneNumberAsync(number);
        }
        #endregion
    }
}
