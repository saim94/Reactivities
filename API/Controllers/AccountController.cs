using API.DTOs;
using API.Manager;
using API.Services;
using API.Store;
using AutoMapper;
using Domain;
using Infrastructure.Email;
using Infrastructure.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text;

using System.Web;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly CustomUserManager _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly TokenService _tokenService;
        private readonly IConfiguration _config;
        private readonly EmailSender _emailSender;
        private readonly CodeValidation _codeValidation;
        private readonly IMapper _mapper;
        private readonly HttpClient _httpClient;

        public AccountController(
            CustomUserManager userManager,
            SignInManager<AppUser> signInManager,
            TokenService tokenService,
            IConfiguration config,
            EmailSender emailSender,
            CodeValidation codeValidation,
            IMapper mapper)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _config = config;
            _emailSender = emailSender;
            _codeValidation = codeValidation;
            _mapper = mapper;
            _httpClient = new HttpClient
            {
                BaseAddress = new System.Uri("https://graph.facebook.com")
            };
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await _userManager.FindByUserNameOrEmailAsync(loginDto.Email);
            if (user == null) return Unauthorized("Invalid Email");
            if (user == null) return Unauthorized();
            if (user == null) return Unauthorized();

            var isVerified = await _userManager.IsEmailVerifiedAsync(loginDto.Email);
            if (!isVerified) return Unauthorized("Email not confirmed");

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);
            if (result.Succeeded)
            {
                await SetRefreshToken(user);
                return await CreateUserObject(user);
            }

            return Unauthorized("Invalid Password");
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {
            if (await _userManager.Users.AnyAsync(x => x.UserName == registerDto.UserName))
            {
                ModelState.AddModelError("username", "Username taken");
                return ValidationProblem();
            }

            if (await _userManager.IsEmailVerifiedAsync(registerDto.Email))
            {
                ModelState.AddModelError("email", "Email already taken");
                return ValidationProblem();
            }

            var user = new AppUser
            {
                DisplayName = registerDto.DisplayName,
                UserName = registerDto.UserName
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);
            if (!result.Succeeded) return BadRequest("Problem registering user");

            await _userManager.AddEmailAsync(new EmailAddress
            {
                UserId = user.Id,
                Email = registerDto.Email,
                IsPrimary = true,
                IsVerified = false
            });

            var origin = Request.Headers["origin"].ToString();
            if (string.IsNullOrEmpty(origin))
            {
                var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
                origin = env == "Development" ? "https://localhost:5000/api" : "https://reactivities-pk.fly.dev/api";
            }

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            var verifyUrl = $"{origin}/emails/verifyEmail?token={token}&email={registerDto.Email}";
            var emailBody = $@"<html><body><p>Hi {user.UserName},</p><p>Please verify your email by clicking the link below:</p><p><a href='{verifyUrl}'>Verify Email</a></p></body></html>";

            user.Email = registerDto.Email;
            await _emailSender.SendEmailAsync(user, "Please verify email", emailBody);

            return Ok("Registration successful - please verify your email.");
        }

        [AllowAnonymous]
        [HttpPost("resetPassword")]
        public async Task<IActionResult> ResetPassword(PasswordUpdateDto passwordResetDto)
        {
            var user = await _userManager.FindByEmailForPasswordResetAsync(passwordResetDto.Email);
            if (user == null) return Unauthorized("Email not found, please verify.");

            var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(passwordResetDto.Token));
            var result = await _userManager.ResetPasswordAsync(user, decodedToken, passwordResetDto.Password);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description);
                return BadRequest(new { Errors = errors });
            }

            return Ok("Password reset successfully.");
        }

        [Authorize]
        [HttpPost("changePassword")]
        public async Task<IActionResult> ChangePassword(PasswordUpdateDto passwordChangeDto)
        {
            var user = await _userManager.FindByEmailAsync(passwordChangeDto.Email);
            if (user == null) return Unauthorized("Email not found, please verify.");

            var result = await _userManager.ChangePasswordAsync(user, passwordChangeDto.CurrentPassword, passwordChangeDto.Password);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description);
                return BadRequest(new { Errors = errors });
            }

            return Ok("Password changed successfully.");
        }

        [HttpPost("codeVerification")]
        public async Task<IActionResult> CodeVerification(string email, string code)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return Unauthorized();

            var isValid = await _codeValidation.ValidateCodeAsync(email, code);
            if (!isValid) return Unauthorized("Invalid or expired code.");

            return Ok("Code verification successful.");
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            var user = await _userManager.GetUserWithDetailsAsync(email);

            if (user == null) return Unauthorized();

            await SetRefreshToken(user);
            return await CreateUserObject(user);
        }

        [AllowAnonymous]
        [HttpPost("fbLogin")]
        public async Task<ActionResult<UserDto>> FacebookLogin(string accessToken)
        {
            var fbVerifyKeys = $"{_config["Facebook:AppId"]}|{_config["Facebook:AppSecret"]}";
            var verifyTokenResponse = await _httpClient.GetAsync($"debug_token?input_token={accessToken}&access_token={fbVerifyKeys}");

            if (!verifyTokenResponse.IsSuccessStatusCode) return Unauthorized();

            var fbUrl = $"me?access_token={accessToken}&fields=name,email,picture.width(100).height(100),id";
            var fbInfo = await _httpClient.GetFromJsonAsync<FacebookDto>(fbUrl);

            var user = await _userManager.FindByEmailAsync(fbInfo.Email);
            if (user != null)
            {
                var receivedPhotoUrl = fbInfo.Picture.Data.Url;
                var storedPhotoUrl = user.Photos?.FirstOrDefault(x => x.IsMain)?.Url;

                if (receivedPhotoUrl != storedPhotoUrl)
                {
                    user.Photos.FirstOrDefault(x => x.IsMain).Url = receivedPhotoUrl;
                    await _userManager.UpdateAsync(user);
                }

                return await CreateUserObject(user);
            }

            user = new AppUser
            {
                DisplayName = fbInfo.Name,
                UserName = fbInfo.Email,
                Photos = new List<Photo>
                {
                    new Photo
                    {
                        Id = "fb_" + fbInfo.Id,
                        Url = fbInfo.Picture.Data.Url,
                        IsMain = true,
                    }
                },
                EmailConfirmed = true
            };

            var result = await _userManager.CreateAsync(user);
            if (!result.Succeeded) return BadRequest("Problem creating user account");

            await _userManager.AddEmailAsync(new EmailAddress
            {
                UserId = user.Id,
                Email = fbInfo.Email,
                IsPrimary = true,
                IsVerified = true
            });

            await SetRefreshToken(user);
            return await CreateUserObject(user);
        }

        [Authorize]
        [HttpPost("refreshToken")]
        public async Task<ActionResult<UserDto>> RefreshToken()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            var userName = User.FindFirstValue(ClaimTypes.Name);

            var user = await _userManager.FindByUserNameOrEmailAsync(userName);
            if (user == null) return Unauthorized();

            var oldToken = user.RefreshTokens.SingleOrDefault(x => x.Token == refreshToken);
            if (oldToken == null || !oldToken.IsActive) return Unauthorized();

            return await CreateUserObject(user);
        }

        private async Task SetRefreshToken(AppUser user)
        {
            var refreshToken = _tokenService.GenerateRefreshToken();
            await _userManager.AddRefreshTokenAsync(user, refreshToken);

            Response.Cookies.Append("refreshToken", refreshToken.Token, new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddDays(7)
            });
        }

        private async Task<UserDto> CreateUserObject(AppUser user)
        {
            // Fetch the primary email
            //var primaryEmail = await _userManager.GetPrimaryEmailAsync(user.Id);
            //var emailDto = primaryEmail != null
            //    ? _mapper.Map<EmailAddress, Application.ReturnDTOs.EmailDto>(primaryEmail)
            //    : null;

            var emails = await _userManager.GetUserEmailsAsync(user.Id);
            var emailDtos = _mapper.Map<List<Application.ReturnDTOs.EmailDto>>(emails);
            var phones = await _userManager.GetUserPhoneNumbersAsync(user.Id);
            var phonesDtos = _mapper.Map<List<Application.ReturnDTOs.PhoneDto>>(phones);
            var primaryEmail = emailDtos.FirstOrDefault(x => x.IsPrimary);

            // Construct the UserDto
            return new UserDto
            {
                Id = user.Id,
                DisplayName = user.DisplayName,
                Image = user.Photos?.FirstOrDefault(x => x.IsMain)?.Url,
                Token = _tokenService.CreateToken(user, primaryEmail?.Email ?? string.Empty), // Fallback to empty string if email is null
                UserName = user.UserName,
                Emails = emailDtos,
                Phones = phonesDtos
            };
        }
    }
}
