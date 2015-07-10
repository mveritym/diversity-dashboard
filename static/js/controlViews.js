$(function() {
    show_file_uploader();
    hide_spinner();
    hide_chart();
    hide_submit_buttons();
})

function show_file_uploader () {
    $("#dropzone-container").show();
}

function hide_file_uploader () {
    $("#dropzone-container").hide();
}

function show_spinner () {
    $(".spinner").show();
}

function hide_spinner () {
    $(".spinner").hide();
}

function show_chart () {
    $("#include-chart").show();
}

function hide_chart () {
    $("#include-chart").hide();
}

function shrink_dropzone () {
    var shrunkWidth = 200;
    $("#dropzone-container").animate({
        width: shrunkWidth + "px"
    }, 1500, "easeOutExpo", function() {
        console.log($(".jumbotron").width() - shrunkWidth);
        show_submit_buttons($(".jumbotron").width() - shrunkWidth);
    });
}

function show_submit_buttons (marginRight) {
    var buttons = $("#submit-buttons");
    var width = buttons.width();
    buttons.css({
        'margin-right': marginRight - width
    });
    buttons.show();
}

function hide_submit_buttons () {
    $("#submit-buttons").hide();
}
