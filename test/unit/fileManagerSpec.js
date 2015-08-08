describe('File Manager', function() {

    var fileManager = file_manager();
    var viewController = fileManager.viewController;

    it('should load dropzone.js', function() {
      spyOn($, 'getScript').and.callThrough();
      fileManager.initialize_file_upload();
      expect($.getScript).toHaveBeenCalled();
      expect($.getScript.calls.argsFor(0)[0]).toBe('js/dropzone.js');
    });

    it('should initialize a dropzone', function() {
      spyOn(viewController, 'hide_error_message');
      spyOn(window, 'Dropzone');

      fileManager.upload_file(null, null);

      expect(viewController.hide_error_message).toHaveBeenCalled();
      expect(Dropzone.autoDiscover).toBeFalsy();
      expect(window.Dropzone).toHaveBeenCalledWith('.dropzone', {
          url: "/upload-file",
          maxFiles: 1,
          acceptedFiles: '.csv',
          clickable: true,
          init: jasmine.any(Function)
      });
    });

    describe('on file upload success', function() {
      it('should validate file and prompt for submit when file uploads', function() {
        var file_name = "file.csv";
        var file = {};
        spyOn(fileManager, 'validate_file');
        spyOn(fileManager, 'submit_or_upload_again');

        fileManager.on_file_upload_success(file, file_name);

        expect(fileManager.validate_file).toHaveBeenCalledWith(file_name);
        expect(fileManager.submit_or_upload_again).toHaveBeenCalledWith(file, file_name);
      });

      it('should remove file from dropzone and delete the input file when file validation fails', function() {
        var file_name = "file.csv";
        var file = {};
        var errorMsg = "file validation failed";

        spyOn(fileManager, 'validate_file').and.callFake(function() { throw { message: errorMsg} });
        spyOn(fileManager, 'remove_file_from_dropzone_with_error');
        spyOn(fileManager, 'delete_input_file');

        fileManager.on_file_upload_success(file, file_name);

        expect(fileManager.remove_file_from_dropzone_with_error).toHaveBeenCalledWith(file, errorMsg);
        expect(fileManager.delete_input_file).toHaveBeenCalledWith(file_name);
      });
    });

    describe('remove dropzone file', function() {

      var file = { content: 'file contents' };

      it('should remove the file from the dropzone and show an error', function() {
        fileManager.dropzone = { removeFile: function() {} };
        spyOn(fileManager.dropzone, 'removeFile');
        fileManager.remove_file_from_dropzone_with_error(file);
        expect(fileManager.dropzone.removeFile).toHaveBeenCalledWith(file);
      });

      it('should display an error message', function() {
        var message = "error message";
        spyOn(viewController, 'show_error_message');
        fileManager.remove_file_from_dropzone_with_error(file, message);
        expect(viewController.show_error_message).toHaveBeenCalledWith(message);
      });
    });

});
