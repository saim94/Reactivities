using API.Extensions;
using Application.Core;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BaseApiController : ControllerBase
    {
        private IMediator _mediator;

        protected IMediator Mediator => _mediator ??=
            HttpContext.RequestServices.GetService<IMediator>();

        protected ActionResult HandleResult<T>(Result<T> result)
        {
            if (result == null) return NotFound();
            if (result.IsSuccess && result.Value != null)
                return Ok(result.Value);
            if (result.IsSuccess && result.Value == null)
                return NotFound();

            return BadRequest(result.Error);
        }
        protected ActionResult HandlePagedResult<T>(Result<PagedList<T>> result)
        {
            if (result == null) return NotFound();
            if (result.IsSuccess && result.Value != null)
            {
                Response.AddPaginationHeader(result.Value.CurrentPage, result.Value.PageSize,
                    result.Value.TotalCount, result.Value.Totalpages);
                return Ok(result.Value);
            }
            if (result.IsSuccess && result.Value == null)
                return NotFound();

            return BadRequest(result.Error);
        }

        protected ActionResult HandleTypedResult<T>(Result<ReturnType<T>> result)
        {
            if (result == null) return NotFound();
            if (result.IsSuccess && result.Value != null)
            {
                Response.AddPaginationHeader(result.Value.CurrentPage, result.Value.PageSize,
                    result.Value.TotalCount, result.Value.Totalpages);
                return Ok(result.Value.ConversationDto);
            }
            if (result.IsSuccess && result.Value == null)
                return NotFound();

            return BadRequest(result.Error);
        }

        //protected Task<SignalRMessage> HandleResultAsync<T>(Result<T> result)
        //{
        //    if (result == null) return Task.FromResult(null);
        //    if (result.IsSuccess && result.Value != null)
        //        return Task.FromResult(new SignalRMessage(result.Value));
        //    if (result.IsSuccess && result.Value == null)
        //        return Task.FromResult(null);

        //    return Task.FromResult(new SignalRMessage(result.Error));
        //}
        //protected Task<SignalRMessage> HandlePagedResultAsync<T>(Result<PagedList<T>> result)
        //{
        //    if (result == null) return Task.FromResult(null);
        //    if (result.IsSuccess && result.Value != null)
        //    {
        //        var message = new SignalRMessage(result.Value);
        //        message.AddPaginationHeader(result.Value.CurrentPage, result.Value.PageSize,
        //            result.Value.TotalCount, result.Value.Totalpages);
        //        return Task.FromResult(message);
        //    }
        //    if (result.IsSuccess && result.Value == null)
        //        return Task.FromResult(null);

        //    return Task.FromResult(new SignalRMessage(result.Error));
        //}
    }
}
