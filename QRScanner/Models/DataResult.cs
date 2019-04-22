using System.Collections.Generic;

namespace QRScanner.Models
{
    public class StatusResult
    {
        public bool IsSuccess { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public StatusResult() { }
        public StatusResult(bool isSuccess, List<string> errors)
        {
            IsSuccess = isSuccess;
            Errors = errors;
        }
    }
    public class DataResult<T>
    {
        public T Data { get; set; }
        public StatusResult Status { get; set; }
        public DataResult() { }
        public DataResult(T data, StatusResult statusResult)
        {
            Data = data;
            Status = statusResult;
        }
    }
}