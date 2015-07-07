function upload_file () {

    var errorBar = $("#dropzone-error span");
    errorBar.hide();

    var dropzone = $("div#include-dropzone").dropzone({
        url: "/upload-file",
        maxFiles: 1,
        acceptedFiles: '.csv',
        clickable: true,
        init: function () {
            this.on('error', removeFile);
            this.on('addedfile', processFile);
        }
    });

    function removeFile (file, message) {
        this.removeFile(file);
        errorBar.text(message).show();
        errorBar.fadeOut(3000);
    }

    function processFile (file) {
        console.log("Uploaded file! " + file.name);
        hide_file_uploader();
        show_chart();
    }
}

function get_data_file () {
    $.ajax({
      url: "/loadData",
    })
    .done(function(fileName) {
        var matchedName = fileName.match("\"(.+)\""); // if file name was printed by R script, need to extract file name
        fileName = matchedName ? matchedName[1] : fileName;
        load_data(fileName);
        return fileName;
    });
}

function load_data (fileName) {
    $.ajax({
        type: "GET",
        url: "/loadFile",
        data: { fileName: fileName },
        success: function(data) {
            visualize(data);
        },
        error: function(xhr, ajaxOptions, thrownError) {
            alert("Status: " + xhr.status + "     Error: " + thrownError);
        }
    });
}

$(function() {
    $.getScript("js/dropzone.js", function() {
        upload_file();
    });
})
