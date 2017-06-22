 // ************** Generate the tree diagram	 *****************
 var margin = {
         top: 20,
         right: 30,
         bottom: 20,
         left: 30
     },
     width = 700 - margin.right - margin.left,
     height = 600 - margin.top - margin.bottom;

 var i = 0,
     duration = 750,
     root;

  var tree = d3.tree()
     .size([height, width]);

//  var diagonal = d3.svg.diagonal()
//      .projection(function (d) {
//          return [d.y, d.x];
//      });
var diagonal = function(d) {
        return "M" + d.y + "," + d.x
            + "C" + (d.parent.y + 100) + "," + d.x
            + " " + (d.parent.y + 100) + "," + d.parent.x
            + " " + d.parent.y + "," + d.parent.x;
      }


 var svg = d3.select(".svg_div").append("svg")
     .attr("width", width + margin.right + margin.left)
     .attr("height", height + margin.top + margin.bottom)
     .append("g")
     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var stratify = d3.stratify()
  .id(function(d) {
    return d.name;//This position
  })
  .parentId(function(d) {
    return d.parent; //What position this position reports to
  });

var root = stratify(treeDatadata);

//  root = d3.hierarchy(treeData);
//  root.x0 = height / 2;
//  root.y0 = 0;

 function collapse(d) {
     if (d.children) {
         d._children = d.children;
         d._children.forEach(collapse);
         d.children = null;
     }
 }
 root.children.forEach(collapse);

 update(root);

 d3.select(self.frameElement).style("height", "600px");

 function update(source) {

     // Compute the new tree layout.
    //  debugger;
     var nodes = tree(root).descendants(),
      links = nodes.slice(1);
    // debugger;
     // Normalize for fixed-depth.
     nodes.forEach(function (d) {
         d.y = d.depth * 180;
     });

     // Update the nodes…
     var node = svg.selectAll("g.node")
         .data(nodes, function (d) {
             return d.id || (d.id = ++i);
         });

     // Enter any new nodes at the parent's previous position.
     var nodeEnter = node.enter().append("g")
         .attr("class", "node")
         .attr("transform", function (d) {
             return "translate(" + source.y0 + "," + source.x0 + ")";
         })
         .on("click", click);


     nodeEnter
         .append('g')
         .attr('transform', 'translate(0,-15)')
         .append('rect')
         .attr('width', '100')
         .attr('height', '30')
         .attr('stroke', '#000')
         .attr('stroke-width', '1px')
         .attr('fill', '#FFF')
     nodeEnter.append("circle")
         .attr("r", '2')
         .attr("stroke", "#000");
     nodeEnter.append("text")
         .attr("x", function (d) {
             return d.children || d._children ? -13 + 58 : 13 + 40;
         })
         .attr("y", ".35em")
         .attr("text-anchor", "middle")
         .text(function (d) {
             return d.name;
         });



     // Transition nodes to their new position.
     var nodeUpdate = node.transition()
         .duration(duration)
         .attr("transform", function (d) {
             return "translate(" + d.y + "," + d.x + ")";
         });

     nodeUpdate.select("circle")
         .attr('r', '5');

     nodeUpdate.select("text")
         .style("fill-opacity", 1);

     // Transition exiting nodes to the parent's new position.
     var nodeExit = node.exit().transition()
         .duration(duration)
         .attr("transform", function (d) {
             return "translate(" + source.y + "," + source.x + ")";
         })
         .remove();

     nodeExit.select("circle")
         .attr("r", 1e-6);

     nodeExit.select("text")
         .style("fill-opacity", 1e-6);

     // Update the links…
     debugger;
     var link = svg.selectAll("path.link")
         .data(links, function (d) {
            //  debugger;
             return d.id;
         });

     // Enter any new links at the parent's previous position.
     link.enter().insert("path", "g")
         .attr("class", "link")
         .attr("d", function (d) {
             var o = {
                 x: source.x0,
                 y: source.y0
             };
             return diagonal({
                 source: o,
                 target: o
             });
         });

     // Transition links to their new position.
     link.transition()
         .duration(duration)
         .attr("d", diagonal);

     // Transition exiting nodes to the parent's new position.
     link.exit().transition()
         .duration(duration)
         .attr("d", function (d) {
             var o = {
                 x: source.x,
                 y: source.y
             };
             return diagonal({
                 source: o,
                 target: o
             });
         })
         .remove();

     // Stash the old positions for transition.
     nodes.forEach(function (d) {
         d.x0 = d.x;
         d.y0 = d.y;
     });
 }

 // Toggle children on click.
 function click(d) {
     if (typeof d.children == 'undefined' && typeof d._children == 'undefined') {
         legend(d);
     } else {
         if (d.children) {
             d._children = d.children;
             d.children = null;
         } else {
             d.children = d._children;
             d._children = null;
         }
         update(d);

     }
 }

 function legend(d) {

     var title_name = d.name + ' ' + d.parent.name;
     d3.select('.title').text(title_name);
     var data_table = [{
         'type': 'A1',
         'value': Math.floor((Math.random() * 10) + 1),
         'color': '#0F4FA0'
     }, {
         'type': 'A2',
         'value': Math.floor(Math.random() * 20),
         'color': '#2196F3'
     }, {
         'type': 'B1',
         'value': Math.floor(Math.random() * 20),
         'color': '#4CAF50'
     }, {
         'type': 'B2',
         'value': Math.floor(Math.random() * 20),
         'color': '#8BC34A'
     }, {
         'type': 'C1',
         'value': Math.floor(Math.random() * 20),
         'color': '#FFB300'
     }, {
         'type': 'C2',
         'value': Math.floor(Math.random() * 20),
         'color': '#FFCA28'
     }, {
         'type': 'D1',
         'value': Math.floor(Math.random() * 20),
         'color': '#5B2A22'
     }, {
         'type': 'D2',
         'value': Math.floor(Math.random() * 20),
         'color': '#795548'
     }, {
         'type': 'E',
         'value': Math.floor(Math.random() * 20),
         'color': '#F4201F'
     }];
     var svg1 = d3.select('tr');
     var new_one = d3.select('tr').selectAll('td')
         .data(data_table)
     var final_pls = svg1.selectAll('.r1')
         .data(data_table)
         .text(function (d) {
             return d.value;
         })

     var new_one1 = new_one.enter().append('td');
     new_one1.append('span')
         .attr('class', 'r1')
         .style('color', function (d) {
             return d.color;
         })
         .text(function (d) {
             return d.value;
         })
     new_one1.append('span')
         .attr('class', 'r11')
         .text(function (d) {
             return d.type;
         })
     d3.select('.table_div').style('opacity', 1);
 }