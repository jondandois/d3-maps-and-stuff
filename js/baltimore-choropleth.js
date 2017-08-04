//Width and height of map
var width = 960;
var height = 500;

// maryland state plane
var projection = d3.geo.conicConformal()
  .parallels([38 + 18 / 60, 39 + 27 / 60])
  .rotate([77, -37 - 40 / 60]);

// Define path generator
var path = d3.geo.path()
                 .projection(projection);

// Define linear scale for output
var steps = 10;
var low_color = '#DD503C';
var high_color = '#497B94';
var color = d3.scale.linear()
              .domain([0, steps - 1])
              .range([low_color,high_color])

//Create SVG element and append map to the SVG
var svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

// Append Div for tooltip to SVG
var div = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

// load in census tracts
d3.json("data/baltimore-city-census-tracts.json", load_and_draw_census_tracts);

var levels = [];
var property = 'Population';
// callback for catching the json feature collection and adding it to the page
function load_and_draw_census_tracts (json_fc) {

  reproject_map_to_data(json_fc);

  var range = get_property_range(json_fc.features, property);
  levels = range_to_levels(range, steps);

  // Bind the data to the SVG and create one path per GeoJSON feature
  svg.selectAll("path")
    .data(json_fc.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("stroke", "#fff")
    .style("stroke-width", "1")
    .style("fill", color_path)
    .on("mouseover", catch_mouse_over)
    .on('mouseout', catch_mouse_out);
}

// color the data object based on its properties
function color_path (data) {
  // Get data value
  var value = data.properties[property];

  if (value) {
    var value_level;
    levels.map( (l, i) => { if ( l < value) {value_level = i;}})
    //If value exists…
    // console.log(color(value_level));
    return color(value_level);
  } else {
    //If value is undefined…
    return "rgb(213,222,217)";
  }
}

// helper for mapping over an array to get the min and max for a certin property
function get_property_range(features, property) {
  var value_max = 0;
  features.map(function(f){ value_max = (f.properties[property] > value_max ? f.properties[property] : value_max); });

  var value_min = value_max;
  features.map(function(f){ value_min = (f.properties[property] < value_min ? f.properties[property] : value_min); });

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
  projection
    .scale(1)
    .translate([0,0]);

  var b = path.bounds(map_data),
      s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
      t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

  projection
    .scale(s)
    .translate(t);
}

// do stuff on mouse over
function catch_mouse_over (d) {
  div.transition()
     .duration(200)
     .style("opacity", .9);
     div.text(`Census 2010 Population: ${d.properties[property]}`)
     .style("left", (d3.event.pageX) + "px")
     .style("top", (d3.event.pageY - 28) + "px");
}

// do stuff on mouse out`
function catch_mouse_out (d) {
  div.transition()
   .duration(500)
   .style("opacity", 0);
}
