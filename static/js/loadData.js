function upload_file () {

    var errorBar = $("#dropzone-error span");
    errorBar.hide();

    window.Dropzone;
    Dropzone.autoDiscover = false;

    var dropzone = new Dropzone(".dropzone", {
        url: "/upload-file",
        maxFiles: 1,
        acceptedFiles: '.csv',
        clickable: true,
        init: function () {
            this.on('error', removeFile);
            //this.on('addedfile', processFile);

            $.ajax({
                type: "GET",
                url: "/get-existing-files",
                success: function(result) {
                    var existingFile = { name: result.file, size: result.fsize }
                    dropzone.options.addedfile.call(dropzone, existingFile);
                    dropzone.options.thumbnail.call(dropzone, existingFile, "images/csv_icon.png");
                    dropzone.emit("complete", existingFile);
                }
            });
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
