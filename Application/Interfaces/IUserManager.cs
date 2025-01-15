using Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IUserManager
    {
        #region EmailAddress
        Task<AppUser> FindByEmailAsync(string email);
        Task<AppUser> GetUserAsync(ClaimsPrincipal user);
        Task<AppUser> GetUserAsync(string identifier);
        Task<bool> AddEmailAsync(EmailAddress emailAddress);
        Task<bool> SetPrimaryStatus(EmailAddress emailAddress, bool isPrimary);
        Task<EmailAddress> FindEmailAsync(string emailAddress);
        Task<bool> DeleteEmailAsync(EmailAddress emailAddress);
        Task<EmailAddress> GetPrimaryEmailAsync(string userId);
        Task<bool> IsEmailVerifiedAsync(string email);
        Task<IdentityResult> ConfirmEmailAsync(AppUser user, string token);
        Task<bool> VerifyEmailAsync(string email);
        Task<EmailAddress> GetUserEmailAsync(string userId, int emailId);
        #endregion

        #region PhoneNumbers
        Task<List<PhoneNumber>> GetUserPhoneNumbersAsync(string userId);
        Task<PhoneNumber> GetUserPhoneNumberAsync(string userId, int phoneNumberId);
        Task<AppUser> FindByPhoneNumberAsync(string phone);
        Task<bool> IsPhoneNumberVerifiedAsync(string number);
        Task<PhoneNumber> GetPrimaryPhoneNumberAsync(string userId);
        Task<bool> AddPhoneNumberAsync(PhoneNumber phoneNumber);
        Task<bool> DeletePhoneNumberAsync(PhoneNumber phoneNumber);
        Task<bool> SetPrimaryStatus(PhoneNumber phoneNumber, bool isPrimary);
        Task<PhoneNumber> FindPhoneNumberAsync(string number);
        Task<bool> VerifyPhoneNumberAsync(string number);
        #endregion
    }
}
