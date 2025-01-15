using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core
{
    public class Result<T>
    {
        public bool IsSuccess { get; set; }
        public T Value { get; set; }

        public string Error { get; set; }
        public int? StatusCode { get; set; } // Optional for more granular control

        public static Result<T> Success(T Value) => new Result<T> { IsSuccess = true, Value = Value };
        public static Result<T> Failure(string error) => new Result<T> { IsSuccess = false, Error = error };
        public static Result<T> Unauthorized(string error = "Unauthorized")
            => new Result<T> { IsSuccess = false, Error = error, StatusCode = 401 };
    }
}
