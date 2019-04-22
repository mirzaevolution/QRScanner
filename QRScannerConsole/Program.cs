using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ZXing;

namespace QRScannerConsole
{
    class Program
    {
        static void QRCodeScanner(string path)
        {
            try
            {
                // create a barcode reader instance
                IBarcodeReader reader = new BarcodeReader();
                // load a bitmap
                var barcodeBitmap = (Bitmap)Bitmap.FromFile(path);
                // detect and decode the barcode inside the bitmap
                var result = reader.Decode(barcodeBitmap);
                // do something with the result
                if (result != null)
                {
                    Console.WriteLine(result.BarcodeFormat.ToString());
                    Console.WriteLine(result.Text);
                }
            }
            catch(Exception ex)
            {
                Console.WriteLine(ex);
            }
        }
        static void Main(string[] args)
        {
            Console.Write("Enter the path: ");
            string path = Console.ReadLine();
            QRCodeScanner(path);
            Console.ReadLine();
        }
    }
}
