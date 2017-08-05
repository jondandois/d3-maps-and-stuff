//create a namespace for the dashboard
window.Dashboard = {
  d3: {},
  data: null,
  legend: {},
  map: {}
};

window.onload = initialize;

//initialize map config
function initialize () {
  //Width and height of map
  Dashboard.map.width = 500;
  Dashboard.map.height = 500;

  // maryland state plane
  Dashboard.map.projection = d3.geo.conicConformal()
    .parallels([38 + 18 / 60, 39 + 27 / 60])
    .rotate([77, -37 - 40 / 60]);

  // Define path generator
  Dashboard.d3.path = d3.geo.path()
                   .projection(Dashboard.map.projection);

  // Define linear scale for output
  Dashboard.d3.steps = 10;
  var low_color = '#DD503C';
  var high_color = '#497B94';
  Dashboard.d3.color = d3.scale.linear()
                .domain([0, Dashboard.d3.steps - 1])
                .range([low_color,high_color])

  //Create SVG element and append map to the SVG
  Dashboard.map.svg = d3.select("#map")
              .append("svg")
              .attr("width", Dashboard.map.width)
              .attr("height", Dashboard.map.height);

  Dashboard.legend.svg = d3.select("#legend")
              .append("svg")
              .attr("width", 100)
              .attr("height", 250);

  // Append Div for tooltip to SVG
  Dashboard.d3.div = d3.select("#legend")
              .append("div")
              .attr("class", "mouseover-text")
              .style("opacity", 0);

  Dashboard.levels = [];

  Dashboard.properties = ['Population', 'White', 'Blk_AfAm', 'AmInd_AkNa', 'Asian', 'PopOver18']
  // default first option
  Dashboard.property = 'Population';

  document.getElementById('filter-dropdown').addEventListener('change', catch_filter_change);

  // load in census tracts
  d3.json("data/baltimore-city-census-tracts.json", load_and_draw_census_tracts);
}

// callback for catching the json feature collection and adding it to the page
function load_and_draw_census_tracts (json_fc) {
  Dashboard.data = json_fc;
  populate_dropdown(Dashboard.data);
  reproject_map_to_data(json_fc);
  show_property_on_map(json_fc.features, Dashboard.property);
}

// populate the dropdown based on data
function populate_dropdown(){
  Dashboard.properties.forEach( function(property) {
    var new_option = document.createElement('option');
    new_option.setAttribute('value', property);
    new_option.innerText = property;
    if (property === Dashboard.property){
      new_option.selected = true;
    }
    document.getElementById('filter-dropdown').appendChild(new_option);
  });
}

// function for drawing features on the map based on a property
function show_property_on_map(features, property) {
  // compute the levels and legend based on the Total Population field, only once
  if (Dashboard.levels.length === 0){
    build_levels(features);
  }

  // Bind the data to the SVG and create one path per GeoJSON feature
  Dashboard.map.svg.selectAll("path").remove();
  Dashboard.map.svg.selectAll("path")
    .data(features)
    .enter()
    .append("path")
    .attr("d", Dashboard.d3.path)
    .style("stroke", "#fff")
    .style("stroke-width", "1")
    .style("fill", color_path)
    .on("mouseover", catch_mouse_over)
    .on('mouseout', catch_mouse_out);

  build_legend();
}

// build out the levels and a legend
function build_levels(features){
  var range = get_property_range(features, 'Population');
  Dashboard.levels = range_to_levels(range, Dashboard.d3.steps);
}
function build_legend (argument) {
  var legendRectSize = 18;
  var legendSpacing = 4;
  var color_domain = Dashboard.d3.color.domain;
  var legend = Dashboard.legend.svg.selectAll('.legend')
                  .data(Dashboard.levels)
                  .enter()
                  .append('g')
                  .attr('class', 'legend')
                  .attr('transform', function(d, i) {
                    var height = legendRectSize + legendSpacing;
                    var horz = 0;
                    var vert = i * height;
                    return 'translate(' + horz + ',' + vert + ')';
                  });

  legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', color_from_value)
        .style('stroke', color_from_value);

  legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function(d) { return parseInt(d); });
}

// color the data object based on its properties
function color_path (data) {
  // Get data value
  var value = data.properties[Dashboard.property];
  return color_from_value(value);
}
// return a color from a value
function color_from_value(value){
  var no_data = "rgb(213,222,217)";
  if (value > 0 ) {
    //If value exists…
    var value_level = 0;
    Dashboard.levels.map( (l, i) => { if ( l < value) {value_level = i;}});
    return Dashboard.d3.color(value_level);
  } else {
    //If value is undefined…
    return no_data;
  }
}

// helper for mapping over an array to get the min and max for a certin property
function get_property_range(features, property) {
  var value_max = 0;
  features.map(function(f){ value_max = (f.properties[property] > value_max ? f.properties[property] : value_max); });

  var value_min = 0;
  // features.map(function(f){ value_min = (f.properties[property] < value_min ? f.properties[property] : value_min); });

  return {min: value_min, max: value_max};
}

function range_to_levels (range, steps) {
  var step  = (range.max - range.min) / steps;
  var levels = new Array(steps);
  for (var i = levels.length - 1; i >= 0; i--) {
    levels[i] = (i+1)*step + range.min;
  }
  return levels;
}

// reproject the map to the data path
function reproject_map_to_data (map_data) {
  Dashboard.map.projection
              .scale(1)
              .translate([0,0]);

  var b = Dashboard.d3.path.bounds(map_data),
      s = .95 / Math.max((b[1][0] - b[0][0]) / Dashboard.map.width, (b[1][1] - b[0][1]) / Dashboard.map.height),
      t = [(Dashboard.map.width - s * (b[1][0] + b[0][0])) / 2, (Dashboard.map.height - s * (b[1][1] + b[0][1])) / 2];

  Dashboard.map.projection
              .scale(s)
              .translate(t);
}

// do stuff on mouse over
function catch_mouse_over (d) {
  Dashboard.d3.div.transition()
    .duration(200)
    .style("opacity", .9);
    Dashboard.d3.div.text(`Census 2010 Count ${Dashboard.property}: ${d.properties[Dashboard.property]}`)
    .style("left", (d3.event.pageX) + "px")
    .style("top", (d3.event.pageY - 28) + "px");
}

// do stuff on mouse out`
function catch_mouse_out (d) {
  Dashboard.d3.div.transition()
   .duration(500)
   .style("opacity", 0);
}

// callback to catch change to the dropdown and do stuff

function catch_filter_change (event) {
  // get the index of the selected item
  var selected = this.selectedIndex;
  if (Dashboard.properties[selected] !== Dashboard.property){
    Dashboard.property = Dashboard.properties[selected];
    show_property_on_map(Dashboard.data.features, Dashboard.property);
  }
}
