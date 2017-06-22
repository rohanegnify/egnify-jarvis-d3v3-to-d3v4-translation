var height = 800;
var width = 1200;

function dashboard(refNode,data){
    d3.select(refNode)
        .append('svg')
        .attr('height',height)
        .attr('width',width)
        .selectAll('g')
        .data(data)
        .enter()
        .append('g')
        .attr('transform',function(d,i){
            return 'translate(' + (i*(50 + 10)) +',0)';
        })
        .selectAll('rect')
        .data(function(d,i) {
            var temp = Object.values(d.freq).reduce(function(acc, val) {
                return acc + val;
            }, 0)
            return [temp]; // d3 requires data in array format
        })
        .enter()
        .append('rect')
        .attr('height',function(d,i) {
            return Yscale(d);
        })
        .attr('width',50)
        .attr('y',function(d){
            return height - Yscale(d);
        })
        .style('fill','#000')
        .on('mouseover',mouseover)
        .on('mouseout',mouseout);


        function mouseover(d){  // utility function to be called on mouseover.
            // filter for selected state.
            // debugger;
            var st = fData.filter(function(s){ return s.State == d[0];})[0],
                nD = d3.keys(st.freq).map(function(s){ return {type:s, freq:st.freq[s]};});
            // call update functions of pie-chart and legend.    
            pC.update(nD);
            leg.update(nD);
        }
        
        function mouseout(d){    // utility function to be called on mouseout.
            // reset the pie-chart and legend.    
            pC.update(tF);
            leg.update(tF);
        }
}


function pieChart(pD){
        var pC ={},    pieDim ={w:250, h: 250};
        pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;
                
        // create svg for pie chart.
        var piesvg = d3.select('body')
            .append("svg")
            .attr("width", pieDim.w)
            .attr("height", pieDim.h)
            .append("g")
            .attr("transform", "translate("+pieDim.w/2+","+pieDim.h/2+")")
        
        // create function to draw the arcs of the pie slices.
        var arc = d3.arc().outerRadius(pieDim.r - 10).innerRadius(0);

        // create a function to compute the pie slice angles.
        var pie = d3.pie().sort(null).value(function(d) { return d.freq; });
            
        // Draw the pie slices.
        piesvg.selectAll("path").data(pie(pD)).enter().append("path").attr("d", arc)
            .each(function(d) { this._current = d; })
            .style("fill", function(d) { return segColor(d.data.type); })
            .on("mouseover",mouseover).on("mouseout",mouseout);
}



var Yscale = updateYscale([])

function updateYscale(ignoreList) {
    return d3.scaleLinear()
        .domain([0, d3.max(freqData, function (d) {
            var cumulative = 0;
            var temp = d.freq;
            // var temp = removeUnselectedGrades(d.freq, ignoreList);
            return d3.max(Object.values(temp), function (e) {
                return cumulative += e;
            })
        })])
        .range([0 + 20,height - 20]);
}

function removeUnselectedGrades(arrayData, ignoreList) {
    var unselectedSet = new Set(ignoreList);
    debugger;
    return arrayData.filter(function (d, i) {
        return !unselectedSet.has(i)
        return true;
    });
}
dashboard(document.querySelector('#dashboard'),freqData);
// pieChart()