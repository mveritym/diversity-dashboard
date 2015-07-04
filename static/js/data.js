var maxHeight = 500, maxWidth = 700, textBufferWidth = 5;

var scale = d3.scale.linear()
    .range([0, maxHeight]);

var chart = d3.select(".chart")

d3.csv('data/genders_by_role.csv', function(error, data) {
    scale.domain([0, d3.max(data, function(d) { return get_total(d); })]);
    //
    // data.forEach(function(d) {
    //     console.log(d["Num.Men"] + " " + d["Num.Women"] + " " + get_total(d));
    //     console.log(scale(d["Num.Men"]) + " " + scale(d["Num.Women"]) + " " + scale(get_total(d)));
    //     console.log("");
    // });

    var barWidth = maxWidth / data.length;

    var bar = chart.selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", function(d, index) { return "translate(" + index * barWidth + ",0)"; });

    bar.append("text")
        .text(function(d) { return d["Role"]; })
        .attr("x", function(d) { return - maxHeight - textBufferWidth; })
        .attr("transform", "rotate(270)")
        .attr("dy", "1.35em");

    bar.append("rect")
        .attr("y", function(d) { return maxHeight - scale(get_total(d)) })
        .attr("width", barWidth - 1)
        .attr("height", function(d) { return scale(get_total(d)); })
        .attr("class", "women");

    bar.append("rect")
    // scale(get_total(d)) - d["Num.Women"]
        .attr("y", function(d) { return maxHeight - scale(d["Num.Men"]); })
        .attr("width", barWidth - 1)
        .attr("height", function(d) { return scale(d["Num.Men"]); })
        .attr("class", "men");

    chart
        .attr("height", maxHeight + getMaxTextLength() + textBufferWidth)
        .attr("width", maxWidth);
});

function get_total(d) {
    return parseInt(d["Num.Men"]) + parseInt(d["Num.Women"]);
}

function getMaxTextLength(chart) {
    return d3.max(d3.selectAll("text")[0], function(text) {
        return text.getBBox().width;
    });
}
