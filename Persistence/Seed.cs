using Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace Persistence
{
    public class Seed
    {
        public static async Task SeedData(DataContext context,
            UserManager<AppUser> userManager)
        {
            if (userManager.Users.Count() < 24 && !context.Activities.Any())
            {
                var users = new List<AppUser>
                {
                    new AppUser
                    {
                        DisplayName = "Bob",
                        UserName = "bob",
                        Email = "bob@test.com"
                    },
                    new AppUser
                    {
                        DisplayName = "Jane",
                        UserName = "jane",
                        Email = "jane@test.com"
                    },
                    new AppUser
                    {
                        DisplayName = "Tom",
                        UserName = "tom",
                        Email = "tom@test.com"
                    },
                };

                foreach (var user in users)
                {
                    await userManager.CreateAsync(user, "Pa$$w0rd");
                }

                var activities = new List<Activity>
                {
                    new Activity
                    {
                        Title = "Past Activity 1",
                        Date = DateTime.UtcNow.AddMonths(-2),
                        Description = "Activity 2 months ago",
                        Category = "drinks",
                        City = "London",
                        Venue = "Pub",
                        Attendees = new List<ActivityAttendee>
                        {
                            new ActivityAttendee
                            {
                                AppUser = users[0],
                                IsHost = true
                            }
                        }
                    },
                    new Activity
                    {
                        Title = "Past Activity 2",
                        Date = DateTime.UtcNow.AddMonths(-1),
                        Description = "Activity 1 month ago",
                        Category = "culture",
                        City = "Paris",
                        Venue = "The Louvre",
                        Attendees = new List<ActivityAttendee>
                        {
                            new ActivityAttendee
                            {
                                AppUser = users[0],
                                IsHost = true
                            },
                            new ActivityAttendee
                            {
                                AppUser = users[1],
                                IsHost = false
                            },
                        }
                    },
                    new Activity
                    {
                        Title = "Future Activity 1",
                        Date = DateTime.UtcNow.AddMonths(1),
                        Description = "Activity 1 month in future",
                        Category = "music",
                        City = "London",
                        Venue = "Wembly Stadium",
                        Attendees = new List<ActivityAttendee>
                        {
                            new ActivityAttendee
                            {
                                AppUser = users[2],
                                IsHost = true
                            },
                            new ActivityAttendee
                            {
                                AppUser = users[1],
                                IsHost = false
                            },
                        }
                    },
                    new Activity
                    {
                        Title = "Future Activity 2",
                        Date = DateTime.UtcNow.AddMonths(2),
                        Description = "Activity 2 months in future",
                        Category = "food",
                        City = "London",
                        Venue = "Jamies Italian",
                        Attendees = new List<ActivityAttendee>
                        {
                            new ActivityAttendee
                            {
                                AppUser = users[0],
                                IsHost = true
                            },
                            new ActivityAttendee
                            {
                                AppUser = users[2],
                                IsHost = false
                            },
                        }
                    },
                    new Activity
                    {
                        Title = "Future Activity 3",
                        Date = DateTime.UtcNow.AddMonths(3),
                        Description = "Activity 3 months in future",
                        Category = "drinks",
                        City = "London",
                        Venue = "Pub",
                        Attendees = new List<ActivityAttendee>
                        {
                            new ActivityAttendee
                            {
                                AppUser = users[1],
                                IsHost = true
                            },
                            new ActivityAttendee
                            {
                                AppUser = users[0],
                                IsHost = false
                            },
                        }
                    },
                    new Activity
                    {
                        Title = "Future Activity 4",
                        Date = DateTime.UtcNow.AddMonths(4),
                        Description = "Activity 4 months in future",
                        Category = "culture",
                        City = "London",
                        Venue = "British Museum",
                        Attendees = new List<ActivityAttendee>
                        {
                            new ActivityAttendee
                            {
                                AppUser = users[1],
                                IsHost = true
                            }
                        }
                    },
                    new Activity
                    {
                        Title = "Future Activity 5",
                        Date = DateTime.UtcNow.AddMonths(5),
                        Description = "Activity 5 months in future",
                        Category = "drinks",
                        City = "London",
                        Venue = "Punch and Judy",
                        Attendees = new List<ActivityAttendee>
                        {
                            new ActivityAttendee
                            {
                                AppUser = users[0],
                                IsHost = true
                            },
                            new ActivityAttendee
                            {
                                AppUser = users[1],
                                IsHost = false
                            },
                        }
                    },
                    new Activity
                    {
                        Title = "Future Activity 6",
                        Date = DateTime.UtcNow.AddMonths(6),
                        Description = "Activity 6 months in future",
                        Category = "music",
                        City = "London",
                        Venue = "O2 Arena",
                        Attendees = new List<ActivityAttendee>
                        {
                            new ActivityAttendee
                            {
                                AppUser = users[2],
                                IsHost = true
                            },
                            new ActivityAttendee
                            {
                                AppUser = users[1],
                                IsHost = false
                            },
                        }
                    },
                    new Activity
                    {
                        Title = "Future Activity 7",
                        Date = DateTime.UtcNow.AddMonths(7),
                        Description = "Activity 7 months in future",
                        Category = "travel",
                        City = "Berlin",
                        Venue = "All",
                        Attendees = new List<ActivityAttendee>
                        {
                            new ActivityAttendee
                            {
                                AppUser = users[0],
                                IsHost = true
                            },
                            new ActivityAttendee
                            {
                                AppUser = users[2],
                                IsHost = false
                            },
                        }
                    },
                    new Activity
                    {
                        Title = "Future Activity 8",
                        Date = DateTime.UtcNow.AddMonths(8),
                        Description = "Activity 8 months in future",
                        Category = "drinks",
                        City = "London",
                        Venue = "Pub",
                        Attendees = new List<ActivityAttendee>
                        {
                            new ActivityAttendee
                            {
                                AppUser = users[2],
                                IsHost = true
                            },
                            new ActivityAttendee
                            {
                                AppUser = users[1],
                                IsHost = false
                            },
                        }
                    }
                };

                await context.Activities.AddRangeAsync(activities);
                await context.SaveChangesAsync();
            }
        }

        public static async Task SeedData2(DataContext context, UserManager<AppUser> userManager)
        {
            await SeedData(context, userManager);

            if (userManager.Users.Count() < 20)
            {
                var users = new List<AppUser>
                {
                    new AppUser { DisplayName = "Bob Johnson", UserName = "bob@example.com", Email = "bob@example.com" },
                    new AppUser { DisplayName = "Jane Smith", UserName = "jane@example.com", Email = "jane@example.com" },
                    new AppUser { DisplayName = "Tom Brown", UserName = "tom@example.com", Email = "tom@example.com" },
                    new AppUser { DisplayName = "Alice Doe", UserName = "alice@example.com", Email = "alice@example.com" },
                    new AppUser { DisplayName = "Charlie Davis", UserName = "charlie@example.com", Email = "charlie@example.com" },
                    new AppUser { DisplayName = "David Evans", UserName = "david@example.com", Email = "david@example.com" },
                    new AppUser { DisplayName = "Emily Foster", UserName = "emily@example.com", Email = "emily@example.com" },
                    new AppUser { DisplayName = "Frank Gray", UserName = "frank@example.com", Email = "frank@example.com" },
                    new AppUser { DisplayName = "Grace Harris", UserName = "grace@example.com", Email = "grace@example.com" },
                    new AppUser { DisplayName = "Henry Irwin", UserName = "henry@example.com", Email = "henry@example.com" },
                    new AppUser { DisplayName = "Ivy Johnson", UserName = "ivy@example.com", Email = "ivy@example.com" },
                    new AppUser { DisplayName = "Jack Kelly", UserName = "jack@example.com", Email = "jack@example.com" },
                    new AppUser { DisplayName = "Katie Lee", UserName = "katie@example.com", Email = "katie@example.com" },
                    new AppUser { DisplayName = "Luke Miller", UserName = "luke@example.com", Email = "luke@example.com" },
                    new AppUser { DisplayName = "Nora Owens", UserName = "nora@example.com", Email = "nora@example.com" },
                    new AppUser { DisplayName = "Oscar Palmer", UserName = "oscar@example.com", Email = "oscar@example.com" },
                    new AppUser { DisplayName = "Penny Quinn", UserName = "penny@example.com", Email = "penny@example.com" },
                    new AppUser { DisplayName = "Quincy Rose", UserName = "quincy@example.com", Email = "quincy@example.com" },
                    new AppUser { DisplayName = "Ruby Scott", UserName = "ruby@example.com", Email = "ruby@example.com" },
                    new AppUser { DisplayName = "Sam Turner", UserName = "sam@example.com", Email = "sam@example.com" }
                };

                foreach (var user in users)
                {
                    await userManager.CreateAsync(user, "Pa$$w0rd");
                }

                var conversations = new List<Conversation>();

                // Create conversations between all users
                for (int i = 0; i < users.Count - 1; i++)
                {
                    for (int j = i + 1; j < users.Count; j++)
                    {
                        var conversation = new Conversation
                        {
                            User1 = users[i],
                            User2 = users[j],
                            Messages = new List<Message>
                        {
                            new Message { Sender = users[i], Content = $"Hello {users[j].DisplayName}!", SentAt = DateTime.UtcNow },
                            new Message { Sender = users[j], Content = $"Hi {users[i].DisplayName}!", SentAt = DateTime.UtcNow.AddMinutes(1) },
                            new Message { Sender = users[i], Content = $"How are You?", SentAt = DateTime.UtcNow.AddMinutes(2) },
                            new Message { Sender = users[j], Content = $"I'm fine", SentAt = DateTime.UtcNow.AddMinutes(3) },
                            // Add more messages as needed
                            // ...
                        }
                        };

                        conversations.Add(conversation);
                    }
                }
                var bob = await context.Users.FirstOrDefaultAsync(x => x.Email == "bob@test.com");
                for (int i = 0; i < users.Count - 1; i++)
                {
                    var conversation = new Conversation
                    {
                        User1 = bob,
                        User2 = users[i],
                        Messages = new List<Message>
                        {
                            new Message { Sender = bob, Content = $"Hello {users[i].DisplayName}!", SentAt = DateTime.UtcNow },
                            new Message { Sender = users[i], Content = $"Hi {bob.DisplayName}!", SentAt = DateTime.UtcNow.AddMinutes(1) },
                            new Message { Sender = bob, Content = $"How are You?", SentAt = DateTime.UtcNow.AddMinutes(2) },
                            new Message { Sender = users[i], Content = $"I'm fine", SentAt = DateTime.UtcNow.AddMinutes(3) },
                        }
                    };

                    conversations.Add(conversation);
                }

                await context.Conversations.AddRangeAsync(conversations);
                await context.SaveChangesAsync();

            }
        }

    }
}
