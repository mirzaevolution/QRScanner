using QRScanner.Models;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ZXing;
namespace QRScanner.Helpers
{
    public class QRScannerHelpers
    {
        public static DataResult<QRReaderModel> ScanQR(Stream stream)
        {
            bool success = true;
            List<string> errors = new List<string>();
            QRReaderModel model = new QRReaderModel();
            try
            {
                // create a barcode reader instance
                IBarcodeReader reader = new BarcodeReader();
                // load a bitmap
                var barcodeBitmap = (Bitmap)Bitmap.FromStream(stream);
                // detect and decode the barcode inside the bitmap
                var result = reader.Decode(barcodeBitmap);
                // do something with the result
                if (result != null)
                {
                    model.BarcodeFormat = result.BarcodeFormat.ToString();
                    model.Content = result.Text;
                }
            }
            catch (Exception ex)
            {
                success = false;
                while (ex != null)
                {
                    errors.Add(ex.Message);
                    ex = ex.InnerException;
                }
            }
            return new DataResult<QRReaderModel>(model, new StatusResult(success, errors));
        }
    }
}