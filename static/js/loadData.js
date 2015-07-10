var dropzone, errorBar;

function upload_file () {

    errorBar = $("#dropzone-error span");
    errorBar.hide();

    window.Dropzone;
    Dropzone.autoDiscover = false;

    dropzone = new Dropzone(".dropzone", {
        url: "/upload-file",
        maxFiles: 1,
        acceptedFiles: '.csv',
        clickable: true,
        init: function () {
            this.on('error', remove_file);
            this.on('success', function (file) {
                validate_file(file, function(){}, remove_file);
            });
            this.on('complete', function (file) {
                console.log(file);
                shrink_dropzone();
            });

            $.ajax({
                type: "GET",
                url: "/get-existing-files",
                success: function(result) {
                    if (result.length != 0) {
                        validate_file(result, show_existing_file, function(){});
                    }
                }
            });
        }
    });
}

function show_existing_file(result) {
    var existingFile = { name: result.name, size: result.size }
    dropzone.options.addedfile.call(dropzone, existingFile);
    dropzone.options.thumbnail.call(dropzone, existingFile, "images/csv_icon.png");
    dropzone.emit("complete", existingFile);
}

function start_analysis (file) {
    hide_file_uploader();
    show_spinner();
    analyze_data(file);
}

function remove_file (file, message) {
    dropzone.removeFile(file);
    errorBar.text(message).show();
    errorBar.fadeOut(3000);
}

function validate_file (file, onValid, onInvalid) {
    $.ajax({
        type: "GET",
        url: "/validate-file",
        data: { fileName: file.name },
        success: function(isValid) {
            if (isValid) {
                onValid(file);
            } else {
                onInvalid(file, "Missing headers");
            }
        }
    });
}

function analyze_data (fileName) {
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
