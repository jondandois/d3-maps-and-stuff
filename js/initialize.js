Dashboard.initialize = function initialize () {
  //Width and height of map
  Dashboard.map.width = 400;
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

  var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", Dashboard.utils.zoomed);

  var margin = {top: -5, right: -5, bottom: -5, left: -5},
    width = Dashboard.map.width - margin.left - margin.right,
    height = Dashboard.map.height - margin.top - margin.bottom;

  Dashboard.container.svg = d3.select("#map")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.right + ")")
      .call(zoom);

  //Create SVG element and append map to the SVG
  Dashboard.map.svg = Dashboard.container.svg
              .append("svg")
              .attr("width", Dashboard.map.width)
              .attr("height", Dashboard.map.height)
              .call(zoom);

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

  // Dashboard.properties = ["Population", "White","Blk_AfAm","AmInd_AkNa","Asian","NatHaw_Pac","Other_Race","TwoOrMore","Hisp_Lat"]
  Dashboard.properties = ["Total_Deaths", "Jan_2014","Feb_2014","Mar_2014","Apr_2014","May_2014","Jun_2014","Jul_2014",
                      "Aug_2014","Sep_2014","Oct_2014","Nov_2014","Dec_2014","Jan_2015","Feb_2015",
                      "Mar_2015","Apr_2015","May_2015","Jun_2015","Jul_2015","Aug_2015","Sep_2015",
                      "Oct_2015","Nov_2015","Dec_2015","Jan_2016","Feb_2016","Mar_2016","Apr_2016",
                      "May_2016","Jun_2016","Jul_2016","Aug_2016","Sep_2016","Oct_2016","Nov_2016",
                      "Dec_2016","Jan_2017","Feb_2017","Mar_2017","Apr_2017","May_2017","Jun_2017","Jul_2017"]
  // default first option
  Dashboard.property = 'Total_Deaths';

  document.getElementById('filter-dropdown').addEventListener('change', Dashboard.utils.catch_filter_change);
document.getElementById('reset-map').addEventListener('click', Dashboard.utils.catch_button_click);
  // load in census tracts
  d3.json("data/baltimore-city-census-tracts-deaths.json", Dashboard.map.load_and_draw_census_tracts);
}
