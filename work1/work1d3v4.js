var color = d3.scaleOrdinal()
    .domain(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'E'])
    .range(["#0F4FA0", "#2196F3", "#4CAF50", "#8BC34A", "#FFB300", "#FFCA28", "#5B2A22", '#795548', '#F4201F']);

var margin = {
        top: 20,
        right: 20,
        bottom: 70,
        left: 80
    },
    width = 740 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var canvas = d3.select('body')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

freqData1.forEach(function (d) {
    previous = 0;
    d.freq.forEach(function (v) {
        v.yo = previous;
        v.y1 = v.value;
        previous += v.value;
    })
    d.total = previous;
});

var new_scaling = d3.scaleBand()
    .domain(freqData1.map(function (d) {
        return d.State + ' [' + d.total + ']';
    }))
    .rangeRound([0, width])
    .padding(0.1);

canvas.append("g").attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .attr('font-size', 15)
    .call(d3.axisBottom(new_scaling).tickSize(0).tickPadding(6));

var legend = canvas.append('g')
    .attr('class', 'legend_class')
    .attr('transform', 'translate(10,' + (height + margin.bottom - 20) + ')')
    .selectAll('.legend')
    .data(color.domain().slice())
    .enter();

legend.append('rect')
    .attr('width', 15)
    .attr('height', 15)
    .attr('x', function (d, i) {
        return i * 50;
    })
    .attr('fill', function (d, i) {
        return color(d);
    })
    .on('click', function (d) {
        var selection_here2 = d3.select(this)
        var selection_here = selection_here2.attr('fill1')
        var selection_here1 = selection_here2.attr('fill')
        if (selection_here) {
            selection_here2.attr('fill', selection_here)
                .attr('fill1', null)
        } else {
            selection_here2.attr('fill', '#CCC')
                .attr('fill1', selection_here1)
        }
        clicked(d);
    });

legend.append('text')
    .text(function (d) {
        return d;
    })
    .attr('x', function (d, i) {
        return i * 50 + 26;
    })
    .attr('y', 9)
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', "middle")
    .attr('font-size', 14)
    .attr('fill', '#000');
update(freqData1);

function update(freqData){
    freqData.forEach(function (d) {
        previous = 0;
        d.freq.forEach(function (v) {
            v.yo = previous;
            v.y1 = v.value;

            previous += v.value;
        })
        d.total = previous;
    });
    var scaling = d3.scaleBand()
        .domain(freqData.map(function (d) {
            return d.State;
        }))
        .rangeRound([0, width]).padding(0.1);

    var scalingy = d3.scaleLinear()
        .domain([0, d3.max(freqData, function (d) {
            return d3.max(d.freq, function (e) {
                return e.yo + e.y1;
            })
        })])
        .range([0, height]);
    var state1 = canvas.selectAll('.state')
        .data(freqData)
    var update_code = state1.selectAll('.init_rect')
        .data(function (d) {
            return d.freq;
        })
        .transition()
        .duration(1000)
        .attr('y', function (d) {
            return height - scalingy(d.yo + d.y1);
        })
        .attr('height', function (d) {
            return scalingy(d.y1);
        })
    var checking = state1.selectAll('.values2')
        .data(function (d) {
            return d.freq;
        })
        .transition()
        .duration(1000)
        .attr('y', function (d) {
            return height - scalingy(d.yo + d.y1) + scalingy(d.y1) / 2;
        })
        .text(function (d) {
            return d.value;
        })
    var state = state1.enter()
        .append('g')
        .attr('class', 'state')
        .attr('transform', function (d) {
            return "translate(" + scaling(d.State) + ",0)";
        });
    state.selectAll('rect')
        .data(function (d) {
            return d.freq
        })
        .enter()
        .append('rect')
        .attr('class', 'init_rect')
        .attr('y', function (d) {
            return height - scalingy(d.yo + d.y1);
        })
        .attr('width', scaling.bandwidth())
        .attr('height', function (d) {
            return scalingy(d.y1);
        })
        .style("fill", function (d) {
                return color(d.grade);
            })
        .on("mouseover", function (d) {
            tooltip.transition()
                .duration(200)
                .style('opacity', 0.9)
            tooltip.html('Student Count:' + d.value)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
    state.selectAll('text')
        .data(function (d) {
            return d.freq;
        })
        .enter()
        .append('text')
        .attr('class', 'values2')
        .attr('x', scaling.bandwidth() / 2)
        .attr('y', function (d) {
            return height - scalingy(d.yo + d.y1) + scalingy(d.y1) / 2;
        })
        .text(function (d) {
            return d.value;
        })
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', "middle")
        .attr('fill', '#FFF')
        .attr('font-size', 11)
}


function clicked(d) {
    freqData1.forEach(function (e) {
        e.freq.forEach(function (k) {
            if (k.grade == d) {
                if (!k.y01) {
                    k.y01 = k.value;
                    k.value = null;
                } else {
                    k.value = k.y01;
                    k.y01 = null;
                }
            }

        })

    })
    update(freqData1);
}