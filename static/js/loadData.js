$.getScript("js/dropzone.js", function() {
    $("div#include-dropzone").dropzone({
        url: "/upload-file",
        paramName: 'testFile'
    });
});

function get_data_file () {
    $.ajax({
      url: "/loadData",
    })
    .done(function(fileName) {
        var matchedName = fileName.match("\"(.+)\""); // if file name was printed by R script, need to extract file name
        fileName = matchedName ? matchedName[1] : fileName;
        load_data(fileName);
        return fileName;
    });
}

function load_data (fileName) {
    $.ajax({
        type: "GET",
        url: "/loadFile",
        data: { fileName: fileName },
        success: function(data) {
            visualize(data);
        },
        error: function(xhr, ajaxOptions, thrownError) {
            alert("Status: " + xhr.status + "     Error: " + thrownError);
        }
    });
}
