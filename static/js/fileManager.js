var file_manager = function () {

    var dropzone, errorBar;

    var viewController = view_controller();

    var upload_file = function () {
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
                this.on('error', on_file_upload_error);
                this.on('success', on_file_upload_success);
            }
        });
    };

    var on_file_upload_error = function (file, message) {
        dropzone.removeFile(file);
        if (message) {
            errorBar.text(message).show();
            errorBar.fadeOut(3000);
        }
    };

    var on_file_upload_success= function(file) {
        validate_file(file, add_file, function(file, message) {
            on_file_upload_error(file, message);
            delete_file(file);
        });
    };

    var add_file = function(file) {
        viewController.shrink_dropzone();
        $("button.success").click(function() {
            start_analysis(file.name);
        });
        $("button.upload-again").click(function() {
            viewController.expand_dropzone();
            on_file_upload_error(file);
            delete_file(file);
            delete_analysis();
        });
    };

    var delete_file = function (file) {
        $.ajax({
            type: "GET",
            url: "/delete-file",
            data: { fileName: file.name },
            error: function (err) {
                console.log(err);
            }
        });
    };

    var delete_analysis = function (file) {
        $.ajax({
            type: "GET",
            url: "/delete-analysis",
            error: function (err) {
                console.log(err);
            }
        });
    }

    var validate_file = function (file, onValid, onInvalid) {
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
    };

    var start_analysis = function (fileName) {
        viewController.hide_all();
        viewController.show_spinner();
        analyze_data(fileName);
    };

    var analyze_data = function (fileName) {
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
    };

    var load_data = function (fileName) {
        $.ajax({
            type: "GET",
            url: "/load-file",
            data: { fileName: fileName },
            success: function(data) {
                viewController.hide_spinner();
                viewController.show_chart();
                visualize(data);
            }
        });
    };

    return {
        upload_file: upload_file,
        analyze_data: analyze_data
    }
}

$(function() {
    $.getScript("js/dropzone.js", function() {
        file_manager().upload_file();
    });
})
