Dashboard.chart = {};

Dashboard.chart.margin = {top: 20, right: 30, bottom: 60, left: 40};
Dashboard.chart.width = 350 - Dashboard.chart.margin.left - Dashboard.chart.margin.right;
Dashboard.chart.height = 250 - Dashboard.chart.margin.top - Dashboard.chart.margin.bottom;

Dashboard.chart.x = d3.scale.ordinal()
    .rangeRoundBands([0, Dashboard.chart.width], 0.1, 0.2);

Dashboard.chart.y = d3.scale.linear()
    .range([Dashboard.chart.height, 0]);

Dashboard.chart.svg = d3.select("#chart").append("svg")
    .attr("width", Dashboard.chart.width + Dashboard.chart.margin.left + Dashboard.chart.margin.right)
    .attr("height", Dashboard.chart.height + Dashboard.chart.margin.top + Dashboard.chart.margin.bottom)
  .append("g")
    .attr("transform", "translate(" + Dashboard.chart.margin.left + "," + Dashboard.chart.margin.top + ")");

// return new array of objects of properties and values matching the properties array
function get_property_values (data, properties) {
  return properties.map( function(property){
    return {property: property, value: data.properties[property]};
  });
}

Dashboard.chart.plot_data = function plot_data (data) {
  var properties = Dashboard.properties.slice(Dashboard.properties.indexOf('Population')+1);
  var values = get_property_values(data, properties);
  Dashboard.chart.x.domain(properties);
  Dashboard.chart.y.domain([0, d3.max(values.map(function(value){return value.value;}))]);

  Dashboard.chart.svg.selectAll("*").remove();
  Dashboard.chart.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + Dashboard.chart.height + ")")
      .call(d3.svg.axis().scale(Dashboard.chart.x).orient("bottom"))
    .selectAll('text')
      .attr("x", "-10")
      .attr("y", "7")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

  Dashboard.chart.svg.append("g")
      .attr("class", "y axis")
      .call(d3.svg.axis().scale(Dashboard.chart.y).orient("left"));

  // add bars and all
  Dashboard.chart.svg.selectAll(".bar")
      .data(values)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return Dashboard.chart.x(d.property); })
      .attr("width", Dashboard.chart.x.rangeBand())
      .attr("y", function(d) { return Dashboard.chart.y(d.value); })
      .attr("height", function(d) { return Dashboard.chart.height - Dashboard.chart.y(d.value); });
}
