Dashboard.legend.build_legend = function build_legend (argument) {
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
        .style('fill', Dashboard.utils.color_from_value)
        .style('stroke', Dashboard.utils.color_from_value);

  legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function(d) { return parseInt(d); });
};
