import React, { Component } from "react";
import Highcharts from "highcharts";
import _ from "lodash";

Highcharts.setOptions({
  global: {
    useUTC: false,
  },
});

const defaultOptions = {
  chart: {
    width: 1560,
    height: 250,
  },
  credits: {
    enabled: false,
  },
  legend: {
    layout: "horizontal",
    maxHeight: 40,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
  },
  xAxis: {
    crosshair: true,
    categories: [],
  },
  yAxis: {
    title: {
      text: null,
    },
    min:0
  },
  tooltip: {
    shared: true,
  },
  plotOptions: {
    line: {
      marker: {
        enabled: false,
      },
    },
    series: {
      color: "rgb(0, 169, 255)",
    },
  },
  legend: {
    align: "right",
    verticalAlign: "top",
    layout: "vertical",
    x: 0,
    y: 100,
  },
};

class ChartComponent extends Component {
  componentDidMount() {
    const options = Highcharts.merge(defaultOptions, this.props.option);
    this.chart = Highcharts.chart(this.container, options);
  }

  componentWillUnmount() {
    this.chart.destroy();
  }

  componentDidUpdate(prevProps) {
    if (this.props.option !== prevProps.option) {
      this.chart.update(this.props.option);
    }
  }

  render() {
    return <div ref={(container) => (this.container = container)}></div>;
  }
}

export default ChartComponent;
