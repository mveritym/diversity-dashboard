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
        hide_file_uploader();
        show_spinner();
        analyze_data(file);
    }
}

function get_data_file (fileName) {
    $.ajax({
        type: "GET",
        url: "/analyze-data",
        data: { fileName: fileName },
        success: function(outfile) {
            var matchedName = outfile.match("\"(.+)\""); // if file name was printed by R script, need to extract file name
            outfile = matchedName ? matchedName[1] : outfile;
            load_data(outfile);
        }
    });
}

function load_data (fileName) {
    $.ajax({
        type: "GET",
        url: "/load-file",
        data: { fileName: fileName },
        success: function(data) {
            hide_spinner();
            show_chart();
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
