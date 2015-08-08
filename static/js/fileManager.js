var file_manager = function () {

  var dropzone;
  var viewController = view_controller();
  var visualize = visualizer();

  var initialize_file_upload = function () {
    $.getScript("js/dropzone.js", function() {
      upload_file(on_file_upload_success, remove_file_from_dropzone_with_error);
    });
  };

  var upload_file = function (on_success, on_error) {
    viewController.hide_error_message();
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
    try {
      this.validate_file(file_name);
      this.submit_or_upload_again(file, file_name);
    } catch (error) {
      this.remove_file_from_dropzone_with_error(file, error.message);
      this.delete_input_file(file_name);
    }
  };

  var remove_file_from_dropzone_with_error = function (file, message) {
    this.dropzone.removeFile(file);
    if (message) viewController.show_error_message(message);
  };

  var validate_file = function (file_name) {
    $.ajax({
      type: "GET",
      url: "/validate-file",
      data: { fileName: file_name },
      success: function(isValid) {
        if (!isValid) {
          throw new Error('Input file has missing headers');
        }
      },
      error: function() {
        throw new Error('Something went wrong during file validation :(');
      }
    });
  };

  var submit_or_upload_again = function(file, file_name) {
    viewController.shrink_dropzone();
    viewController.set_onclick_handler('button.success', on_file_submit, file_name);
    viewController.set_onclick_handler('button.upload-again', on_upload_again, file_name, file);
  };

  var on_file_submit = function (file_name) {
    viewController.hide_all();
    viewController.show_spinner();
    this.analyze_data(file_name);
  };

  var on_upload_again = function (file, file_name) {
    viewController.expand_dropzone();
    this.remove_file_from_dropzone_with_error(file);
    this.delete_input_file(file_name);
  };

  var analyze_data = function (file_name) {
    var fileManager = this;
    $.ajax({
      type: "GET",
      url: "/analyze-data",
      data: { fileName: file_name },
      success: function(result) {
        var matchedName = result.match("\"(.+)\""); // if file name was printed by R script, need to extract file name
        var analysisFileName = matchedName ? matchedName[1] : result;
        fileManager.delete_input_file(file_name);
        fileManager.load_data(analysisFileName);
      }
    });
  };

  var load_data = function (fileName) {
    var fileManager = this;
    $.ajax({
      type: "GET",
      url: "/load-file",
      data: { fileName: fileName },
      success: function(data) {
        viewController.hide_spinner();
        viewController.show_chart();
        fileManager.delete_analysis_file();
        visualize.visualize(data);
      }
    });
  };

  var delete_input_file = function (file_name) {
    $.ajax({
      type: "GET",
      url: "/delete-input-file",
      data: { fileName: file_name }
    });
  };

  var delete_analysis_file = function () {
    $.ajax({
      type: "GET",
      url: "/delete-analysis"
    });
  }

  return {
    viewController:                       viewController,
    visualize:                            visualize,
    initialize_file_upload:               initialize_file_upload,
    upload_file:                          upload_file,
    on_file_upload_success:               on_file_upload_success,
    validate_file:                        validate_file,
    submit_or_upload_again:               submit_or_upload_again,
    remove_file_from_dropzone_with_error: remove_file_from_dropzone_with_error,
    delete_input_file:                    delete_input_file,
    on_file_submit:                       on_file_submit,
    on_upload_again:                      on_upload_again,
    analyze_data:                         analyze_data,
    load_data:                            load_data,
    delete_analysis_file:                 delete_analysis_file
  }
};

$(document).ready(function () {
  // if analysis exists in localstorage, use that. Else:
  file_manager().initialize_file_upload();
});
