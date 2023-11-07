using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
    public class UserDetailProvider : IUserIdProvider
    {
        public string GetUserId(HubConnectionContext connection)
        {
            var userName = connection.User.Identity.Name;
            return userName;
        }
    }
}