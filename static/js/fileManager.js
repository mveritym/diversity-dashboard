var FileManager = function () {

  this.dropzone;
  this.viewController = view_controller();
  this.visualize = visualizer();

  var fm = this;

  this.initialize_file_upload = function () {
    $.getScript("js/dropzone.js", function() {
      fm.upload_file(fm.on_file_upload_success, fm.remove_file_from_dropzone_with_error);
    });
  };

  this.upload_file = function (on_success, on_error) {
    fm.viewController.hide_error_message();
    window.Dropzone;
    Dropzone.autoDiscover = false;
    fm.dropzone = new Dropzone(".dropzone", {
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

  this.on_file_upload_success = function(file, file_name) {
    try {
      fm.validate_file(file_name);
      fm.submit_or_upload_again(file, file_name);
    } catch (error) {
      fm.remove_file_from_dropzone_with_error(file, error.message);
      fm.delete_file(file_name);
    }
  };

  this.remove_file_from_dropzone_with_error = function (file, message) {
    fm.dropzone.removeFile(file);
    if (message) fm.viewController.show_error_message(message);
  };

  this.validate_file = function (file_name) {
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

  this.submit_or_upload_again = function(file, file_name) {
    fm.viewController.shrink_dropzone();
    fm.viewController.set_onclick_handler('button.success', fm.on_file_submit, file_name);
    fm.viewController.set_onclick_handler('button.upload-again', fm.on_upload_again, file_name, file);
  };

  this.on_file_submit = function (file_name) {
    fm.viewController.hide_all();
    fm.viewController.show_spinner();
    fm.analyze_data(file_name);
  };

  this.on_upload_again = function (file_name, file) {
    fm.viewController.expand_dropzone();
    fm.remove_file_from_dropzone_with_error(file);
    fm.delete_file(file_name);
  };

  this.analyze_data = function (file_name) {
    $.ajax({
      type: "GET",
      url: "/analyze-data",
      data: { fileName: file_name },
      success: function(data) {
        fm.viewController.hide_spinner();
        fm.viewController.show_chart();
        fm.visualize.visualize(data);
      }
    });
  };

  this.delete_file = function (file_name) {
    $.ajax({
      type: "GET",
      url: "/delete-input-file",
      data: { fileName: file_name }
    });
  };
};

$(document).ready(function () {
  // if analysis exists in localstorage, use that. Else:
  var fileManager = new FileManager();
  fileManager.initialize_file_upload();
});
