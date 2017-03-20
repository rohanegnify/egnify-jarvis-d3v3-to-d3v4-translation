var margin = {
        top: 10,
        right: 20,
        bottom: 20,
        left: 40
    },
    width = 700 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
var small_width = 550;
var small_canvas = d3.select('#bar_chart')
    .append('svg')
    .attr('width', 550)
    .attr('height', 150)
var tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);
var canvas = d3.select('#map_goes_here')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)

var projection = d3.geoMercator().scale(3050).translate([-4000, 1090]);
var path = d3.geoPath().projection(projection);
var canvas1 = canvas.selectAll('path')
    .data(ap_geojson.features)
    .enter()
canvas1.append('path')
    .attr('d', path)
    .attr('fill', '#ccc')
    .on('click', function () {
        var data_table = [{
            'type': 'A1',
            'value': Math.floor((Math.random() * 10) + 1)
        }, {
            'type': 'A2',
            'value': Math.floor(Math.random() * 50)
        }, {
            'type': 'B1',
            'value': Math.floor(Math.random() * 100)
        }, {
            'type': 'B2',
            'value': Math.floor(Math.random() * 100)
        }];
        var data_table1 = [{
            'type': 'A1',
            'value': Math.floor((Math.random() * 100) + 1),
            'color': '#0F4FA0'
        }, {
            'type': 'A2',
            'value': Math.floor(Math.random() * 100),
            'color': '#2196F3'
        }, {
            'type': 'B1',
            'value': Math.floor(Math.random() * 100),
            'color': '#4CAF50'
        }, {
            'type': 'B2',
            'value': Math.floor(Math.random() * 100),
            'color': '#8BC34A'
        }, {
            'type': 'C1',
            'value': Math.floor(Math.random() * 100),
            'color': '#FFB300'
        }, {
            'type': 'C2',
            'value': Math.floor(Math.random() * 100),
            'color': '#FFCA28'
        }, {
            'type': 'D1',
            'value': Math.floor(Math.random() * 100),
            'color': '#5B2A22'
        }, {
            'type': 'D2',
            'value': Math.floor(Math.random() * 100),
            'color': '#795548'
        }, {
            'type': 'E',
            'value': Math.floor(Math.random() * 100),
            'color': '#F4201F'
        }];
        var calculate_average = 0;
        for (p in data_table) {
            if (data_table[p].type != 'A1') {
                calculate_average += data_table[p].value;
            }
        }
        data_table.push({
            'type': 'C1',
            'value': calculate_average / 3
        })
        d3.selectAll('path')
            .attr('fill', '#ccc')
        d3.select(this)
            .attr('fill', '#F50057')
        d3.selectAll('.make_bold')
            .data(data_table)
            .transition()
            .duration(1000)
            .tween("text", function (d) {
                var that = d3.select(this),
                    i = d3.interpolateNumber(that.text().replace(/,/g, ""), d.value);
                return function (t) {
                    that.text(Math.round(i(t)));
                };
            })
        var previous = 0;
        data_table1.forEach(function (d) {
            d.yo = previous;
            d.y1 = d.value;
            previous += d.value;
        })
        var scalingx = d3.scaleLinear()
            .domain([0, d3.max(data_table1, function (d) {
                return d.yo + d.y1;
            })])
            .range([0, small_width])
        var another_canvas = small_canvas.selectAll('rect')
            .data(data_table1)
        another_canvas.transition().duration(1500).attr('x', function (d) {
                return small_width - scalingx(d.yo + d.y1);;

            })
            .attr('width', function (d) {
                return scalingx(d.y1);
            })
            .attr('fill', function (d) {
                return d.color;
            })
            .attr('y', 70)
            .attr('height', 20)
        another_canvas.enter()
            .append('rect')
            .attr('x', function (d) {
                return small_width - scalingx(d.yo + d.y1);
            })
            .attr('width', function (d) {
                return scalingx(d.y1);
            })
            .attr('fill', function (d) {
                return d.color;
            })
            .attr('y', 70)
            .attr('height', 20)
            .on("mouseover", function (d) {
                tooltip.transition()
                    .duration(200)
                    .style('opacity', 0.9)
                tooltip.html(d.type + ' : ' + d.value)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");

            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

    })
canvas1.append('text')
    .attr('x', function (d) {
        return path.centroid(d)[0];
    })
    .attr('y', function (d) {
        return path.centroid(d)[1];
    })
    .text(function (d) {
        return d.properties.NAME_2;
    })
    .attr('text-anchor', 'middle')
    .attr('fill', '#FFF')
    .attr('font-size', 10)