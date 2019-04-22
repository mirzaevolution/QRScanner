/// <reference path="../jquery.signalr-2.4.1.min.js" />
let qrHub = $.connection.qRCodeHub;
let Events = {
    Init: function () {
        this.ScanQRClick();
        this.ButtonWebModalClose();
        //this.CameraInit();
    },
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
    OnCameraCaptured: function () {
        var filesSelected = document.getElementById("MobileQRImage").files;
        if (filesSelected.length > 0) {
            var fileToLoad = filesSelected[0];

            var fileReader = new FileReader();

            fileReader.onload = function (fileLoadedEvent) {
              
                var srcData = fileLoadedEvent.target.result; // <--- data: base64

                var newImage = document.createElement('img');

                newImage.classList.add("img-responsive");
                newImage.src = srcData;
                document.getElementById("MobileQRImagePreview").innerHTML = newImage.outerHTML;

                
                //console.log("Converted Base64 version is " + document.getElementById("WebQRImagePreview").innerHTML);
            };
            fileReader.readAsDataURL(fileToLoad);
        }
    },
    ScanQRClick: function () {
        $("#ButtonOpenWebModal").click(function () {
            $("#WebModal").modal();

        });
        $("#ButtonOpenMobileModal").click(function () {
            $("#MobileModal").modal();

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

                if (filesSelected[0].size <= 128000) {
                    $.blockUI({ message: 'Loading..' });

                    qrHub.server.readQRCode(srcData, "mobile");

                } else {

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
                }
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
    CameraInit: function () {
        Webcam.set({
            width: 320,
            height: 240,
            image_format: 'jpeg',
            jpeg_quality: 120
        });
        Webcam.attach('#CameraBox');
      
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
$(document).ready(function () {
    SignalRClientHandlers.Init();

    $.connection.hub.start().done(function () {
        console.log("#...Connected to server");
    }).fail(function () {
        console.log("#...Failed to connect to server");
    });
    Events.Init();
});
