using Microsoft.AspNet.SignalR;
using QRScanner.Helpers;
using QRScanner.Hubs;
using QRScanner.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Mvc;

namespace QRScanner.Controllers
{
    public class HomeController : Controller
    {

        public ActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public ActionResult ScanQRCode(ScanQRPayLoad payload)
        {
            DataResult<QRReaderModel> scanningResult = new DataResult<QRReaderModel>();

            try
            {
                List<string> errors = new List<string>();
                if (!string.IsNullOrEmpty(payload.Base64Image))
                {
                    string pattern = @"(data:image/jpeg;base64,|data:image/png;base64,)";
                    payload.Base64Image = Regex.Replace(payload.Base64Image, pattern, string.Empty, RegexOptions.Compiled | RegexOptions.IgnoreCase);
                    byte[] imageBytes = Convert.FromBase64String(payload.Base64Image);
                    MemoryStream ms = new MemoryStream(imageBytes);
                    scanningResult = QRScannerHelpers.ScanQR(ms);
                    return Json(scanningResult);

                }
                else
                {
                    scanningResult.Status.Errors.Add("Invalid QR Code. QR Code image is null.");
                    
                       
                    return Json(scanningResult);

                }
            }
            catch (Exception ex)
            {
                scanningResult.Status.Errors.Add(ex.Message);
            }
            return Json(scanningResult);

        }
    }
}