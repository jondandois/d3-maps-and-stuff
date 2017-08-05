Dashboard.map = (function(){
  return {
    // callback for catching the json feature collection and adding it to the page
    load_and_draw_census_tracts: function(json_fc) {
      Dashboard.data = json_fc;
      Dashboard.map.populate_dropdown(Dashboard.data);
      Dashboard.utils.reproject_map_to_data(json_fc);
      Dashboard.map.show_property_on_map(json_fc.features, Dashboard.property);
    },

    // populate the dropdown based on data
    populate_dropdown: function(){
      Dashboard.properties.forEach( function(property) {
        var new_option = document.createElement('option');
        new_option.setAttribute('value', property);
        new_option.innerText = property;
        if (property === Dashboard.property){
          new_option.selected = true;
        }
        document.getElementById('filter-dropdown').appendChild(new_option);
      });
    },

    // function for drawing features on the map based on a property
    show_property_on_map: function(features, property) {
      // compute the levels and legend based on the Total Population field, only once
      if (Dashboard.levels.length === 0){
        Dashboard.utils.build_levels(features);
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
        .style("fill", Dashboard.utils.color_path)
        .on("mouseover", Dashboard.utils.catch_mouse_over)
        .on('mouseout', Dashboard.utils.catch_mouse_out);

      Dashboard.legend.build_legend();
    }
  };
})();
