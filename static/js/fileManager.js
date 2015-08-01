var file_manager = function () {

    var dropzone, errorBar;

    var viewController = view_controller();

    var initialize_file_upload = function () {
        $.getScript("js/dropzone.js", function() {
            upload_file(function (file) {
                on_file_upload_success(file);
            }, function (file, message) {
                remove_file_from_dropzone_with_error(file, message);
            });
        });
    };

    var upload_file = function (on_success, on_error) {
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
                this.on('success', on_success);
                this.on('error', on_error);
            }
        });
    };

    var on_file_upload_success = function(file) {
        try {
            validate_file(file);
            submit_or_upload_again(file);
        } catch (error) {
            remove_file_from_dropzone_with_error(file, error.message);
            delete_input_file(file);
        }
    };

    var remove_file_from_dropzone_with_error = function (file, message) {
        dropzone.removeFile(file);
        if (message) {
            errorBar.text(message).show();
            errorBar.fadeOut(3000);
        }
    };

    var validate_file = function (file) {
        $.ajax({
            type: "GET",
            url: "/validate-file",
            data: { fileName: file.name },
            success: function(isValid) {
                if (isValid) {
                    return true;
                } else {
                    throw { name: 'ValidInputError', message: 'Input file has missing headers' }
                }
            },
            error: function() {
                throw { name: 'ValidInputError', message: 'Something went wrong during file validation :(' }
            }
        });
    };

    var submit_or_upload_again = function(file) {
        viewController.shrink_dropzone();

        $("button.success").click(function() {
            viewController.hide_all();
            viewController.show_spinner();
            analyze_data(file);
        });

        $("button.upload-again").click(function() {
            viewController.expand_dropzone();
            remove_file_from_dropzone_with_error(file);
            delete_input_file(file);
        });
    };

    var analyze_data = function (file) {
        $.ajax({
            type: "GET",
            url: "/analyze-data",
            data: { fileName: file.name },
            success: function(result) {
                var matchedName = result.match("\"(.+)\""); // if file name was printed by R script, need to extract file name
                var analysisFileName = matchedName ? matchedName[1] : result;
                delete_input_file(file);
                load_data(analysisFileName);
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
                delete_analysis_file();
                visualizer().visualize(data);
            }
        });
    };

    var delete_input_file = function (file) {
        $.ajax({
            type: "GET",
            url: "/delete-file",
            data: { fileName: file.name },
            error: function (err) {
                console.log(err);
            }
        });
    };

    var delete_analysis_file = function () {
        $.ajax({
            type: "GET",
            url: "/delete-analysis",
            error: function (err) {
                console.log(err);
            }
        });
    }

    return {
        initialize_file_upload: initialize_file_upload
    }
};

$(document).ready(function () {
    // if analysis exists in localstorage, use that. Else:
    file_manager().initialize_file_upload();
});
