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
                this.on('error', remove_file);
                this.on('success', on_dropzone_success);
                get_existing_files();
            }
        });
    };

    var on_dropzone_success= function(file) {
        validate_file(file, add_file, function(file, message) {
            remove_file(file, message);
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
            remove_file(file);
            delete_file(file);
        });
    };

    var remove_file = function (file, message) {
        dropzone.removeFile(file);
        errorBar.text(message).show();
        errorBar.fadeOut(3000);
    };

    var delete_file = function (file) {
        $.ajax({
            type: "GET",
            url: "/delete-file",
            data: { fileName: file.name },
            error: function (err) {
                console.log(err);
            }
        })
    };

    var get_existing_files = function() {
        $.ajax({
            type: "GET",
            url: "/get-existing-files",
            success: function(result) {
                if (result.length != 0) {
                    validate_file(result, show_existing_file, delete_file);
                }
            }
        });
    };

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

    var show_existing_file = function (result) {
        var existingFile = { name: result.name, size: result.size }
        dropzone.options.addedfile.call(dropzone, existingFile);
        add_file(existingFile);
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
