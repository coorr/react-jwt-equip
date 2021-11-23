import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import Select from "react-select";
import AiwacsService from '../../services/equipment.service';
import ReportService from '../../services/report.service';

import Search from '../../images/search.png'
import Loader from '../loader';

import {Button, Modal,Form, Container, Row } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from 'date-fns/esm/locale'
import { FcCalendar } from "react-icons/fc"
import { AiOutlineArrowUp } from "react-icons/ai"
import Moment from 'moment';
import ReactHighcharts from 'react-highcharts';
import Drilldown from 'highcharts-drilldown'; 
import {  AgGridReact } from 'ag-grid-react';
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
class test extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: [1,2,3],
      chartOptions: {},
      test:{value:"아아"},
      chart:  [{
        chart: { type:  'line', height:300, width:1400, },   
        xAxis: { tickInterval: 2 ,labels: {align:'center'}}, 
        yAxis: { title: { text: '' },min:0 ,max:100, tickInterval:20  }, 
        plotOptions: { line: { marker: { enabled: false } }},
        title: { text:null, margin:40, align:'left',style:{'fontSize':'12','fontWeight':'bold'}},
        legend: { labelFormat:null, align: 'right', verticalAlign: 'top', layout: 'vertical', x: 0, y: 100, },
        series: [{data: [1,2,3,4,5,6]}],
        key: '1',
      },
       { 
         chart: { type:  'line', height:300, width:1400, },   
        xAxis: { tickInterval: 2 ,labels: {align:'center'}}, 
        yAxis: { title: { text: '' },min:0 ,max:100, tickInterval:20  }, 
        plotOptions: { line: { marker: { enabled: false } }},
        title: { text:null, margin:40, align:'left',style:{'fontSize':'12','fontWeight':'bold'}},
        legend: { labelFormat:null, align: 'right', verticalAlign: 'top', layout: 'vertical', x: 0, y: 100, },
        series: [{data: [1,2,3,4,5,6]}]  , 
        key: '2',
      }]
    }
  }

  componentDidMount() {
    const chartOptions = {};
    chartOptions.cpuProcessorOptions = {};
    chartOptions.cpuProcessorOptions.option = _.cloneDeep(defaultChartOptions);
    chartOptions.cpuProcessorOptions.option.key="chart_0"
    chartOptions.cpuProcessorOptions.option.series = [{data: data  }]
    chartOptions.cpuProcessorOptions.option.title={text : '<span style="font-weight: bold; font-size:18px;">CPU Processor (%)</span> / '}
    // chartOptions.cpuProcessorOptions.option.legend={ labelFormat : deviceName[i]} ;

    chartOptions.cpuUsedOptions = {};
        chartOptions.cpuUsedOptions.option = _.cloneDeep(defaultChartOptions);
        chartOptions.cpuUsedOptions.option.key="chart_1"
        chartOptions.cpuUsedOptions.option.series = [{data: data  }]
        chartOptions.cpuUsedOptions.option.title={text : '<span style="font-weight: bold; font-size:18px;">CPU Used (%)</span> / '}
        // chartOptions.cpuUsedOptions.option.legend={ labelFormat : deviceName[i]} ;

        this.setState({
          chartOptions: chartOptions
        })
  }


  
  change = (i,event,c,e) => {
    // console.log(event);
    let cloneChartOptions = _.cloneDeep(this.state.chartOptions);

   console.log(cloneChartOptions);

   _.map(cloneChartOptions, (chart, i) => {
      console.log(chart);
   });

  //  if(e.target.value === 'line') {
    cloneChartOptions.cpuProcessorOptions.option.chart.type = 'column';
  //  } else if(e.target.value === 'bar') {
    // cloneChartOptions.cpuProcessorOptions.option.chart.type = 'column';
  //  }
   console.log(this.state.test.value);
  // console.log(this.state.test[0].value);
   const testt = this.state.test.value;
   this.setState({chartOptions : cloneChartOptions });


  }


  render() {
    const { data,name,chart,chartOptions } = this.state;
    return (
      <div style={{marginLeft:'100px', marginTop:'100px'}}>
       {
          _.map(chartOptions, (c, i) => (
            <>
                  <ReactHighcharts config={c.option}  key={i}  syncId="l2ChartEl"    />
                  <div className="reportChartMaxSelect">
                    {/* <select 
                      // name={"select_"+i} 
                      key={i}
                      id={"select_"+i}
                      className="reportChartSelect"
                      onChange={this.change} >
                        <option value="line">Line</option>
                        <option value="bar">Bar</option>
                    </select> */}
                    <button onClick={this.change}>버튼</button>
                  </div>
            </>
          ))
       }
        
      </div>
    );
  }
}

// class testd extends Component { }
export default test;