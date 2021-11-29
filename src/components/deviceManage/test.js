import React, { Component, PureComponent } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import ReactHighcharts from 'react-highcharts';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import "ag-grid-enterprise";
import '../../css/reportResource.css'

import _ from "lodash";

const defaultChartOptions = {
  chart: { type:  'line', height:300, width:1400, },   
  xAxis: {  labels: {align:'center'}}, 
  yAxis: { title: { text: '' },min:0 ,max:100, tickInterval:20  }, 
  plotOptions: { line: { marker: { enabled: false } }},
  title: { text:null, margin:40, align:'left',style:{'fontSize':'12','fontWeight':'bold'}},
  legend: { labelFormat:null, align: 'right', verticalAlign: 'top', layout: 'vertical', x: 0, y: 100, },
};

const data =[10,40,90]
const data1= [2,5,100]
class test extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: [1,2,3],
      chartOptions: {},
      test:{value:"아아"},
    }
  }

  componentDidMount() {
    const chartOptions = {};
    chartOptions.cpuProcessorOptions = {};
    chartOptions.cpuProcessorOptions.option = _.cloneDeep(defaultChartOptions);
    chartOptions.cpuProcessorOptions.option.key="chart_0"
    chartOptions.cpuProcessorOptions.option.series = [{data: data  }]
    chartOptions.cpuProcessorOptions.option.title={text : '<span style="font-weight: bold; font-size:18px;">CPU Processor (%)</span> / '}

    chartOptions.cpuUsedOptions = {};
    chartOptions.cpuUsedOptions.option = _.cloneDeep(defaultChartOptions);
    chartOptions.cpuUsedOptions.option.key="chart_1"
    chartOptions.cpuUsedOptions.option.series = [{data: data1  }]
    chartOptions.cpuUsedOptions.option.title={text : '<span style="font-weight: bold; font-size:18px;">CPU Used (%)</span> / '}

    this.setState({
      chartOptions: chartOptions
    })
  }


  
  change = (e,c,i) => {
    console.log(c);
    let cloneChartOptions = _.cloneDeep(this.state.chartOptions);

  //  console.log(cloneChartOptions);

  //  _.map(cloneChartOptions, (chart, i) => {
  //     console.log(chart);
  //  });

  // if(e.option.chart.type === 'line') {
    // cloneChartOptions.cpuProcessorOptions.option.chart.type = 'column';
    c.option.chart.type='column';
    console.log(c.option.chart.type);
    // cloneChartOptions.cpuUsedOptions.option.chart.type='column'
  // } else {
  //   cloneChartOptions.cpuProcessorOptions.option.chart.type = 'line';
  // }
  // console.log(cloneChartOptions);

  // this.setState({chartOptions : cloneChartOptions });
  console.log(this.state.chartOptions);
  console.log({...this.state.chartOptions});
  console.log(cloneChartOptions);
  const test = this.state.chartOptions;
  test[i].option.chart.type = 'column'
  const db =this.state.chartOptions;
  console.log(test);
  console.log(test[i]);
  const tt = test[i];

  this.setState({ chartOptions : test });

}
  shouldComponentUpdate(nextProps, nextState) {
    if(this.state.chartOptions !== nextState.chartOptions) {
      return true
    } else {
      return false
    }
  }


  render() {
    const { data,name,chart,chartOptions } = this.state;
    return (
      <div style={{marginLeft:'100px', marginTop:'100px'}}>
       {
          _.map(chartOptions, (c, i) => (
            <>
              <ReactHighcharts config={c.option}  key={c.key}     />
              <div className="reportChartMaxSelect">
                  <button onClick={(e) => this.change(e,c,i)}>버튼</button>
              </div>
            </>
          ))
       }
        
      </div>
    );
  }
}

export default test;







// chart:  [{
//   chart: { type:  'line', height:300, width:1400, },   
//   xAxis: { tickInterval: 2 ,labels: {align:'center'}}, 
//   yAxis: { title: { text: '' },min:0 ,max:100, tickInterval:20  }, 
//   plotOptions: { line: { marker: { enabled: false } }},
//   title: { text:null, margin:40, align:'left',style:{'fontSize':'12','fontWeight':'bold'}},
//   legend: { labelFormat:null, align: 'right', verticalAlign: 'top', layout: 'vertical', x: 0, y: 100, },
//   series: [{data: [1,2,3,4,5,6]}],
//   key: '1',
// },
//  { 
//    chart: { type:  'line', height:300, width:1400, },   
//   xAxis: { tickInterval: 2 ,labels: {align:'center'}}, 
//   yAxis: { title: { text: '' },min:0 ,max:100, tickInterval:20  }, 
//   plotOptions: { line: { marker: { enabled: false } }},
//   title: { text:null, margin:40, align:'left',style:{'fontSize':'12','fontWeight':'bold'}},
//   legend: { labelFormat:null, align: 'right', verticalAlign: 'top', layout: 'vertical', x: 0, y: 100, },
//   series: [{data: [1,2,3,4,5,6]}]  , 
//   key: '2',
// }]