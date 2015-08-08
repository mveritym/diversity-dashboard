var view_controller = function () {

    var smallDropzone = 200;
    var jumbotron = $(".jumbotron");
    var dropzone = $("#dropzone-container");
    var submitButtons = $("#submit-buttons");
    var spinner = $(".spinner");
    var chart = $("#chart-container");
    var errorMessage = $("#dropzone-error span");

    var show_dropzone = function () {
        dropzone.show();
    };

    var hide_dropzone = function () {
        dropzone.hide();
    };

    var show_spinner = function () {
        spinner.show();
    };

    var hide_spinner = function () {
        spinner.hide();
    };

    var show_chart = function () {
        chart.show();
    };

    var hide_chart = function () {
        chart.hide();
    };

    var shrink_dropzone = function () {
        dropzone.animate({
            width: smallDropzone + "px"
        }, 1500, "easeOutExpo", function() {
            var newMarginRight = jumbotron.width() - smallDropzone;
            position_submit_buttons(newMarginRight);
        });
    };

    var expand_dropzone = function () {
        dropzone.width('100%');
        hide_submit_buttons();
    };

    var position_submit_buttons = function (marginRight) {
        var buttonWidth = submitButtons.width();
        submitButtons.css({ 'margin-right': marginRight - buttonWidth });
        show_submit_buttons();
    };

    var show_submit_buttons = function () {
        submitButtons.show();
    };

    var hide_submit_buttons = function () {
        submitButtons.hide();
    };

    var hide_error_message = function () {
        errorMessage.hide();
    };

    var hide_all = function () {
        hide_dropzone();
        hide_submit_buttons();
        hide_spinner();
        hide_chart();
    };

    return {
        hide_all: hide_all,
        show_dropzone: show_dropzone,
        show_spinner: show_spinner,
        hide_spinner: hide_spinner,
        show_chart: show_chart,
        shrink_dropzone: shrink_dropzone,
        expand_dropzone: expand_dropzone,
        hide_error_message: hide_error_message
    };
};

$(function() {
    var viewController = view_controller();
    viewController.hide_all();
    viewController.show_dropzone();
    //viewController.show_chart();
});
