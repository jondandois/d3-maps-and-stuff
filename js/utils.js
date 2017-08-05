// utilities module
Dashboard.utils = (function(){
  return {
    // callback to catch change to the dropdown and do stuff
    catch_filter_change: function(event) {
      var selected = this.selectedIndex;
      if (Dashboard.properties[selected] !== Dashboard.property){
        Dashboard.property = Dashboard.properties[selected];
        Dashboard.map.show_property_on_map(Dashboard.data.features, Dashboard.property);
      }
    },

    // do stuff on mouse out`
    catch_mouse_out: function(d) {
      Dashboard.d3.div.transition()
       .duration(500)
       .style("opacity", 0);
    },

    // do stuff on mouse over
    catch_mouse_over: function(d) {
      Dashboard.chart.plot_data(d);
      Dashboard.d3.div.transition()
        .duration(200)
        .style("opacity", .9);
        Dashboard.d3.div.text(`Census 2010 Count ${Dashboard.property}: ${d.properties[Dashboard.property]}`)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    },

    // reproject the map to the data path
    reproject_map_to_data: function(map_data) {
      Dashboard.map.projection
                  .scale(1)
                  .translate([0,0]);

      var b = Dashboard.d3.path.bounds(map_data),
          s = .95 / Math.max((b[1][0] - b[0][0]) / Dashboard.map.width, (b[1][1] - b[0][1]) / Dashboard.map.height),
          t = [(Dashboard.map.width - s * (b[1][0] + b[0][0])) / 2, (Dashboard.map.height - s * (b[1][1] + b[0][1])) / 2];

      Dashboard.map.projection
                  .scale(s)
                  .translate(t);
    },

    // build out the levels and a legend
    build_levels: function(features){
      var range = Dashboard.utils.get_property_range(features, 'Population');
      Dashboard.levels = Dashboard.utils.range_to_levels(range, Dashboard.d3.steps);
    },

    // color the data object based on its properties
    color_path: function(data) {
      // Get data value
      var value = data.properties[Dashboard.property];
      return Dashboard.utils.color_from_value(value);
    },
    // return a color from a value
    color_from_value: function(value){
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
    },

    // helper for mapping over an array to get the min and max for a certin property
    get_property_range: function(features, property) {
      var value_max = 0;
      features.map(function(f){ value_max = (f.properties[property] > value_max ? f.properties[property] : value_max); });

      var value_min = 0;
      // features.map(function(f){ value_min = (f.properties[property] < value_min ? f.properties[property] : value_min); });

      return {min: value_min, max: value_max};
    },

    //return an array of fixed width levels based on range and steps
    range_to_levels: function(range, steps) {
      var step  = (range.max - range.min) / steps;
      var levels = new Array(steps);
      for (var i = levels.length - 1; i >= 0; i--) {
        levels[i] = (i+1)*step + range.min;
      }
      return levels;
    }

  };
})();
