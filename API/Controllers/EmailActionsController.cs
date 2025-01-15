using API.Manager;
using API.Services;
using Application.Emails;
using Infrastructure.Email;
using Infrastructure.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using System.Text;

namespace API.Controllers
{
    public class EmailActionsController : BaseApiController
    {
        private readonly CustomUserManager _userManager;
        private readonly EmailSender _emailSender;
        private readonly TokenService _tokenService;
        private readonly CodeValidation _codeValidation;

        public EmailActionsController(CustomUserManager userManager, EmailSender emailSender,
            TokenService tokenService, CodeValidation codeValidation)
        {
            _userManager = userManager;
            _emailSender = emailSender;
            _tokenService = tokenService;
            _codeValidation = codeValidation;
        }

        [AllowAnonymous]
        [HttpGet("resendEmailConfirmationLink")]
        public async Task<IActionResult> ResendEmailConfirmationLink(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return Unauthorized("Email not found, please enter the email associated with your account");

            if (await _userManager.IsEmailVerifiedAsync(email))
                return Ok("Email already confirmed - You can now login");

            var origin = Request.Headers["origin"].ToString();
            if (string.IsNullOrEmpty(origin))
            {
                var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
                origin = env == "Development" ? "https://localhost:5000/api" : "https://reactivities-pk.fly.dev/api";
            }

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            var verifyUrl = $"{origin}/emails/verifyEmail?token={token}&email={email}";
            var emailBody = $@"<html><body><p>Hello {user.UserName},</p><p>Please verify your email by clicking the link below:</p><p><a href='{verifyUrl}'>Verify Your Email</a></p></body></html>";

            user.Email = email;
            await _emailSender.SendEmailAsync(user, "Please verify email", emailBody);

            return Ok("Email verification link resent");
        }

        [AllowAnonymous]
        [HttpGet("sendPasswordResetLink")]
        public async Task<IActionResult> SendPasswordResetLink(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return Unauthorized("Email not found, please enter the email associated with your account");

            var origin = Request.Headers["origin"].ToString();
            if (string.IsNullOrEmpty(origin))
            {
                var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
                origin = env == "Development" ? "https://localhost:5000/api" : "https://reactivities-pk.fly.dev/api";
            }

            var token = string.Empty;
            try
            {
                token = await _userManager.GeneratePasswordResetTokenAsync(user);
            }
            catch (Exception e)
            {

                throw;
            }
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            var resetUrl = $"{origin}/account/passwordReset?token={token}&email={email}";
            var emailBody = $@"<html><body><p>Hi {user.UserName},</p><p>Reset your password by clicking the link below:</p><p><a href='{resetUrl}'>Reset Your Password</a></p></body></html>";

            user.Email = email;
            await _emailSender.SendEmailAsync(user, "Password reset email", emailBody);

            return Ok("Password reset link sent");
        }

        [HttpPost("sendVerificationCode")]
        public async Task<IActionResult> SendVerificationCode([FromBody] Add.Command command)
        {
            var user = await _userManager.FindByEmailAsync(command.Email);
            if (user == null) return Unauthorized();

            var token = _tokenService.GenerateCode(9);
            await _codeValidation.SetValidationCodeAsync(command.Email, token, 120);

            var emailBody = $@"<html><body><p>Hi {user.UserName},</p><p>Your verification code is:</p><h2>{token}</h2><p>This code will expire in 2 minutes.</p></body></html>";

            user.Email = command.Email;
            await _emailSender.SendEmailAsync(user, "Your security code", emailBody);

            return Ok("Verification code sent");
        }
    }
}
