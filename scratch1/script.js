var color = d3.scaleOrdinal()
    .domain(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'E'])
    .range(["#0F4FA0", "#2196F3", "#4CAF50", "#8BC34A", "#FFB300", "#FFCA28", "#5B2A22", '#795548', '#F4201F']);

var gradeToUnselectedListIndex = d3.scaleOrdinal()
    .domain(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'E'])
    .range([0, 1, 2, 3, 4, 5, 6, 7, 8]);

var barWidth = 50;
var interBarPadding = 10;
var margin = {
        top: 20,
        right: 20,
        bottom: 70,
        left: 80
    },
    width = 740 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var unselectedList = [];
var YScale = updateYscale(unselectedList);

function updateYscale(ignoreList) {
    return d3.scaleLinear()
        .domain([0, d3.max(freqData, function (d) {
            var cumulative = 0;
            var temp = removeUnselectedClassRooms(d.freq, ignoreList);
            return d3.max(temp, function (e) {
                return cumulative += e.value;
            })
        })])
        .range([0, height]);
}

function removeUnselectedClassRooms(arrayData, ignoreList) {
    var unselectedSet = new Set(unselectedList);
    return arrayData.filter(function (d, i) {
        return !unselectedSet.has(i)
        return true;
    });
}

var canvas = d3.select('body') //d3 dom pointer to canvas. canvas here indicates drawing area. NOT html5 canvas
    .append('svg') // now points to svg
    .attr('width', 1280)
    .attr('height', 900);

var legend = canvas.append('g')
    .attr('class', 'legend_class')
    .attr('transform', 'translate(10,' + (height + margin.bottom - 20) + ')')
    .selectAll('.legend')
    .data(color.domain())
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
    .on('click', function (d,i) {
        var unselectedSet = new Set(unselectedList);
        if(unselectedSet.has(i))
            unselectedSet.delete(i);
        else
            unselectedSet.add(i);
        unselectedList = Array.from(unselectedSet);
        update();
    });

var glevel = 0;

function setYAttribute(d, j) {
    var unselectedSet = new Set(unselectedList);
    if (j === 0)
        glevel = 0;
    if (unselectedSet.has(j))
        return height - glevel;
    glevel += YScale(d.value)
    return height - glevel;
}

function setHeightAttribute(d, j) {
    var unselectedSet = new Set(unselectedList);
    if (unselectedSet.has(j))
        return 0;
    return YScale(d.value);
}


canvas
    .append('g')
    .attr('class','main')
    .selectAll('g')
    .data(freqData) // selectAll then Data then Enter then Append // this is known as the d3 join pattern
    .enter()
    .append('g')
    .attr('transform', function (d, i) {
        return "translate(" + (20 + (i * (barWidth + interBarPadding))) + ",0)";
    })
    .selectAll('rect')
    .data(function (d) {
        return d.freq;
    })
    .enter()
    .append('rect')
    .attr('y', setYAttribute)
    .attr('height', setHeightAttribute)
    .attr('width', 50)
    .attr('class', function (d) {
        return 'class-' + d.grade;
    })
    .style('fill', function (d) {
        return color(d.grade);
    })
    .on('click', function (d, i) {
        var unselectedSet = new Set(unselectedList);
        unselectedSet.add(i);
        unselectedList = Array.from(unselectedSet);

        update();
    })
    .on('mouseover', function (d) {
        d3.select(this)
            .style('opacity', 0.75);
    })
    .on('mouseout', function (d) {
        d3.select(this)
            .style('opacity', 1);
    });

var new_scaling = d3.scaleBand()
    .domain(freqData.map(function (d) {
        // debugger;
        var total = 0;
        total = d3.max(d.freq, function (dd) {
            total += dd.value;
            return total;
        })
        return d.State + ' [' + total + ']';
    }))
    .rangeRound([0, width])
    .padding(0.1);

canvas.append("g").attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .attr('font-size', 15)
    .call(d3.axisBottom(new_scaling).tickSize(0).tickPadding(6));

function update() {
    var unselectedSet = new Set(unselectedList);
    YScale = updateYscale(unselectedList);
    canvas
        .selectAll('g.main g')
        .selectAll('rect')
        .transition()
        .duration(1000)
        .attr('y', setYAttribute)
        .attr('height', setHeightAttribute);
    legend
        .selectAll('rect')
        .attr('fill', function (d, i) {
            if(!unselectedSet.has(i))
                return color(d);
            return '#DDD'
        });
}