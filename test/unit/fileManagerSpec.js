describe('File Manager', function() {

    var fileManager = new FileManager();
    var viewController = fileManager.viewController;
    var visualizer = fileManager.visualize;

    var file = { contents: 'file contents' };
    var file_name = "file.csv";

    it('should load dropzone.js', function() {
      spyOn($, 'getScript').and.callThrough();
      fileManager.initialize_file_upload();
      expect($.getScript).toHaveBeenCalled();
      expect($.getScript.calls.argsFor(0)[0]).toBe('js/lib/dropzone.js');
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
        spyOn(fileManager, 'validate_file');
        spyOn(fileManager, 'submit_or_upload_again');

        fileManager.on_file_upload_success(file, file_name);

        expect(fileManager.validate_file).toHaveBeenCalledWith(file_name);
        expect(fileManager.submit_or_upload_again).toHaveBeenCalledWith(file, file_name);
      });

      it('should remove file from dropzone and delete the input file when file validation fails', function() {
        var errorMsg = "file validation failed";

        spyOn(fileManager, 'validate_file').and.callFake(function() { throw { message: errorMsg} });
        spyOn(fileManager, 'remove_file_from_dropzone_with_error');
        spyOn(fileManager, 'delete_file');

        fileManager.on_file_upload_success(file, file_name);

        expect(fileManager.remove_file_from_dropzone_with_error).toHaveBeenCalledWith(file, errorMsg);
        expect(fileManager.delete_file).toHaveBeenCalledWith(file_name);
      });
    });

    describe('remove dropzone file', function() {

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

    describe('validate file', function() {

      it('should validate the file', function() {
        spyOn($, 'ajax');
        fileManager.validate_file(file_name);
        var args = $.ajax.calls.mostRecent().args[0];

        expect(args["type"]).toBe("GET");
        expect(args["url"]).toBe("/validate-file");
        expect(args["data"].fileName).toBe(file_name);
      });

      it('should not throw an error if the file is valid', function() {
        spyOn($, 'ajax').and.callFake(function(options) { options.success(true); });
        expect(fileManager.validate_file).not.toThrow();
      });

      it('should throw an error if the file is not valid', function() {
        spyOn($, 'ajax').and.callFake(function(options) { options.success(false); });
        expect(fileManager.validate_file).toThrow(new Error('Input file has missing headers'));
      });

      it('should throw an error if an error occurs during validation', function() {
        spyOn($, 'ajax').and.callFake(function(options) { options.error(); });
        expect(fileManager.validate_file).toThrow(new Error('Something went wrong during file validation :('));
      });
    });

    it('should prompt to submit the file or upload again', function() {
      spyOn(viewController, 'shrink_dropzone');
      spyOn(viewController, 'set_onclick_handler');

      fileManager.submit_or_upload_again(file, file_name);

      expect(viewController.shrink_dropzone).toHaveBeenCalled();
      expect(viewController.set_onclick_handler).toHaveBeenCalledWith('button.success', fileManager.on_file_submit, file_name);
      expect(viewController.set_onclick_handler).toHaveBeenCalledWith('button.upload-again', fileManager.on_upload_again, file_name, file);
    });

    it('should show a spinner and start analyzing the file', function() {
      spyOn(viewController, 'hide_all');
      spyOn(viewController, 'show_spinner');
      spyOn(fileManager, 'analyze_data');

      fileManager.on_file_submit(file_name);

      expect(viewController.hide_all).toHaveBeenCalled();
      expect(viewController.show_spinner).toHaveBeenCalled();
      expect(fileManager.analyze_data).toHaveBeenCalledWith(file_name);
    });

    it('should remove the file and expand the dropzone', function() {
      spyOn(viewController, 'expand_dropzone');
      spyOn(fileManager, 'remove_file_from_dropzone_with_error');
      spyOn(fileManager, 'delete_file');

      fileManager.on_upload_again(file_name, file);

      expect(viewController.expand_dropzone).toHaveBeenCalled();
      expect(fileManager.remove_file_from_dropzone_with_error).toHaveBeenCalledWith(file);
      expect(fileManager.delete_file).toHaveBeenCalledWith(file_name);
    });

    describe('analyze data', function() {
      it('should make an ajax call to analyze the data', function() {
        spyOn($, 'ajax');
        fileManager.analyze_data(file_name);
        var args = $.ajax.calls.mostRecent().args[0];

        expect(args["type"]).toBe("GET");
        expect(args["url"]).toBe("/analyze-data");
        expect(args["data"].fileName).toBe(file_name);
      });

      it('should visualize the data on success', function() {
        var data = {};
        spyOn($, 'ajax').and.callFake(function(options) { options.success(data); });
        spyOn(viewController, 'hide_spinner');
        spyOn(viewController, 'show_chart');
        spyOn(visualizer, 'visualize');

        fileManager.analyze_data(file_name);

        expect(viewController.hide_spinner).toHaveBeenCalled();
        expect(viewController.show_chart).toHaveBeenCalled();
        expect(visualizer.visualize).toHaveBeenCalledWith(data);
      });
    });

    it('should make an ajax call to delete the input file', function() {
      spyOn($, 'ajax');
      fileManager.delete_file(file_name);
      var args = $.ajax.calls.mostRecent().args[0];

      expect(args["type"]).toBe("GET");
      expect(args["url"]).toBe("/delete-input-file");
      expect(args["data"].fileName).toBe(file_name);
    });

});
