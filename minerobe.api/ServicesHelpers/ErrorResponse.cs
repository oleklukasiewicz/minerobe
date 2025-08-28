using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace minerobe.api.ServicesHelpers
{
    public class ErrorResponse
    {
        public string Code { get; set; }
        public int Status { get; set; } = 500;
        public string Message { get; set; }
        public ObjectResult ToHttpReponse()
        {
            return new ObjectResult(this)
            {
                StatusCode = Status,
                Value = new
                {
                    Status = this.Status,
                    Code = this.Code,
                    Message = this.Message
                },
            };
        }
    }
}
