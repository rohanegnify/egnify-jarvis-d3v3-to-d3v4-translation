function dashboard(id, fData){
    var barColor = 'steelblue';
    function segColor(c){ return {A1:"#0F4FA0", A2:"#2196F3",B1:"#4CAF50",B2:"#8BC34A", C1:"#FFB300",C2:"#FFCA28",D1:"#5B2A22", D2:"#795548",E:"#F4201F"}[c]; }
    
    // compute total for each state.
    fData.forEach(function(d){
        d.total=d.freq.A1+d.freq.A2+d.freq.B1+d.freq.B2+d.freq.C1+d.freq.C2+d.freq.D1+d.freq.D2+d.freq.E;});
   
    // function to handle histogram.
    function histoGram(fD){
        var hG={} ,hGDim = {t: 20, r: 0, b: 10, l: 0};
        hGDim.w = 500 - hGDim.l - hGDim.r, 
        hGDim.h = 300 - hGDim.t - hGDim.b;
            
        //create svg for histogram.
       
        var hGsvg = d3.select(id).append("svg")
            .attr("width", hGDim.w + hGDim.l + hGDim.r)
            .attr("height", hGDim.h + hGDim.t + hGDim.b).append("g")
            .attr("transform", "translate(" + hGDim.l + "," + hGDim.t + ")")
                    
        // create function for x-axis mapping.
        var x = d3.scaleBand().rangeRound([0, hGDim.w]).padding( 0.1)
                .domain(fD.map(function(d) { return d[0]; }));
        
        // Add x-axis to the histogram svg.
        hGsvg.append("g").attr("class", "x axis")
            .attr("transform", "translate(0," + hGDim.h + ")")
            .call(d3.axisBottom().scale(x));

        // Create function for y-axis map.
        var y = d3.scaleLinear().range([hGDim.h, 0])
                .domain([0, d3.max(fD, function(d) { return d[1]; })]);

        // Create bars for histogram to contain rectangles and freq labels.
        var bars = hGsvg.selectAll(".bar").data(fD).enter()
                .append("g").attr("class", "bar");
        // debugger;
        //create the rectangles.
        bars.append("rect")
            .attr("x", function(d) { return x(d[0]); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return hGDim.h - y(d[1]); })
            .attr('fill',barColor)
            .on("mouseover",mouseover)// mouseover is defined beA1.
            .on("mouseout",mouseout);// mouseout is defined beA1.
            
        //Create the frequency labels above the rectangles.
        bars.append("text").text(function(d){ return d3.format(",")(d[1])})
            .attr("x", function(d) { return x(d[0])+x.bandwidth()/2; })
            .attr("y", function(d) { return y(d[1])-5; })
            .attr("text-anchor", "A2dle");
        
        function mouseover(d){  // utility function to be called on mouseover.
            // filter for selected state.
            
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
        
        // create function to update the bars. This will be used by pie-chart.
        hG.update = function(nD, color){
            // update the domain of the y-axis map to reflect change in frequencies.
            y.domain([0, d3.max(nD, function(d) { return d[1]; })]);
            
            // Attach the new data to the bars.
            var bars = hGsvg.selectAll(".bar").data(nD);
            
            // transition the height and color of rectangles.
            bars.select("rect").transition().duration(500)
                .attr("y", function(d) {return y(d[1]); })
                .attr("height", function(d) { return hGDim.h - y(d[1]); })
                .attr("fill", color);

            // transition the frequency labels location and change value.
            bars.select("text").transition().duration(500)
                .text(function(d){ return d3.format(",")(d[1])})
                .attr("y", function(d) {return y(d[1])-5; });            
        }        
        return hG;
    }
    
    // function to handle pieChart.
    function pieChart(pD){
        var pC ={},    pieDim ={w:250, h: 250};
        pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;
                
        // create svg for pie chart.
        var piesvg = d3.select(id).append("svg")
            .attr("width", pieDim.w).attr("height", pieDim.h).append("g")
            .attr("transform", "translate("+pieDim.w/2+","+pieDim.h/2+")");
        
        // create function to draw the arcs of the pie slices.
        var arc = d3.arc().outerRadius(pieDim.r - 10).innerRadius(0);

        // create a function to compute the pie slice angles.
        var pie = d3.pie().sort(null).value(function(d) { return d.freq; });

        // Draw the pie slices.
        piesvg.selectAll("path").data(pie(pD)).enter().append("path").attr("d", arc)
            .each(function(d) { this._current = d; })
            .style("fill", function(d) { return segColor(d.data.type); })
            .on("mouseover",mouseover).on("mouseout",mouseout);

        // create function to update pie-chart. This will be used by histogram.
        pC.update = function(nD){
            piesvg.selectAll("path").data(pie(nD)).transition().duration(500)
                .attrTween("d", arcTween);
        }        
        // Utility function to be called on mouseover a pie slice.
        function mouseover(d){
            // call the update function of histogram with new data.
            hG.update(fData.map(function(v){ 
                return [v.State,v.freq[d.data.type]];}),segColor(d.data.type));
        }
        //Utility function to be called on mouseout a pie slice.
        function mouseout(d){
            // call the update function of histogram with all data.
            hG.update(fData.map(function(v){
                return [v.State,v.total];}), barColor);
        }
        // Animating the pie-slice requiring a custom function which specifies
        // how the intermediate paths should be drawn.
        function arcTween(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) { return arc(i(t));    };
        }    
        return pC;
    }
    
    // function to handle legend.
    function legend(lD){
        var leg = {};
            
        // create table for legend.
        var legend = d3.select(id).append("table").attr('class','legend');
        
        // create one row per segment.
        
        var tr = legend.append("tbody").selectAll("tr").data(lD).enter().append("tr");
        
            
        // create the first column for each segment.
        tr.append("td").append("svg").attr("width", '16').attr("height", '16').append("rect")
            .attr("width", '16').attr("height", '16')
			.attr("fill",function(d){ return segColor(d.type); });
            
        // create the second column for each segment.
        tr.append("td").text(function(d){ return d.type;});

        // create the third column for each segment.
        tr.append("td").attr("class",'legendFreq')
            .text(function(d){ return d3.format(",")(d.freq);});

        // create the fourth column for each segment.
        tr.append("td").attr("class",'legendPerc')
            .text(function(d){ return getLegend(d,lD);});

        // Utility function to be used to update the legend.
        leg.update = function(nD){
            // update the data attached to the row elements.
            
            var l = legend.select("tbody").selectAll("tr").data(nD);
           
            // update the frequencies.
            l.select(".legendFreq").text(function(d){ return d3.format(",")(d.freq);});

            // update the percentage column.
            l.select(".legendPerc").text(function(d){ return getLegend(d,nD);});        
        }
        
        function getLegend(d,aD){ // Utility function to compute percentage.
            return d3.format("%")(d.freq/d3.sum(aD.map(function(v){ return v.freq; })));
        }

        return leg;
    }
    
    // calculate total frequency by segment for all state.
    var tF = ['A1','A2','B1','B2','C1','C2','D1','D2','E'].map(function(d){ 
        return {type:d, freq: d3.sum(fData.map(function(t){ return t.freq[d];}))}; 
    });    
    
    // calculate total frequency by state for all segment.
    var sF = fData.map(function(d){return [d.State,d.total];});

    var hG = histoGram(sF), // create the histogram.
        pC = pieChart(tF), // create the pie-chart.
        leg= legend(tF);  // create the legend.
}

var freqData=[
{State:'I',freq:{A1:47, A2:13, B1:2,B2:4,C1:10,C2:1,D1:10,D2:5,E:50}},
{State:'II',freq:{A1:11, A2:4, B1:6,B2:9,C1:10,C2:11,D1:0,D2:5,E:3}},
{State:'III',freq:{A1:9, A2:21, B1:4,B2:4,C1:10,C2:10,D1:10,D2:5,E:3}},
{State:'IV',freq:{A1:8, A2:11, B1:18,B2:4,C1:11,C2:9,D1:10,D2:5,E:5}},
{State:'V',freq:{A1:44, A2:33, B1:9,B2:4,C1:10,C2:11,D1:10,D2:5,E:3}},
{State:'VI',freq:{A1:16, A2:1, B1:10,B2:4,C1:10,C2:21,D1:20,D2:5,E:3}},
{State:'VII',freq:{A1:18, A2:2, B1:12,B2:4,C1:10,C2:11,D1:10,D2:5,E:8}},
{State:'VIII',freq:{A1:44, A2:38, B1:9,B2:4,C1:10,C2:1,D1:10,D2:5,E:3}},
{State:'IX',freq:{A1:7, A2:18, B1:15,B2:4,C1:10,C2:10,D1:10,D2:5,E:10}},
{State:'X',freq:{A1:1, A2:30, B1:4,B2:4,C1:10,C2:11,D1:10,D2:5,E:41}}
];
dashboard('#dashboard',freqData);