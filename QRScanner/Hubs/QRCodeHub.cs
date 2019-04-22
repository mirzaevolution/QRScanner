using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using System.IO;
using QRScanner.Models;
using QRScanner.Helpers;
using System.Text.RegularExpressions;

namespace QRScanner.Hubs
{
    public class QRCodeHub:Hub
    {
        public void ReadQRCode(string base64Image,string id)
        {
            try
            {
                if (!string.IsNullOrEmpty(base64Image))
                {
                    string pattern = @"(data:image/jpeg;base64,|data:image/png;base64,)";
                    base64Image = Regex.Replace(base64Image, pattern, string.Empty, RegexOptions.Compiled | RegexOptions.IgnoreCase);
                    byte[] imageBytes = Convert.FromBase64String(base64Image);
                    MemoryStream ms = new MemoryStream(imageBytes);
                    DataResult<QRReaderModel> scanningResult = QRScannerHelpers.ScanQR(ms);
                    if (scanningResult.Status.IsSuccess)
                    {
                        Clients.Caller.onDecodeSuccess(scanningResult.Data,id);
                    }
                    else
                    {
                        Clients.Caller.onError(scanningResult.Status.Errors,id);
                    }
                }
                else
                {
                    Clients.Caller.onError("Invalid QR Code. QR Code image is null.",id);
                }
            }
            catch(Exception ex)
            {
                string error = ex.Message;
                Clients.Caller.OnError(error,id);
            }
        }
    }
}