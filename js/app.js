(function () {

  // mapbox API access Token
  L.mapbox.accessToken = 'pk.eyJ1Ijoia2FmdW5rIiwiYSI6ImNqYmc3dXJzczMzZWIzNHFmcmZuNjY3azMifQ.9i48EOQl4WCGZQqKRvuc_g';

  // instantiate map, centered on Chicago
  var map = L.mapbox.map('map')
    .setMaxBounds(L.latLngBounds([40, -89], [44, -86]))
    .setMinZoom(8)
    .setMaxZoom(18);

  // add Mapbox Studio styleLayer
  L.mapbox.styleLayer('mapbox://styles/kafunk/cjgmqqkiq004r2rqwihmtdj04').addTo(map);

  // use omnivore to load the CSV data
  omnivore.csv('data/chipublib_2017_location_counts.csv')
    .on('ready', function (e) {
      // pass data as GeoJSON to drawMap function
      drawLegend(e.target.toGeoJSON());
      drawMap(e.target.toGeoJSON());
    })
    .on('error', function (e) {
      console.log(e.error[0].message);
    });

  function drawLegend(data) {
    var legendControl = L.control({
      position: 'topright'
    });

    // when the control is added to the map
    legendControl.onAdd = function (map) {
      // select the legend using id attribute of legend
      var legend = L.DomUtil.get("legend");
      // disable scroll and click functionality
      L.DomEvent.disableScrollPropagation(legend);
      L.DomEvent.disableClickPropagation(legend);
      // return the selection
      return legend;
    }
    legendControl.addTo(map);

    // amass all relevant data values to determine range for symbols/legend
    var dataValues = data.features.map(function (branch) {
      let branchVals = [];
      // for each prop in a branch
      for (var prop in branch.properties) {
        // shorthand to each value
        var value = branch.properties[prop];
        // if the value can be converted to a number and is not representative of an otherwise unwanted value
        if (!prop.includes("TOTAL") && !prop.includes("OPEN_HRS_WK") && !prop.includes("ZIP") && +value) {
          // add value to the array
          branchVals.push(+value);
        }
      }
      return branchVals;
    });

    // // verify your results!
    // console.log(dataValues.flat());

    // determine max/min values
    // sort our array
    var sortedValues = dataValues.flat().sort(function(a, b) {
      return b - a;
    });

    // round the highest number and use as our large circle diameter
    var maxValue = Math.round(sortedValues[0] / 1000) * 1000;

    // calc the diameters, largest to smallest
    var largestDiameter = calcRadius(maxValue) * 2;

    // for legend purposes, divide largest diameter into quantiles
    var diamBreaks = largestDiameter / 6;

    var diam5 = diamBreaks * 5,
        diam4 = diamBreaks * 4,
        diam3 = diamBreaks * 3,
        diam2 = diamBreaks * 2,
        smallestDiameter = diamBreaks;

    // select our circles container and set the height
    $(".legend-circles").css('height', largestDiameter.toFixed());

    // set width and height for large circle
    $('.legend-largest').css({
      'width': largestDiameter.toFixed(),
      'height': largestDiameter.toFixed()
    });

    // set width and height for the other 5 circles
    $('.legend-circ5').css({
      'width': diam5.toFixed(),
      'height': diam5.toFixed(),
      'top': largestDiameter - diam5,
      'left': largestDiameter / 2 - diam5 / 2
    })

    // set width and height for small circle and position
    $('.legend-circ4').css({
      'width': diam4.toFixed(),
      'height': diam4.toFixed(),
      'top': largestDiameter - diam4,
      'left': largestDiameter / 2 - diam4 / 2
    })
    $('.legend-circ3').css({
      'width': diam3.toFixed(),
      'height': diam3.toFixed(),
      'top': largestDiameter - diam3,
      'left': largestDiameter / 2 - diam3 / 2
    })
    $('.legend-circ2').css({
      'width': diam2.toFixed(),
      'height': diam2.toFixed(),
      'top': largestDiameter - diam2,
      'left': largestDiameter / 2 - diam2 / 2
    })
    $('.legend-smallest').css({
      'width': smallestDiameter.toFixed(),
      'height': smallestDiameter.toFixed(),
      'top': largestDiameter - smallestDiameter,
      'left': largestDiameter / 2 - smallestDiameter / 2
    })

    var mvSixths = maxValue/6;

    // label the max and median value
    $(".legend-largest-label").html(Math.trunc(maxValue).toLocaleString());
    $(".legend-circ5-label").html(Math.trunc(mvSixths).toLocaleString());
    $(".legend-circ4-label").html(Math.trunc(mvSixths * 2).toLocaleString());
    $(".legend-circ3-label").html(Math.trunc(mvSixths * 3).toLocaleString());
    $(".legend-circ2-label").html(Math.trunc(mvSixths * 4).toLocaleString());
    $(".legend-smallest-label").html(Math.trunc(mvSixths * 5).toLocaleString());

    // adjust the position of the circle labels based on size of the corresponding circle
    $(".legend-largest-label").css({
      'top': -14,
      'left': largestDiameter + 12,
    });
    $(".legend-circ5-label").css({
      'top': diam5 - 14,
      'left': largestDiameter + 14,
    });
    $(".legend-circ4-label").css({
      'top': diam4 - 14,
      'left': largestDiameter + 14,
    });
    $(".legend-circ3-label").css({
      'top': diam3 - 14,
      'left': largestDiameter + 14,
    });
    $(".legend-circ2-label").css({
      'top': diam2 - 14,
      'left': largestDiameter + 14,
    });
    $(".legend-smallest-label").css({
      'top': smallestDiameter - 14,
      'left': largestDiameter + 14
    });

    // insert hr elements to connect value label to top of each circle
    $("<hr class='largest'>").insertBefore(".legend-largest-label")
      .css('top', -6)
      .css('left', largestDiameter / 2 + 6)
      .css('width','36%')
    $("<hr class='circ5'>").insertBefore(".legend-circ5-label")
      .css('top',largestDiameter - diam5 - 6)
      .css('left', largestDiameter / 2 + 6)
      .css('width','36%')
    $("<hr class='circ4'>").insertBefore(".legend-circ4-label")
      .css('top',largestDiameter - diam4 - 6)
      .css('left', largestDiameter / 2 + 6)
      .css('width','36%')
    $("<hr class='circ3'>").insertBefore(".legend-circ3-label")
      .css('top',largestDiameter - diam3 - 6)
      .css('left', largestDiameter / 2 + 6)
      .css('width','36%')
    $("<hr class='circ2'>").insertBefore(".legend-circ2-label")
      .css('top',largestDiameter - diam2 - 6)
      .css('left', largestDiameter / 2 + 6)
      .css('width','36%')
    $("<hr class='smallest'>").insertBefore(".legend-smallest-label")
      .css('top',largestDiameter - smallestDiameter - 6)
      .css('left', largestDiameter / 2 + 6)
      .css('width','36%')

  } // end of drawLegend()

  // drawMap function to receive data from omnivore
  function drawMap(data) {

    // declare default options
    var options = {
      pointToLayer: function(feature,layer) {
        return L.circleMarker(layer, {
          opacity: 1,
          weight: 2,
          fillOpacity: 0,
        });
      }
    }

    // create 5 separate layers from same geoJSON data
      // order is based on visual color preferences in this particular case; not otherwise meaningful
    var csLayer = L.geoJson(data,options).addTo(map),
       visLayer = L.geoJson(data,options).addTo(map),
        hpLayer = L.geoJson(data,options).addTo(map),
        hfLayer = L.geoJson(data,options).addTo(map),
      circLayer = L.geoJson(data,options).addTo(map);

    // fit map bounds to data
    map.fitBounds(circLayer.getBounds(), {
      paddingBottomRight: [200,0]
    });

    // assign colors to diff layers
    // note that fillColor will be invisible except on mouseover
    csLayer.setStyle({
      color: '#8dbf90',
      fillColor: '#dee27d'
    });
    hfLayer.setStyle({
      color: '#b5be6a',
      fillColor: '#dee27d'
    });
    hpLayer.setStyle({
      color: '#dda44d',
      fillColor: '#dee27d'
    });
    circLayer.setStyle({
      color: '#fa8253',
      fillColor: '#dee27d'
    });
    visLayer.setStyle({
      color: '#cb5165',
      fillColor: '#dee27d'
    });

    // pass hard-coded timestamp along with all layers
    resizeCircles(visLayer,circLayer,hpLayer,hfLayer,csLayer,'01');
    sequenceUI(visLayer,circLayer,hpLayer,hfLayer,csLayer);

  }

  // akin to updateMap()
  function resizeCircles(visLayer,circLayer,hpLayer,hfLayer,csLayer,currentMonth) {
    visLayer.eachLayer(function(layer){
      var radius = calcRadius(Number(layer.feature.properties['VIS_' + currentMonth]));
      layer.setRadius(radius);
    });
    circLayer.eachLayer(function(layer){
      var radius = calcRadius(Number(layer.feature.properties['CIRC_' + currentMonth]));
      layer.setRadius(radius);
    });
    hpLayer.eachLayer(function(layer){
      var radius = calcRadius(Number(layer.feature.properties['HP_' + currentMonth]));
      layer.setRadius(radius);
    });
    hfLayer.eachLayer(function(layer){
      var radius = calcRadius(Number(layer.feature.properties['HF_' + currentMonth]));
      layer.setRadius(radius);
    });
    csLayer.eachLayer(function(layer){
      var radius = calcRadius(Number(layer.feature.properties['CS_' + currentMonth]));
      layer.setRadius(radius);
    });

    // update hover window with data from currentMonth
      // pass all for maximum responsivity
    retrieveInfo(visLayer,currentMonth);
    retrieveInfo(circLayer,currentMonth);
    retrieveInfo(csLayer,currentMonth);
    retrieveInfo(hpLayer,currentMonth);
    retrieveInfo(hfLayer,currentMonth);

  }

  function calcRadius(val) {
    // assuming val === area of circle,
    var radius = Math.sqrt(val / Math.PI);
    return radius * .5; // adjust .5 as a scale factor; fine if applied consistently at this point
  }

  function sequenceUI(visLayer,circLayer,hpLayer,hfLayer,csLayer) {

    // create Leaflet control for the UI slider
    var sliderControl = L.control({position: 'topright'}),
          sliderLabel = L.control({position: 'topright'});

    sliderControl.onAdd = function(map) {
      // select relevant html elements using given id
      var controls = L.DomUtil.get("slider");

      // disable scroll and click functionality
      L.DomEvent.disableScrollPropagation(controls);
      L.DomEvent.disableClickPropagation(controls);

      // return the selection
      return controls;
    }

    // do the same thing for sliderLabel
    sliderLabel.onAdd = function(map) {

      var sliderTxt = L.DomUtil.get("slider-txt");

      L.DomEvent.disableScrollPropagation(sliderTxt);
      L.DomEvent.disableClickPropagation(sliderTxt);

      return sliderTxt;
    }

    sliderControl.addTo(map);

    sliderLabel.addTo(map);


    // ----- listen and wait for slider change event -----

    $('#slider input[type=range]')
      .on('input', function () {

        // save new slider value as currentMonth
        var currentMonth = this.value.padStart(2,"0");  // confirm this.value is typeOf Str

        // update sliderTxt element
        $('#slider-txt span').html(getName(currentMonth));

        // resize the circles with updated grade level
        resizeCircles(visLayer,circLayer,hpLayer,hfLayer,csLayer,currentMonth);

      });
  } // end sequenceUI

  function getName(monthNum) {
    var months = {
      '01' : "January",
      '02' : "February",
      '03' : "March",
      '04' : "April",
      '05' : "May",
      '06' : "June",
      '07' : "July",
      '08' : "August",
      '09' : "September",
      '10' : "October",
      '11' : "November",
      '12' : "December"
    };
    return months[monthNum];
  }

  function retrieveInfo(topLayer,currentMonth) {

    // select the element and reference with variable
    // and hide it from view initially
    var info = $('#info').hide();

    // since circLayer is on top, use to detect mouseover events
    topLayer.on('mouseover', function (e) {

      // remove the none class to display and show
      info.show();

      // access properties of target layer
      var props = e.layer.feature.properties;

      // populate HTML elements with relevant info
      $('#info h3 span:first-child').html(props.NAME);
      $("#info h4 span:first-child").html('month of ' + getName(currentMonth));  // getName(currentMonth) from month obj

      $(".vis span:last-child").html(Number(props['VIS_' + currentMonth]).toLocaleString());
      $(".circ span:last-child").html(Number(props['CIRC_' + currentMonth]).toLocaleString());
      $(".hp span:last-child").html(Number(props['HP_' + currentMonth]).toLocaleString());
      $(".hf span:last-child").html(Number(props['HF_' + currentMonth]).toLocaleString());
      $(".cs span:last-child").html(Number(props['CS_' + currentMonth]).toLocaleString());

      // raise opacity level as visual affordance
      e.layer.setStyle({
        fillOpacity: .6
      });

    // Sparkline content
      // empty arrays for circ and vis values
      var visValues = [],
         circValues = [],
           hpValues = [],
           hfValues = [],
           csValues = [];

      // loop through the timestamps and push values into those arrays
      for (var i = 1; i <= 12; i++) { // 12 = specific number of timestamps
        var monthNum = i.toString().padStart(2,"0");
        visValues.push(props['VIS_' + monthNum]);
        circValues.push(props['CIRC_' + monthNum]);
        hpValues.push(props['HP_' + monthNum]);
        hfValues.push(props['HF_' + monthNum]);
        csValues.push(props['CS_' + monthNum]);
      }

      $('.visspark').sparkline(visValues, {
        width: '200px',
        height: '30px',
        lineColor: '#2A4C48',
        fillColor: '#cb5165',
        spotRadius: 0,
        lineWidth: 2
      });

      $('.circspark').sparkline(circValues, {
        width: '200px',
        height: '30px',
        lineColor: '#2A4C48',
        fillColor: '#fa8253',
        spotRadius: 0,
        lineWidth: 2
      });

      $('.hpspark').sparkline(hpValues, {
        width: '200px',
        height: '30px',
        lineColor: '#2A4C48',
        fillColor: '#dda44d',
        spotRadius: 0,
        lineWidth: 2
      });

      $('.hfspark').sparkline(hfValues, {
        width: '200px',
        height: '30px',
        lineColor: '#2A4C48',
        fillColor: '#b5be6a',
        spotRadius: 0,
        lineWidth: 2
      });

      $('.csspark').sparkline(csValues, {
        width: '200px',
        height: '30px',
        lineColor: '#2A4C48',
        fillColor: '#649072',
        spotRadius: 0,
        lineWidth: 2
      });

    });

  // Mouseout
    // hide the info panel when mousing off layergroup and remove affordance opacity
    topLayer.on('mouseout', function(e) {

      // hide the info panel
      info.hide();

      // reset the layer style
      e.layer.setStyle({
        fillOpacity: 0
      });
    });

    // when the mouse moves on the document
    $(document).mousemove(function(e) {
      // first offset from the mouse position of the info window
      info.css({
        "left": e.pageX + 6,
        "top": e.pageY - info.height() - 25
      });

      // if it crashes into the top, flip it lower right
      if (info.offset().top < 4) {
        info.css({
          "top": e.pageY + 15
        });
      }
      // if it crashes into the right, flip it to the left
      if (info.offset().left + info.width() >= $(document).width() - 40) {
        info.css({
          "left": e.pageX - info.width() - 80
        });
      }
    });
  } // end retrieveInfo()

})();
