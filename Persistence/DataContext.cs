﻿using Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Emit;
using System.Text;
using System.Threading.Tasks;


namespace Persistence
{
    public class DataContext : IdentityDbContext<AppUser>
    {
        public DataContext(DbContextOptions options) : base(options)
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);

            // Enable sensitive data logging
            //optionsBuilder.EnableSensitiveDataLogging();
        }

        public DbSet<Activity> Activities { get; set; }
        public DbSet<ActivityAttendee> ActivityAttendees { get; set; }
        public DbSet<Photo> Photos { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<UserFollowing> UserFollowings { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Conversation> Conversations { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<ActivityAttendee>(x => x.HasKey(aa => new { aa.AppUserId, aa.ActivityId }));

            builder.Entity<ActivityAttendee>()
                .HasOne(u => u.AppUser)
                .WithMany(a => a.Activities)
                .HasForeignKey(aa => aa.AppUserId);

            builder.Entity<ActivityAttendee>()
                .HasOne(u => u.Activity)
                .WithMany(a => a.Attendees)
                .HasForeignKey(aa => aa.ActivityId);

            builder.Entity<Comment>()
                .HasOne(a => a.Activity)
                .WithMany(c => c.Comments)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<UserFollowing>(b =>
            {
                b.HasKey(k => new { k.ObserverId, k.TargetId });

                b.HasOne(o => o.Observer)
                .WithMany(f => f.Followings)
                .HasForeignKey(o => o.ObserverId)
                .OnDelete(DeleteBehavior.Cascade);

                b.HasOne(o => o.Target)
                .WithMany(f => f.Followers)
                .HasForeignKey(o => o.TargetId)
                .OnDelete(DeleteBehavior.Cascade);
            });

            //builder.Entity<Conversation>()
            //    .HasKey(k => new { k.User1_Id, k.User2_Id });

            builder.Entity<Conversation>()
                .HasOne(c => c.User1)
                .WithMany(u => u.Conversations)
                .HasForeignKey(c => c.User1_Id);

            builder.Entity<Conversation>()
                .HasOne(c => c.User2)
                .WithMany()
                .HasForeignKey(c => c.User2_Id);

            builder.Entity<Message>()
                .HasOne(m => m.Conversation)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.ConversationId);

            //builder.Entity<Notification>()
            //            .HasMany(n => n.AppUserNotifications)
            //            .WithOne(aun => aun.Notification)
            //            .HasForeignKey(aun => aun.NotificationId);

            //builder.Entity<AppUser>()
            //    .HasMany(u => u.Notifications)
            //    .WithOne(aun => aun.User)
            //    .HasForeignKey(aun => aun.UserId);

            builder.Entity<Notification>()
                .HasKey(n => n.NotificationId);

            builder.Entity<AppUser>()
                .HasMany(u => u.Notifications)
                .WithOne(u=>u.User)
                .HasForeignKey(n => n.UserId); // Assuming UserId is the foreign key in Notification referring to AppUser
        }

        //public int GetNextConversationId()
        //{
        //    using (var command = Database.GetDbConnection().CreateCommand())
        //    {
        //        command.CommandText = "SELECT nextval('\"Conversations_ConversationId_seq\"')";
        //        Database.OpenConnection();
        //        using (var result = command.ExecuteReader())
        //        {
        //            if (result.Read() && result[0] != DBNull.Value)
        //            {
        //                // Value obtained by nextval
        //                var nextValue = Convert.ToInt32(result[0]);

        //                // If you are using transactions, commit the transaction here
        //                // Database.CurrentTransaction.Commit();

        //                return nextValue;
        //            }
        //        }
        //    }


        //    // Handle the case where the sequence retrieval fails.
        //    throw new InvalidOperationException("Unable to retrieve the next value from the sequence.");
        //}
    }
}
