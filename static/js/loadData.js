function get_data_file () {
    $.ajax({
      url: "/loadData",
    })
    .done(function(fileName) {
        var fileName = fileName.match("\"(.+)\"")[1];
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
