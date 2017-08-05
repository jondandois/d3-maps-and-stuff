Dashboard.initialize = function initialize () {
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

  // create SVG for legend
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

  Dashboard.properties = ["Population", "White","Blk_AfAm","AmInd_AkNa","Asian","NatHaw_Pac","Other_Race","TwoOrMore","Hisp_Lat"]
  // default first option
  Dashboard.property = 'Population';

  document.getElementById('filter-dropdown').addEventListener('change', Dashboard.utils.catch_filter_change);

  // load in census tracts
  d3.json("data/baltimore-city-census-tracts.json", Dashboard.map.load_and_draw_census_tracts);
}
