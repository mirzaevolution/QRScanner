/// <reference path="../jquery.signalr-2.4.1.min.js" />
/// <reference path="../jsqrcode-master/src/alignpat.js" />
/// <reference path="../jsqrcode-master/src/bitmat.js" />
/// <reference path="../jsqrcode-master/src/bmparser.js" />
/// <reference path="../jsqrcode-master/src/datablock.js" />
/// <reference path="../jsqrcode-master/src/databr.js" />
/// <reference path="../jsqrcode-master/src/datamask.js" />
/// <reference path="../jsqrcode-master/src/decoder.js" />
/// <reference path="../jsqrcode-master/src/detector.js" />
/// <reference path="../jsqrcode-master/src/errorlevel.js" />
/// <reference path="../jsqrcode-master/src/findpat.js" />
/// <reference path="../jsqrcode-master/src/formatinf.js" />
/// <reference path="../jsqrcode-master/src/gf256.js" />
/// <reference path="../jsqrcode-master/src/gf256poly.js" />
/// <reference path="../jsqrcode-master/src/grid.js" />
/// <reference path="../jsqrcode-master/src/qrcode.js" />
/// <reference path="../jsqrcode-master/src/rsdecoder.js" />
/// <reference path="../jsqrcode-master/src/version.js" />
/// <reference path="../webqr/llqrcode.js" />
/// <reference path="../webqr/plusone.js" />


let qrHub = $.connection.qRCodeHub;

var gContextStandard = null;
var gCanvasStandard = null;
var c = 0;
var stype = 0;
var gUM = false;
var webkit = false;
var moz = false;
var v = null;
var cameraStandardLoaded = false;


var vidhtml = '<video id="VideoCoreStandard" class="video-item" autoplay></video>';



let CoreMethods = {
    EncodeImageFileAsUrl: function () {

        var filesSelected = document.getElementById("WebQRImage").files;
        if (filesSelected.length > 0) {
            var fileToLoad = filesSelected[0];

            var fileReader = new FileReader();

            fileReader.onload = function (fileLoadedEvent) {
                var srcData = fileLoadedEvent.target.result; // <--- data: base64

                var newImage = document.createElement('img');

                newImage.classList.add("img-responsive");
                newImage.src = srcData;

                document.getElementById("WebQRImagePreview").innerHTML = newImage.outerHTML;
                //console.log("Converted Base64 version is " + document.getElementById("WebQRImagePreview").innerHTML);
            };
            fileReader.readAsDataURL(fileToLoad);
        }
    },
    DecodeImageFromBase64: function (data, callback) {
        // set callback
        qrcode.callback = callback;
        // Start decoding
        qrcode.decode(data);
    }
};
let Events = {
    Init: function () {
        this.ScanQRClick();
        this.ButtonWebModalClose();
        this.RealtimeScanner();
        
    },
    OnCameraCaptured: function () {
        var filesSelected = document.getElementById("MobileQRImage").files;
        if (filesSelected.length > 0) {
            var fileToLoad = filesSelected[0];

            var fileReader = new FileReader();

            fileReader.onload = function (fileLoadedEvent) {
              
                var srcData = fileLoadedEvent.target.result; // <--- data: base64
                CoreMethods.DecodeImageFromBase64(srcData, function (info) {
                    if (info) {

                        if (info.toLowerCase() === "error decoding qr code") {
                            alert("Bad QR Code Image!");


                        } else {

                            $("#QrContentMobile").val(info);
                            alert("QR code decoded successfully");
                            console.log(info);
                        }
                    }
                });
            };
            fileReader.readAsDataURL(fileToLoad);
        }
    },
    OnCameraCapturedUrl: function () {
        var filesSelected = document.getElementById("MobileQRImageUrlScan").files;
        if (filesSelected.length > 0) {
            var fileToLoad = filesSelected[0];
            var urlPattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
            var fileReader = new FileReader();

            fileReader.onload = function (fileLoadedEvent) {

                var srcData = fileLoadedEvent.target.result; // <--- data: base64
                CoreMethods.DecodeImageFromBase64(srcData, function (info) {
                    if (info) {
                        if (info.toLowerCase() === "error decoding qr code") {
                            alert("Bad QR Code Image!");
                        } else {
                            if (urlPattern.test(info)) {
                                //window.open(info, '_blank');
                                location.href = info;
                            } else {
                                alert("QR code doesn't contain valid url!");
                            }
                        }
                    }
                });
            };
            fileReader.readAsDataURL(fileToLoad);
        }
    },

    ScanQRClick: function () {
        $("#ButtonOpenWebModal").click(function () {
            $("#WebModal").modal();

        });
        $("#ButtonManualQRScan").click(function () {
            //$("#MobileModal").modal();
            $("#MobileQRImage").trigger("click");
        });
        $("#ButtonManualQRScanUrl").click(function () {
            $("#MobileQRImageUrlScan").trigger("click");
        });
        $("#ButtonWebUpload").click(function () {
            var srcData = $("#WebQRImagePreview img").attr("src");
            $.blockUI({ message: 'Loading..' });
            qrHub.server.readQRCode(srcData, "desktop");

        });
        $("#ButtonMobileUpload").click(function () {
            var filesSelected = document.getElementById("MobileQRImage").files;
            if (filesSelected.length > 0) {
                var srcData = $("#MobileQRImagePreview img").attr("src");
                decodeImageFromBase64(srcData, function (info) {
                    if (info) {

                        if (info.toLowerCase() === "error decoding qr code") {
                            alert("Bad QR Code Image!");
                            $("#ButtonMobileModalClose").trigger("click");

                        } else {

                            $("#QrContentMobile").val(info);
                            alert("QR code decoded successfully");
                            $("#ButtonMobileModalClose").trigger("click");
                            console.log(info);
                        }
                    }
                });

                /*
                if (filesSelected[0].size <= 128000) {
                    $.blockUI({ message: 'Loading..' });

                    qrHub.server.readQRCode(srcData, "mobile");

                }
                else {
                    $.ajax({
                        url: "/home/ScanQRCode",
                        type: "POST",
                        data: {
                            base64Image: srcData,
                            id: "mobile"
                        },
                        beforeSend: function () {
                            $.blockUI({ message: 'Loading..' });

                        },
                        success: function (response) {
                            $.unblockUI();

                            if (response.Status.IsSuccess) {

                                $("#QrContentMobile").val(response.Data.Content);
                                alert("QR code decoded successfully");
                                $("#ButtonMobileModalClose").trigger("click");
                            } else {
                                var errorList = "<ul>";
                                var errors = response.Status.Errors;
                                for (var i = 0; i < errors.length; i++) {
                                    errorList += "<li>" + errors[i] + "</li>";
                                }
                                $("#ErrorTextMobile").text(errorList);
                                $("#ErrorTextMobile").show();
                            }

                        },
                        error: function () {
                            $.unblockUI();
                        }
                    });
                }*/
            }
        });
        $("#ButtonCameraScan").click(function () {
            Webcam.snap(function (data_uri) {
                //$("#CameraBoxResult").html('<img class="img-responsive" id="CameraImageResult" src="' + data_uri + '"/>');
                qrHub.server.readQRCode(data_uri, "mobile");

            });
        });
    },
    ButtonWebModalClose: function () {
        $("#ButtonWebModalClose").click(function () {
            $("#ErrorText").text("");
            $("#ErrorText").hide();
            $("#WebQRImage").val("");
            $("#WebQRImagePreview").empty();
        });
        $("#ButtonMobileModalClose").click(function () {
            $("#ErrorTextMobile").text("");
            $("#ErrorTextMobile").hide();

            $("#MobileQRImage").val("");
            $("#MobileQRImagePreview").empty();
        });
    },
    RealtimeScanner: function () {
        $("#ButtonRefreshCameraStandard").click(function () {
            $("#ScanResultStandard").text("[#]....Detecting");
            setTimeout(RealtimeScanner.StandardScanner.CaptureToCanvas, 500);


        });
    }
};
let SignalRClientHandlers = {
    Init: function () {
        this.OnDecodeSuccess();
        this.OnError();
    },
    OnError: function () {
        qrHub.client.onError = function (response, id) {
            $.unblockUI();
            if (typeof response == "string") {
                if (id == "desktop") {
                    $("#ErrorText").text(response);
                    $("#ErrorText").show();
                } else {
                    $("#ErrorTextMobile").text(response);
                    $("#ErrorTextMobile").show();

                }
                
            } else if (typeof response == "object") {
                if (id == "desktop") {
                    var errorList = "<ul>";
                    for (var i = 0; i < response.length; i++) {
                        errorList += "<li>" + response[i] + "</li>";
                    }
                    $("#ErrorText").text(errorList);
                    $("#ErrorText").show();
                } else {
                    var errorList = "<ul>";
                    for (var i = 0; i < response.length; i++) {
                        errorList += "<li>" + response[i] + "</li>";
                    }
                    $("#ErrorTextMobile").text(errorList);
                    $("#ErrorTextMobile").show();
                }

            }

        };
    },
    OnDecodeSuccess: function () {
        qrHub.client.onDecodeSuccess = function (response, id) {
            $.unblockUI();
            if (response) {
                console.log(response);
                if (response.Content) {
                    if (id == "desktop") {
                        $("#QrContent").val(response.Content);
                        alert("QR code decoded successfully");
                        $("#ButtonWebModalClose").trigger("click");
                    } else {
                        $("#QrContentMobile").val(response.Content);
                        alert("QR code decoded successfully");
                        $("#ButtonMobileModalClose").trigger("click");
                    }

                } else {
                    alert("Bad QR Code image");
                }
            }
        };
    }

};
let RealtimeScanner = {
    StandardScanner: {
        InitScanner: function () {
            if (!cameraStandardLoaded) {
                cameraStandardLoaded = true;
                if (RealtimeScanner.StandardScanner.IsCanvasSupported() && window.File && window.FileReader) {

                    RealtimeScanner.StandardScanner.InitCanvas(800, 600);
                    qrcode.callback = RealtimeScanner.StandardScanner.OnQRCodeCallback;
                    RealtimeScanner.StandardScanner.RefreshWebcam();
                }
                else {
                    alert("Sorry your browser doesn't support our QR Code Scanner");
                }
            }
            
        },
        InitCanvas: function (width,height) {
            gCanvasStandard = document.getElementById("qr-canvas");
            gCanvasStandard.style.width = width + "px";
            gCanvasStandard.style.height = height + "px";
            gCanvasStandard.width = width;
            gCanvasStandard.height = height;
            gContextStandard = gCanvasStandard.getContext("2d");
            gContextStandard.clearRect(0, 0, width, height);
        },
        IsCanvasSupported: function () {
            var elem = document.createElement('canvas');
            return !!(elem.getContext && elem.getContext('2d'));
        },
        CaptureToCanvas: function () {
            if (stype != 1)
                return;
            if (gUM) {
                try {
                    gContextStandard.drawImage(v, 0, 0);
                    try {
                        qrcode.decode();
                    }
                    catch (e) {
                        //console.log(e);
                        setTimeout(RealtimeScanner.StandardScanner.CaptureToCanvas, 500);
                    }
                }
                catch (e) {
                    //console.log(e);
                    setTimeout(RealtimeScanner.StandardScanner.CaptureToCanvas, 500);

                }
            }
        },
        RefreshWebcam: function () {
            var options = true;
            if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
                try {
                    navigator.mediaDevices.enumerateDevices()
                        .then(function (devices) {
                            devices.forEach(function (device) {
                                if (device.kind === 'videoinput') {
                                    if (device.label.toLowerCase().search("back") > -1)
                                        options = { 'deviceId': { 'exact': device.deviceId }, 'facingMode': 'environment' };
                                }
                                console.log(device.kind + ": " + device.label + " id = " + device.deviceId);
                            });
                            RealtimeScanner.StandardScanner.SetWebcam(options);
                        });
                }
                catch (e) {
                    console.log(e);
                }
            }
            else {
                alert("No navigator.mediaDevices.enumerateDevices");
                RealtimeScanner.StandardScanner.SetWebcam(options);
            }
        },
        SetWebcam: function (options) {
            console.log(options);
            $("#ScanResultStandard").text("[#]....Detecting");
            if (stype == 1) {
                setTimeout(RealtimeScanner.StandardScanner.CaptureToCanvas, 500);
                return;
            }
            var n = navigator;
            
            $("#VideoDivStandard").html(vidhtml);
            v = document.getElementById("VideoCoreStandard");

            if (options==true) {
                options = '{ facingMode: { exact: "environment" } }';
            }

            if (n.mediaDevices.getUserMedia) {
                var optionsToUse = { video: options, audio: false };
                if (options == true) {
                    optionsToUse = { video: { facingMode: { exact: "environment" } }, audio: false };
                }
                n.mediaDevices.getUserMedia(optionsToUse).
                    then(function (stream) {
                        RealtimeScanner.StandardScanner.OnSuccess(stream);
                    }).catch(function (error) {
                        RealtimeScanner.StandardScanner.OnError(error);
                    });
            }
            else
                var optionsToUse = { video: options, audio: false };
                if (options == true) {
                    optionsToUse = { video: { facingMode: { exact: "environment" } }, audio: false };
                }
                if (n.getUserMedia) {
                    webkit = true;
                    n.getUserMedia(optionsToUse, RealtimeScanner.StandardScanner.OnSuccess, RealtimeScanner.StandardScanner.OnError);
                }
                else
                    if (n.webkitGetUserMedia) {
                        webkit = true;
                        n.webkitGetUserMedia(optionsToUse, RealtimeScanner.StandardScanner.OnSuccess, RealtimeScanner.StandardScanner.OnError);
                    }
            

            stype = 1;
            setTimeout(RealtimeScanner.StandardScanner.CaptureToCanvas, 500);

        },
        OnQRCodeCallback: function (a) {
            var urlPattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
            if (urlPattern.test(a)) {
                if (confirm("Do you want to be redirected to " + a + " ?")) {
                    location.href = a;
                } else {

                    $("#ScanResultStandard").text(a);
                    setTimeout(RealtimeScanner.StandardScanner.CaptureToCanvas, 500);
                }
            } else {
                $("#ScanResultStandard").text(a);
                setTimeout(RealtimeScanner.StandardScanner.CaptureToCanvas, 500);
            }
        },
        OnSuccess: function (stream) {
            v.srcObject = stream;
            v.play();

            gUM = true;
            setTimeout(RealtimeScanner.StandardScanner.CaptureToCanvas, 500);

        },
        OnError: function (error) {
            console.log(error);
            gUM = false;
            return;
        }
    },
    UrlScanner: {

    }
};



$(document).ready(function () {
    SignalRClientHandlers.Init();

    $.connection.hub.start().done(function () {
        console.log("#...Connected to server");
    }).fail(function () {
        console.log("#...Failed to connect to server");
    });
    Events.Init();
});
