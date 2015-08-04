var file_manager = function () {

    var dropzone, errorBar;

    var viewController = view_controller();

    var initialize_file_upload = function () {
        $.getScript("js/dropzone.js", function() {
            upload_file(on_file_upload_success, remove_file_from_dropzone_with_error);
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
                this.on('success', function(file, res) {
                    on_success(file, res);
                });
                this.on('error', function(file, message) {
                    on_error(file, message);
                });
            }
        });
    };

    var on_file_upload_success = function(file, file_name) {
        console.log(file);
        try {
            validate_file(file_name);
            submit_or_upload_again(file, file_name);
        } catch (error) {
            remove_file_from_dropzone_with_error(file, error.message);
            delete_input_file(file_name);
        }
    };

    var remove_file_from_dropzone_with_error = function (file, message) {
        dropzone.removeFile(file);
        if (message) {
            errorBar.text(message).show();
            errorBar.fadeOut(3000);
        }
    };

    var validate_file = function (file_name) {
        $.ajax({
            type: "GET",
            url: "/validate-file",
            data: { fileName: file_name },
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

    var submit_or_upload_again = function(file, file_name) {
        viewController.shrink_dropzone();

        $("button.success").off('click').on('click', function() {
            viewController.hide_all();
            viewController.show_spinner();
            analyze_data(file_name);
        });

        $("button.upload-again").off('click').on('click', function() {
            viewController.expand_dropzone();
            remove_file_from_dropzone_with_error(file, '');
            delete_input_file(file_name);
        });
    };

    var analyze_data = function (file_name) {
        $.ajax({
            type: "GET",
            url: "/analyze-data",
            data: { fileName: file_name },
            success: function(result) {
                var matchedName = result.match("\"(.+)\""); // if file name was printed by R script, need to extract file name
                var analysisFileName = matchedName ? matchedName[1] : result;
                delete_input_file(file_name);
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

    var delete_input_file = function (file_name) {
        $.ajax({
            type: "GET",
            url: "/delete-input-file",
            data: { fileName: file_name },
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
