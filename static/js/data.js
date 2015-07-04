var margin = {top: 20, right: 30, bottom: 30, left: 40},
    axisWidth = 40,
    maxWidth = 960 - margin.left - margin.right,
    maxHeight = 500 - margin.top - margin.bottom,
    textBufferWidth = 5;

var scale = d3.scale.linear()
    .range([0, maxHeight]);

var yScale = d3.scale.linear()
    .range([0, maxHeight]);

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .ticks(20);

var chart = d3.select(".chart");

d3.csv('data/genders_by_role.csv', function(error, data) {
    scale.domain([0, d3.max(data, function(d) { return get_total(d); })]);
    yScale.domain([d3.max(data, function(d) { return get_total(d); }), 0]);

    var barWidth = maxWidth / data.length;

    var bar = chart.selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", function(d, index) { console.log((index*barWidth) + axisWidth); return "translate(" + ((index * barWidth) + axisWidth) + ",0)"; });

    bar.append("text")
        .text(function(d) { return d["Role"]; })
        .attr("x", function(d) { return - maxHeight - textBufferWidth; })
        .attr("transform", "rotate(270)")
        .attr("dy", "1.75em");

    bar.append("rect")
        .attr("y", function(d) { return maxHeight - scale(get_total(d)) })
        .attr("width", barWidth - 1)
        .attr("height", function(d) { return scale(get_total(d)); })
        .attr("class", "women");

    bar.append("rect")
        .attr("y", function(d) { return maxHeight - scale(d["Num.Men"]); })
        .attr("width", barWidth - 1)
        .attr("height", function(d) { return scale(d["Num.Men"]); })
        .attr("class", "men");

    chart.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + (axisWidth-5) + ",0)")
        .call(yAxis);

    chart
        .attr("height", maxHeight + getMaxTextLength() + textBufferWidth)
        .attr("width", maxWidth + axisWidth);
});

function get_total(d) {
    return parseInt(d["Num.Men"]) + parseInt(d["Num.Women"]);
}

function getMaxTextLength(chart) {
    return d3.max(d3.selectAll("text")[0], function(text) {
        return text.getBBox().width;
    });
}
