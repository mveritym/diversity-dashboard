var visualizer = function () {

    var csv_file_name;

    var margin = {top: 50, right: 30, bottom: 40, left: 40},
        axisWidth = 40,
        maxWidth = 1020,
        maxHeight = 500,
        textBufferWidth = 5;

    var x = d3.scale.ordinal().rangeRoundBands([0, maxWidth]),
        y = d3.scale.linear().range([0, maxHeight]),
        z = d3.scale.ordinal().range(["lightsteelblue", "thistle"]);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")

    var chart = d3.select(".chart")
        .attr("width", maxWidth)
        .attr("height", maxHeight + margin.bottom + margin.top)

    function analyze_data(file) {
        csv_file_name = file_manager().analyze_data(file.name);
    }

    function visualize (csv_contents) {

        var data = d3.csv.parse(csv_contents, function(d) {
            return {
                role: d.Role,
                num_men: +d.num_men,
                num_women: +d.num_women,
                technical: d.technical
            };
        });

        var genders = d3.layout.stack()(["num_men", "num_women"].map(function(gender) {
            return data.map(function(d) {
                return {x: d.role, y: +d[gender]};
            });
        }));

        x.domain(genders[0].map(function(d, i) { return i; }));
        y.domain([0, d3.max(genders[genders.length - 1], function(d) { return d.y0 + d.y; })]);

        var rule = chart.selectAll("rule")
            .data(y.ticks(10).slice(1))
            .enter().append("g")
            .attr("class", "axis")
            .attr("transform", function(d) { return "translate(20," + (maxHeight - y(d) - margin.bottom + margin.top) + ")"; });

        rule.append("line")
            .attr("x2", maxWidth - 35)
            .attr("transform", "translate(10,0)")
            .style("stroke", "lightgray")
            .style("stroke-opacity", function(d) { return d ? .5 : null; });

        rule.append("text")
            .attr("x", 0)
            .attr("dy", "0.35em")
            .text(d3.format(",d"));

        var gender = chart.selectAll("g.gender")
            .data(genders)
            .enter().append("g")
            .style("fill", function(d, i) { return z(i); })
            .style("stroke", function(d, i) { return d3.rgb(z(i)).darker(); });

        var rect = gender.selectAll("rect")
            .data(Object)
            .enter().append("rect")
            .attr("x", function(d, i) { return x(i); })
            .attr("y", function(d) { return maxHeight - y(d.y0) - y(d.y) - margin.bottom + margin.top; })
            .attr("height", function(d) { return y(d.y); })
            .attr("width", x.rangeBand())
            .on('mouseover', function(d,i) {
                for(g = 0; g < gender[0].length; g++) {
                    var genderBar = d3.select(d3.select(gender[0][g]).selectAll("rect")[0][i]);
                    var newColor = d3.rgb(genderBar.style("stroke")).darker(0.1);
                    genderBar.style("fill", newColor);
                }
            })
            .on('mouseout', function(d,i) {
                for(g = 0; g < gender[0].length; g++) {
                    var genderBar = d3.select(d3.select(gender[0][g]).selectAll("rect")[0][i]);
                    var newColor = d3.rgb(genderBar.style("stroke")).brighter();
                    genderBar.style("fill", newColor);
                }
            });

        var label = chart.selectAll("text")
            .data(genders[0], function(d) { return d.x; })
            .enter().append("text")
            .attr("x", function(d) { return - maxHeight - textBufferWidth + margin.bottom - margin.top; })
            .attr("y", function(d, i) { return x(i) + x.rangeBand()/2; })
            .attr("transform", "rotate(270)")
            .attr("text-anchor", "middle")
            .attr("dy", ".71em")
            .text(function(d) { return d.x; });
    }

    return {
        analyze_data: analyze_data,
        visualize: visualize
    };
}
