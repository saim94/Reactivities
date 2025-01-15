using Application.Core;
using brevo_csharp.Api;
using brevo_csharp.Client;
using brevo_csharp.Model;
using Domain;
using MediatR;
using Microsoft.Extensions.Configuration;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Email
{
    public class EmailSender
    {
        private readonly IConfiguration _config;

        public EmailSender(IConfiguration config)
        {
            _config = config;
        }

        public async System.Threading.Tasks.Task SendEmailAsync(AppUser user, string subject, string emailBody)
        {
            var client = _config["Brevo:ApiKey"] ?? Environment.GetEnvironmentVariable("BREVO_API_KEY");
            var config = new Configuration
            {
                ApiKey = new Dictionary<string, string> { { "api-key", client } }
            };

            //user.Email = "noreply.reactivitiespk@gmail.com"; //for debug purpose.

            var apiInstance = new TransactionalEmailsApi(config);

            var sendSmtpEmail = new SendSmtpEmail(
                to: new List<SendSmtpEmailTo> { new SendSmtpEmailTo(user.Email, user.DisplayName) },
                sender: new SendSmtpEmailSender("Reactivities-PK", "noreply.reactivitiespk@gmail.com"),
                subject: subject,
                htmlContent: emailBody
            );

            //try
            //{
            // Send the email
            await apiInstance.SendTransacEmailAsync(sendSmtpEmail);
            // Return success result
            //return Result<Unit>.Success(Unit.Value);
            //}
            //catch (ApiException apiEx)
            //{
            //    // Handle specific API exceptions
            //    // Log the exception message or perform additional actions
            //    return Result<Unit>.Failure($"Failed to send email: {apiEx.Message}");
            //}
            //catch (Exception ex)
            //{
            //    // Handle general exceptions
            //    return Result<Unit>.Failure($"An unexpected error occurred: {ex.Message}");
            //}
            }
    }
}
