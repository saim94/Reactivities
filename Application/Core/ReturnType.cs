using Application.ReturnDTOs;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core
{
    public class ReturnType<T>
    {
        public ReturnType(ConversationDto conversationDto, int count, int pageNumber, int pageSize)
        {
            CurrentPage = pageNumber;
            Totalpages = (int)Math.Ceiling(count / (double)pageSize);
            PageSize = pageSize;
            TotalCount = count;
            ConversationDto= conversationDto;
        }
        public int CurrentPage { get; set; }
        public int Totalpages { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }

        public ConversationDto ConversationDto { get; set; }

        public static ReturnType<T> Create(ConversationDto conversationDto, int pageNumber,
            int pageSize)
        {
            var messgaesDtos = conversationDto.Messages;
            var count = messgaesDtos.Count;
            var items = messgaesDtos.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
            conversationDto.Messages = items;
            return new ReturnType<T>(conversationDto, count, pageNumber, pageSize);
        }
    }
}
