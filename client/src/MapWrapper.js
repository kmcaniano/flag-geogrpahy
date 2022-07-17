import React, { Component } from 'react';
import * as d3 from 'd3';
import Datamap from 'datamaps';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardHeader from '@mui/material/CardHeader';
import { ButtonGroup } from '@mui/material';


class MapWrapper extends Component {
  countryFills = {};
  constructor(props) {
    super(props);
    this.state = { 'selectedCountryCode': "", 'open': false };
  }

  render() {
    return <Grid container spacing={2}><Grid item xs={12} style={{ textAlign: "center" }}>
      <ButtonGroup variant="contained" size="large" sx={{ margin: "10px" }}>
        <Button onClick={this.submitClick} sx={{ marginRight: "10px" }}>Submit</Button>
        <Button onClick={this.giveUpClick}>I Give Up!</Button>
      </ButtonGroup>
      <Modal open={this.state.open} onClose={() => this.setState({ "open": false })} sx={{ top: '25%', left: '30%' }}>
        <Box sx={{ width: "400px", height: "300px", border: '2px solid #000' }}>
          <Card sx={{ bgcolor: 'lightgray', paddingTop: '8px', height: "100%" }}>
            <CardHeader title="Incorrect Country" />
            <CardMedia
              component="img"
              height="200"
              image={process.env.PUBLIC_URL + '/flags/' + this.state.selectedCountryCode + '.png'}
            />
          </Card>
        </Box>
      </Modal>
    </Grid>
      <Grid item xs={12}><Box id="mapPlaceholder" sx={{ position: "relative", width: "800px", height: "500px", display: "block", margin: "auto" }} />
      </Grid></Grid>;
  }

  updateCountryCode(countryCode) {
    this.setState({ 'selectedCountryCode': countryCode });
  }

  submitClick = () => {
    if (this.state.selectedCountryCode === this.props.countryCode) {
      this.countryFills[this.state.selectedCountryCode] = { fillKey: 'SUCCESS' };
      Object.entries(this.countryFills).forEach(([key, value]) => {
        if (value["fillKey"] != 'SUCCESS' && value["fillKey"] != 'SKIPPED') {
          value["fillKey"] = 'UNSELECTED';
        }
      });
      this.map.updateChoropleth(this.countryFills);
      this.props.reloadCountry(this.state.selectedCountryCode);
    }
    else {
      this.setState({ "open": true });
      this.countryFills[this.state.selectedCountryCode] = { fillKey: 'FAILURE' };
      this.map.updateChoropleth(this.countryFills);
    }
  }

  giveUpClick = () => {
    this.countryFills[this.props.selectedCountryCode] = { fillKey: 'SKIPPED' };
    this.map.updateChoropleth(this.countryFills);
    this.props.skipCountry(this.state.selectedCountryCode);
  }

  componentDidMount() {
    var that = this;
    if (this.map === undefined) {
      this.map = new Datamap({
        element: document.getElementById('mapPlaceholder'),
        done: function (datamap) {
          datamap.svg.selectAll('.datamaps-subunit').on('click', function (geography) {
            if (that.countryFills[geography.id] === undefined || that.countryFills[geography.id]["fillKey"] == 'UNSELECTED') {
              that.countryFills[geography.id] = { fillKey: 'SELECTED' };
              if (that.state.selectedCountryCode != "" && that.countryFills[that.state.selectedCountryCode]["fillKey"] == 'SELECTED') {
                that.countryFills[that.state.selectedCountryCode] = { fillKey: 'UNSELECTED' };
              }
              datamap.updateChoropleth(that.countryFills);
              that.updateCountryCode(geography.id);
            }
          });
        },
        projection: 'mercator',
        scope: 'world',
        fills: {
          'SELECTED': '#306596',
          'SUCCESS': '#008000',
          'FAILURE': '#FF0000',
          'UNSELECTED': '#dddddd',
          'SKIPPED': '#000000',
          defaultFill: '#dddddd'
        },
        geographyConfig: {
          highlightOnHover: false,
          dataUrl: './topoJson/world.hires.topo.json'
        }
      });
      this.init(this.map);
    }
  }

  doZoom(event) {
    this.state.mapFeatures.attr("transform",
      "translate(" + event.translate + ") scale(" + event.scale + ")");
  }

  dataMapFunction(datamap) {
    datamap.svg.selectAll('.datamaps-subunit').on('click', function (geography) {
      console.log(this.props);
    });
  }


  zoomed(svg, onZoomFunction) {
    svg.attr("width", "800px")
      .attr("height", "300px")
      .call(d3.behavior.zoom().on("zoom", function () {
        svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
      }));
  }

  //Adjusted zoom functionality from this JFiddle https://jsfiddle.net/wunderbart/Lom3b0gb/
  init(map) {
    var paths = map.svg.selectAll("path"),
      subunits = map.svg.selectAll(".datamaps-subunit");

    // preserve stroke thickness
    paths.style("vector-effect", "non-scaling-stroke");

    // disable click on drag end
    subunits.call(
      d3.behavior.drag().on("dragend", function () {
        d3.event.sourceEvent.stopPropagation();
      })
    );
    this.scale = {};
    this.scale.set = this.getScalesArray();
    this.d3Zoom = d3.behavior.zoom().scaleExtent([1, 50]);
    this.map = map;
    this.listen(map);
  };

  listen(map) {
    map.svg
      .call(this.d3Zoom.on("zoom", this.handleScroll.bind(this)))
      .on("dblclick.zoom", null); // disable zoom on double-click
  };

  handleScroll() {
    var translate = d3.event.translate,
      scale = d3.event.scale,
      limited = this.bound(translate, scale);

    this.scrolled = true;

    this.update(limited.translate, limited.scale);
  };

  shift(direction) {
    var center = [800 / 2, 300 / 2],
      translate = this.d3Zoom.translate(), translate0 = [], l = [],
      view = {
        x: translate[0],
        y: translate[1],
        k: this.d3Zoom.scale()
      }, bounded;

    translate0 = [
      (center[0] - view.x) / view.k,
      (center[1] - view.y) / view.k
    ];

    if (direction == "reset") {
      view.k = 1;
      this.scrolled = true;
    } else {
      view.k = this.getNextScale(direction);
    }

    l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

    view.x += center[0] - l[0];
    view.y += center[1] - l[1];

    bounded = this.bound([view.x, view.y], view.k);

    this.animate(bounded.translate, bounded.scale);
  };

  bound(translate, scale) {
    var width = 800,
      height = 300;

    translate[0] = Math.min(
      (width / height) * (scale - 1),
      Math.max(width * (1 - scale), translate[0])
    );

    translate[1] = Math.min(0, Math.max(height * (1 - scale), translate[1]));

    return { translate: translate, scale: scale };
  };

  update(translate, scale) {
    this.d3Zoom
      .translate(translate)
      .scale(scale);

    this.map.svg.selectAll("g")
      .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
  };

  animate(translate, scale) {
    var d3Zoom = this.d3Zoom;

    d3.transition().duration(350).tween("zoom", function () {
      var iTranslate = d3.interpolate(d3Zoom.translate(), translate),
        iScale = d3.interpolate(d3Zoom.scale(), scale);

      return function (t) {
        this.update(iTranslate(t), iScale(t));
      };
    });
  };

  getScalesArray() {
    var array = [],
      scaleMaxLog = Math.log(50);

    for (var i = 0; i <= 10; i++) {
      array.push(Math.pow(Math.E, 0.1 * i * scaleMaxLog));
    }

    return array;
  };

  getNextScale(direction) {
    var scaleSet = this.scale.set,
      currentScale = this.d3Zoom.scale(),
      lastShift = scaleSet.length - 1,
      shift, temp = [];

    if (this.scrolled) {

      for (shift = 0; shift <= lastShift; shift++) {
        temp.push(Math.abs(scaleSet[shift] - currentScale));
      }

      shift = temp.indexOf(Math.min.apply(null, temp));

      if (currentScale >= scaleSet[shift] && shift < lastShift) {
        shift++;
      }

      if (direction == "out" && shift > 0) {
        shift--;
      }

      this.scrolled = false;

    } else {

      shift = this.scale.currentShift;

      if (direction == "out") {
        shift > 0 && shift--;
      } else {
        shift < lastShift && shift++;
      }
    }

    this.scale.currentShift = shift;

    return scaleSet[shift];
  };
}

export default MapWrapper;