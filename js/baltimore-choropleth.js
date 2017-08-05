//create a namespace for the dashboard
window.Dashboard = {
  d3: {},
  data: null,
  map: {}
};

window.onload = initialize;

//initialize map config
function initialize () {
  //Width and height of map
  Dashboard.map.width = 400;
  Dashboard.map.height = 400;

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
  Dashboard.map.svg = d3.select("body")
              .append("svg")
              .attr("width", Dashboard.map.width)
              .attr("height", Dashboard.map.height);

  // Append Div for tooltip to SVG
  Dashboard.d3.div = d3.select("body")
              .append("div")
              .attr("class", "mouseover-text")
              .style("opacity", 0);

  Dashboard.levels = [];
  Dashboard.property = 'Population';

  // load in census tracts
  d3.json("data/baltimore-city-census-tracts.json", load_and_draw_census_tracts);
}

// callback for catching the json feature collection and adding it to the page
function load_and_draw_census_tracts (json_fc) {
  Dashboard.data = json_fc;

  reproject_map_to_data(json_fc);

  var range = get_property_range(json_fc.features, Dashboard.property);
  Dashboard.levels = range_to_levels(range, Dashboard.d3.steps);

  // Bind the data to the SVG and create one path per GeoJSON feature
  Dashboard.map.svg.selectAll("path")
    .data(json_fc.features)
    .enter()
    .append("path")
    .attr("d", Dashboard.d3.path)
    .style("stroke", "#fff")
    .style("stroke-width", "1")
    .style("fill", color_path)
    .on("mouseover", catch_mouse_over)
    .on('mouseout', catch_mouse_out);
}

// color the data object based on its properties
function color_path (data) {
  // Get data value
  var value = data.properties[Dashboard.property];

  if (value) {
    var value_level;
    Dashboard.levels.map( (l, i) => { if ( l < value) {value_level = i;}})
    //If value exists…
    // console.log(color(value_level));
    return Dashboard.d3.color(value_level);
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
    Dashboard.d3.div.text(`Census 2010 Population: ${d.properties[Dashboard.property]}`)
    .style("left", (d3.event.pageX) + "px")
    .style("top", (d3.event.pageY - 28) + "px");
}

// do stuff on mouse out`
function catch_mouse_out (d) {
  Dashboard.d3.div.transition()
   .duration(500)
   .style("opacity", 0);
}
