using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QRScanner.Models
{
    public class ScanQRPayLoad
    {
        public string Base64Image { get; set; }
        public string Id { get; set; }
    }
}