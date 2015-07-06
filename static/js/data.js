var csv_file_name;

$(document).ready(function() {
    csv_file_name = get_data_file();
});

function visualize (csv_contents) {

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

    var data = d3.csv.parse(csv_contents, function(d) {
        return {
            role: d.Role,
            num_men: +d.num_men,
            num_women: +d.num_women,
            technical: d.technical
        };
    });

    scale.domain([0, d3.max(data, function(d) { return get_total(d); })]);
    yScale.domain([d3.max(data, function(d) { return get_total(d); }), 0]);

    var barWidth = maxWidth / Object.keys(data).length;

    var bar = chart.selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", function(d, index) { return "translate(" + ((index * barWidth) + axisWidth) + ",0)"; });

    bar.append("text")
        .text(function(d) { return d["role"]; })
        .attr("x", function(d) { return - maxHeight - textBufferWidth; })
        .attr("transform", "rotate(270)")
        .attr("dy", "1.75em");

    bar.append("rect")
        .attr("y", function(d) { return maxHeight - scale(get_total(d)) })
        .attr("width", barWidth - 1)
        .attr("height", function(d) { return scale(get_total(d)); })
        .attr("class", "women")
        .on('mouseover', function(d) {
            d3.select(this)
                .attr("class", "women-selected");
        })
        .on('mouseout', function(d) {
            d3.select(this).attr("class", "women");
        });

    bar.append("rect")
        .attr("y", function(d) { return maxHeight - scale(d["num_men"]); })
        .attr("width", barWidth - 1)
        .attr("height", function(d) { return scale(d["num_men"]); })
        .attr("class", "men")
        .on('mouseover', function(d) {
            d3.select(this).attr("class", "men-selected");
        })
        .on('mouseout', function(d) {
            d3.select(this).attr("class", "men");
        });

    chart.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + (axisWidth-5) + ",0)")
        .call(yAxis);

    chart
        .attr("height", (maxHeight + getMaxTextLength() + textBufferWidth))
        .attr("width", (maxWidth + axisWidth));

    function get_total(d) {
        var total =  parseInt(d["num_men"]) + parseInt(d["num_women"]);
        return total;
    }

    function getMaxTextLength() {
        return d3.max(d3.selectAll("text")[0], function(text) {
            return text.getBBox().width;
        });
    }
}
