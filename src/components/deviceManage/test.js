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



class test extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data:  [{
        chart: { type:  'line', height:300, width:1400, },   
        xAxis: { tickInterval: 2 ,labels: {align:'center'}}, 
        yAxis: { title: { text: '' },min:0 ,max:100, tickInterval:20  }, 
        plotOptions: { line: { marker: { enabled: false } }},
        title: { text:null, margin:40, align:'left',style:{'fontSize':'12','fontWeight':'bold'}},
        legend: { labelFormat:null, align: 'right', verticalAlign: 'top', layout: 'vertical', x: 0, y: 100, },
        series: [{data: [1,2,3,4,5,6]}]
      },
       { chart: { type:  'line', height:300, width:1400, },   
        xAxis: { tickInterval: 2 ,labels: {align:'center'}}, 
        yAxis: { title: { text: '' },min:0 ,max:100, tickInterval:20  }, 
        plotOptions: { line: { marker: { enabled: false } }},
        title: { text:null, margin:40, align:'left',style:{'fontSize':'12','fontWeight':'bold'}},
        legend: { labelFormat:null, align: 'right', verticalAlign: 'top', layout: 'vertical', x: 0, y: 100, },
        series: [{data: [1,2,3,4,5,6]}]  } ]
    }
  }
  
  change = () => {
    const { data } = this.state;

    console.log(data[0]);

    data[0].chart.type='column'
    console.log(data);
    this.setState({})
  }

  render() {
    return (
      <div style={{marginLeft:'100px', marginTop:'100px'}}>
        {
          this.state.data.map((c,i) => (
                <div key={i} id={"chart_"+i}>
                  <ReactHighcharts config={c} />
                  {/* <button onClick={() => this.change()} >아아</button>   */}
                </div>
          ))
        }
                          <button onClick={() => this.change()} >아아</button>  

        
      </div>
    );
  }
}

export default test;