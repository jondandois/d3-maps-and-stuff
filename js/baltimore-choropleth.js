//Width and height of map
var width = 960;
var height = 500;

// D3 Projection
var projection = d3.geo.albersUsa()
                       .translate([width/2, height/2])    // translate to center of screen
                       .scale([1000]);          // scale things down so see entire US

// Define path generator
var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
                 .projection(projection);  // tell path generator to use albersUsa projection

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


// callback for catching the json feature collection and adding it to the page
function load_and_draw_census_tracts (json_fc) {
  var range, levels;
  range = get_property_range(json_fc.features, 'Population');
  levels = range_to_levels(range, steps);
  console.log(levels);
  // Bind the data to the SVG and create one path per GeoJSON feature
  // svg.selectAll("path")
  //   .data(json_fc.features)
  //   .enter()
  //   .append("path")
  //   .attr("d", path)
  //   .style("stroke", "#fff")
  //   .style("stroke-width", "1")
  //   .style("fill", function(d) {
  //     // Get data value
  //     var value = d.properties.visited;

  //     if (value) {
  //     //If value exists…
  //     return color(value);
  //     } else {
  //     //If value is undefined…
  //     return "rgb(213,222,217)";
  //   }
  // });
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
