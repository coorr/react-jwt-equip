import React, { Component } from 'react';
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
const time = [{value:'00'},{value:'01'},{value:'02'},{value:'03'},{value:'04'},{value:'05'},{value:'06'},{value:'07'},{value:'08'},{value:'09'},{value:'10'},{value:'11'},{value:'12'}
,{value:'13'},{value:'14'},{value:'15'},{value:'16'},{value:'17'},{value:'18'},{value:'19'},{value:'20'},{value:'21'},{value:'22'},{value:'23'}]

const configs = { 
  // plotOptions: { series: { color:'#FF0000', borderWidth: 1, dataLabels: { enabled: true, format: '{point.y:.1f}%' } } }, 
  // tooltip: { headerFormat: '<span style="font-size:11px">{series.name}</span><br>', 
  //           pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>' }, 
  // drilldown: { 
  //   animation: false, 
  //   series: [{ name: 'Microsoft Internet Explorer', id: 'Microsoft Internet Explorer', 
  //   data: [ [ 'v11.0', 24.13 ], [ 'v8.0', 17.2 ], [ 'v9.0', 8.11 ], [ 'v10.0', 5.33 ], [ 'v6.0', 1.06 ], [ 'v7.0', 0.5 ] ] }, 
  //   { name: '2021-11-10 01:00', 
  //     id: 'Chrome', 
  //     data: [ [ 'v40.0', 5 ], [ 'v41.0', 4.32 ], [ 'v42.0', 3.68 ], [ 'v39.0', 2.96 ], [ 'v36.0', 2.53 ], [ 'v43.0', 1.45 ], [ 'v31.0', 1.24 ], [ 'v35.0', 0.85 ], [ 'v38.0', 0.6 ], [ 'v32.0', 0.55 ], [ 'v37.0', 0.38 ], [ 'v33.0', 0.19 ], [ 'v34.0', 0.14 ], [ 'v30.0', 0.14 ] ] }, 
  //           { name: 'Firefox', id: 'Firefox', data: [ [ 'v35', 2.76 ], [ 'v36', 2.32 ], [ 'v37', 2.31 ], [ 'v34', 1.27 ], [ 'v38', 1.02 ], [ 'v31', 0.33 ], [ 'v33', 0.22 ], [ 'v32', 0.15 ] ] }, 
  //           { name: 'Safari', id: 'Safari', data: [ [ 'v8.0', 2.56 ], [ 'v7.1', 0.77 ], [ 'v5.1', 0.42 ], [ 'v5.0', 0.3 ], [ 'v6.1', 0.29 ], [ 'v7.0', 0.26 ], [ 'v6.2', 0.17 ] ] }, 
  //           { name: 'Opera', id: 'Opera', data: [ [ 'v12.x', 0.34 ], [ 'v28', 0.24 ], [ 'v27', 0.17 ], [ 'v29', 0.16 ] ] }] } 
          };
// calendar 사이즈 조절
const customStyles = { control: base => ({ ...base, height: 26, minHeight: 26 }) };
// 요일 반환
const getDayName = (date) => { return date.toLocaleDateString('ko-KR', { weekday: 'long', }).substr(0, 1); }
// 날짜 비교시 년 월 일까지만 비교하게끔
const createDate = (date) => { return new Date(new Date(date.getFullYear() , date.getMonth() , date.getDate() , 0 , 0 , 0)); }

const hwDatas = [
{id:1, group:"CPU", cpu:"CPU Processor (%)"},{id:2, group:"CPU", cpu:"CPU User (%)"},{id:3, group:"CPU", cpu:"CPU Context Switch"},
{id:4, group:"CPU", cpu:"CPU Run Queue"}    ,{id:5, group:"CPU", cpu:"CPU Core"}    ,{id:6, group:"CPU", cpu:"Load Avg"},
{id:5, group:"Memory", memory:"Memory User (%)"},{id:6, group:"Memory", memory:"Memory Bytes (%)"},{id:7, group:"Memory", memory:"Memory Buffers Bytes"},
{id:8, group:"Memory", memory:"Memory Cached (%)"},{id:9, group:"Memory", memory:"Memory Cached Bytes"},{id:10, group:"Memory", memory:"Memory Shared (%)"},
{id:11, group:"Memory", memory:"Memory Shared Bytes"},{id:12, group:"Memory", memory:"Memory Swap (%)"},{id:13, group:"Memory", memory:"Memory Swap Bytes"},{id:14, group:"Memory", memory:"Memory Pagefault (%)"},
{id:15, group:"Disk", disk:"Disk Total Used (%)"},{id:16, group:"Disk", disk:"Disk Total Used Bytes"},{id:17, group:"Disk", disk:"Disk Used (%)"},
{id:18, group:"Disk", disk:"Disk Used Bytes"},{id:19, group:"Disk", disk:"Disk I/O (%)"},{id:20, group:"Disk", disk:"Disk I/O Count"},
{id:21, group:"Disk", disk:"Disk I/O Bytes"},{id:22, group:"Disk", disk:"Disk Queue"},
{id:23, group:"Network", network:"Network Traffic"},{id:24, group:"Network", network:"Network PPS"},{id:25, group:"Network", network:"NIC Discards"},
{id:26, group:"Network", network:"NIC Errors"}]

const oneMonth = new Date(new Date().getTime() - 34128000000 );

class ReportResoruce extends Component {
  constructor(props) {
    super(props);
    this.state = {
      processor:[],
      totalData:[],
      deviceDefaultColDef: {
        sortable:true,  
        resizable:true,  
        floatingFilter: true,
        filter:'agTextColumnFilter', 
        flex:1,
        maxWidth:210,
        cellStyle: {fontSize: '12px'}
      },
      deviceColumnDefs: [
        { headerName: '별칭', field:'nickname' ,headerCheckboxSelection: true, checkboxSelection:true },
        { headerName: '장비 명', field:'equipment' },
        { headerName: 'IP', field:'settingIp' },
        { headerName: 'GUID', field:'settingIp' },
      ],
      deviceData: [],
      hwDefaultColDef: {
        sortable:true,  
        resizable:true,  
        floatingFilter: true,
        filter:'agTextColumnFilter', 
        flex:1,
        maxWidth:830,
        // cellStyle: {fontSize: '12px'}
      },
      hwData: hwDatas,
      autoGroupColumnDef: {
        headerName: '항목',
        sortable:true,  
        field:'group',
        valueGetter: (params) => {
          if(params.data.cpu !== undefined) {
            return params.data.cpu
          } else if(params.data.memory !== undefined) {
            return params.data.memory
          } else if(params.data.disk !== undefined) {
            return params.data.disk
          } else if(params.data.network !== undefined) {
            return params.data.network
          }
       },
        cellRendererParams: {
          suppressCount: true,
          checkbox:true,
       },
      },
      hwColumnDefs:[{ field:'group', rowGroup: true, hide:true, } ],
      chartDefaultColDef: {
        sortable:true,  
        resizable:true,  
        floatingFilter: true,
        filter:'agTextColumnFilter', 
        flex:1,
        // cellStyle: {fontSize: '12px'}
      },
      chartColumnDefs:[{headerName:'시간' ,field:'generateTime',maxWidth:180},{headerName:'시간' ,field:'cpuProcessor',type: 'rightAligned'}],
      clickDeviceModel:false,
      clickHwModel:false,
      filterCheck:true,
      clickedId:0,
      clickedDeviceId:0,
      buttonIdsArray: ['보고서', '통계 엑셀 다운로드'],
      buttonIdsDeviceArray: ['장비','장비그룹','비즈니스','서비스','장비OS','제조사'],
      inputIdsChart:[{value:'line'},{value:'bar'}],
      inputIdsChartDefault:'line',
      inputIdsChartCheck:null,
      inputIdsChartType:null,
      inputMaxCheck:false,
      chartTotalBoxCheck:false,

      /* 달력 데이터  */
      calendarCheckSecond:false,
      calendarCheckFirst:false,
      date: oneMonth,
      firstDateFormat: Moment(oneMonth, "YYYY.MM.DD").format("YYYYMMDD"),
      firstTimeFormat: '00',
      secondDateFormat: Moment(oneMonth, "YYYY.MM.DD").format("YYYYMMDD"),
      secondTimeFormat: '23',

      /* 차트 */
      config : [],
      /* 조회 데이터  */
      graphCheck:true,
      deviceId: [],
      // deviceSelectData:
      hwName:[],
      deviceSearchName:[],
      hwSearchName:[],
      
    }
  }
  componentDidMount() {

  }

  groupCountRenderer = (params) => {
    console.log(params.value);
  }

  labelChange = (id) => {
    this.setState({ clickedId : id})
  }

  labelDeviceChange = (id) => {
    this.setState({clickedDeviceId: id})
  }
 /** 달력1 open */
 calendarFirst = (e) => {
  e.preventDefault();
  if(!this.state.calendarCheckFirst) {
   this.setState({calendarCheckFirst:true})
  } else if(this.state.calendarCheckFirst){
   this.setState({calendarCheckFirst:false})
  }
}
/** 달력2 open */
calendarSecond = (e) => {
 e.preventDefault();
 if(!this.state.calendarCheckSecond) {
   this.setState({calendarCheckSecond:true})
  } else if(this.state.calendarCheckSecond){
   this.setState({calendarCheckSecond:false})
  }
}

clickFilter = () => {
  const { filterCheck } = this.state;
  if(filterCheck) {
    this.setState({filterCheck:false})
  } else {
    this.setState({filterCheck:true})
  }
}
/* 자원 모델 open */
clickDeviceModelBtn = () => {
  AiwacsService.getEquipmentSnmp() 
    .then(res => {
      this.setState({deviceData:res.data,clickDeviceModel:true})
    })
}
/* 자원 모델 적용 */
clickDeviceModelSubmit = () => {
  const deviceNode = this.gridApis.getSelectedNodes();
  const deviceArray = [];
  const deviceName = [];
  console.log(deviceNode);
  if(this.gridApis.getSelectedNodes().length === 0) {
    alert("체크 박스를 선택해주세요");
  } else {
    deviceNode.forEach(node => {
      console.log(node);
      const obj = {};
      obj.value=node.data.equipment;
      obj.label=node.data.equipment;
      deviceName.push(obj)
      
      // test 이름 값도
      const objj= {};
      objj.id =node.data.id;
      objj.name = node.data.equipment;
      deviceArray.push(objj)
    })
    this.setState({deviceId:deviceArray, clickDeviceModel:false, deviceSearchName:deviceName})
  }
}
/* 하드웨어 모델 open */
clickHwModelBtn = () => {
  this.setState({clickHwModel:true})
}
/* 하드웨어 모델 적용 */
clickHwModelSubmit = () => {
  const hwNode = this.gridApi.getSelectedNodes();
  const groupName = [];
  const hwNodeName = [];
  
  console.log(this.gridApi.getSelectedNodes().length);
  if(this.gridApi.getSelectedNodes().length === 0) {
    alert("체크 박스를 선택해주세요");
  } else {
    hwNode.forEach(node => {
      const obj = {};
      // console.log(node);
      if(node.data.cpu !== undefined) {
        obj.label=node.data.group+" > "+node.data.cpu;
        obj.value=node.data.group+" > "+node.data.cpu;
        obj.id=node.data.id;
        obj.name=node.data.cpu;
      }  
      if(node.data.memory !== undefined) {
        obj.label=node.data.group+" > "+node.data.memory;
        obj.value=node.data.group+" > "+node.data.memory;
        obj.id=node.data.id;
        obj.name=node.data.memory;
      }  
      if(node.data.disk !== undefined) {
        obj.label=node.data.group+" > "+node.data.disk;
        obj.value=node.data.group+" > "+node.data.disk;
        obj.id=node.data.id;
        obj.name=node.data.disk;
      }  
      if(node.data.network !== undefined) {
        obj.label=node.data.group+" > "+node.data.network;
        obj.value=node.data.group+" > "+node.data.network;
        obj.id=node.data.id;
        obj.name=node.data.network;
      }
      console.log(obj);
      hwNodeName.push(obj);
      console.log(hwNodeName);

      groupName.push(node.data.group);
      // console.log(groupName);
      this.setState({hwName:groupName,clickHwModel:false, hwSearchName: hwNodeName })
    })
  }
}

/** 달력1 이벤트 */
calenderFirstChange = (date) => {
  this.setState({
    firstDateFormat:Moment(date, "YYYY.MM.DD").format("YYYYMMDD"), 
    calendarCheckFirst:false
  })
 }
 /** 달력2 이벤트 */
 calenderSecondChange = (date) => {
  this.setState({
    secondDateFormat:Moment(date, "YYYY.MM.DD").format("YYYYMMDD"), 
    calendarCheckSecond:false
  })
 }
 /** 통계 이벤트 */
 reportSelectSubmit = () => {
   const { firstDateFormat,firstTimeFormat, secondDateFormat,secondTimeFormat,hwName,deviceId, hwSearchName,deviceSearchName } = this.state;
   const startDate=firstDateFormat+firstTimeFormat+'0000';
   const endDate= secondDateFormat+secondTimeFormat+'5959';

   const sys=[];
   const sysNetwork=[];
   const sysMemoey=[];
   hwName.forEach(h => {
     console.log(h);
    if(h==='CPU' || h == 'Memory') {
      sys.push(1);
    } else { 
      sys.push(0);
    }
     
    if(h==='Network') {
      sysNetwork.push(1);
    } else { 
      sysNetwork.push(0);
    }

    if(h==='Disk') {
      sysMemoey.push(1);
    } else { 
      sysMemoey.push(0);
    }
   })

   const graphStartDate = Moment(firstDateFormat, "YYYY.MM.DD").format("YYYY-MM-DD");
   const graphEndDate = Moment(secondDateFormat, "YYYY.MM.DD").format("YYYY-MM-DD");
   const configArray = [];

   deviceId.forEach(d => {
    ReportService.getSysCpuDisk(d.id,sys[0],sysNetwork[0],sysMemoey[0],startDate,endDate)
    .then(res => {
      console.log(res.data)
      const data = res.data;
      const time = [];
      const cpuProcessor = [];
      const cpuUser = [];
      const cpuContextSwitch = [];
      const cpuRunQueue =[];
      const cpuLoadAvg=[];
      const graphHwName =[];
      const graphDeviceName =[];
      

      /* CPU,MEMOEY DISK NIC 분리 */
      data.forEach(d => {
        this.setState({totalData:d})
        d.forEach(c => {
          c.generateTime= c.generateTime.replace("T"," ");
          Moment(c.generateTime, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:00");
          time.push(Moment(c.generateTime, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:00"));

          if(c.cpuProcessor !== undefined) {
            cpuProcessor.push(c.cpuProcessor);
            cpuUser.push(c.cpuUser);
            cpuContextSwitch.push(c.cpuContextswitch); 
            cpuRunQueue.push(c.cpuIrq);
            cpuLoadAvg.push(c.cpuLoadavg);
          }
          if(c.ioQueueDepth !== undefined) {
            // disk
          }
          if(c.inBytesPerSec !== undefined) {
            // network
          }
        })
      })
      this.setState({ processor:cpuProcessor})
      /* 장비 이름 출력 */
      hwSearchName.forEach(h => {
        if(h.id === 1) { graphHwName.push(h.name); } if(h.id === 2) { graphHwName.push(h.name); } if(h.id === 3) { graphHwName.push(h.name); } 
        if(h.id === 4) { graphHwName.push(h.name); } if(h.id === 5) { graphHwName.push(h.name); } if(h.id === 6) { graphHwName.push(h.name); }
        if(h.id === 7) { graphHwName.push(h.name); } if(h.id === 8) { graphHwName.push(h.name); } if(h.id === 9) { graphHwName.push(h.name); }
        if(h.id === 10) { graphHwName.push(h.name); } if(h.id === 11) { graphHwName.push(h.name); } if(h.id === 12) { graphHwName.push(h.name); }
        if(h.id === 13) { graphHwName.push(h.name); } if(h.id === 14) { graphHwName.push(h.name); } if(h.id === 15) { graphHwName.push(h.name); }
        if(h.id === 16) { graphHwName.push(h.name); } if(h.id === 17) { graphHwName.push(h.name); } if(h.id === 18) { graphHwName.push(h.name); }
        if(h.id === 19) { graphHwName.push(h.name); } if(h.id === 20) { graphHwName.push(h.name); } if(h.id === 21) { graphHwName.push(h.name); }
        if(h.id === 22) { graphHwName.push(h.name); } if(h.id === 23) { graphHwName.push(h.name); } if(h.id === 24) { graphHwName.push(h.name); }
        if(h.id === 25) { graphHwName.push(h.name); } if(h.id === 26) { graphHwName.push(h.name); }
      })
      /* 하드웨어 이름 출력 */ // deviceId가 두번 돌아가게 되면 장비 이름은 조건문 없어도 됨
      deviceSearchName.forEach(d => {
        graphDeviceName.push(d.value)
      })
      /* 시간 간격 조절 */
      const timeInterval = [];
      if(time.length <= 24) { timeInterval.push(2)} 
      else if(time.length > 24 && time.length <= 48) { timeInterval.push(4) }
      else if(time.length > 48 && time.length <= 100) { timeInterval.push(8) } 
      else { timeInterval.push(100)}

      ReactHighcharts.Highcharts.setOptions({
        chart: { type:  'line', height:300, width:1400, },   
        xAxis: { categories: time, tickInterval:timeInterval[0] ,labels: {align:'center'}}, 
        yAxis: { title: { text: '' },min:0 ,max:100, tickInterval:20  }, 
        plotOptions: { line: { marker: { enabled: false } }},
        title: { text:null, margin:40, align:'left',style:{'fontSize':'12','fontWeight':'bold'}},
        legend: { labelFormat:null, align: 'right', verticalAlign: 'top', layout: 'vertical', x: 0, y: 100, },
      })

      if(graphHwName.includes("CPU Processor (%)")) {
        const array = [];
        hwSearchName.forEach(h => { if(h.id === 1) {  array.push(h.name); }})
        const obj= {};
        obj.series = [{data: cpuProcessor  }]
        obj.title={text : '<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+d.name+'' }
        obj.legend={ labelFormat : d.name} 
        configArray.push(obj);
      }
      if(graphHwName.includes("CPU User (%)")) {
        const array = [];
        hwSearchName.forEach(h => { if(h.id === 2) { array.push(h.name); }})
        const obj = {};
        obj.series = [{data: cpuUser}]
        obj.title= {text :'<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+d.name+''}
        obj.legend={ labelFormat : d.name}
        configArray.push(obj);
      }
      if(graphHwName.includes("CPU Context Switch")) {
        const array = [];
        hwSearchName.forEach(h => { if(h.id === 3) { array.push(h.name); }})
        const obj = {};
        obj.yAxis = { title: { text: '' },min:0 ,max:5000, tickInterval:1000 }
        obj.series = [{data: cpuContextSwitch}]
        obj.title= {text :'<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+d.name+''}
        obj.legend={ labelFormat : d.name}
        configArray.push(obj);
      }
      if(graphHwName.includes("CPU Run Queue")) {
        const array = [];
        hwSearchName.forEach(h => { if(h.id === 4) { array.push(h.name); }})
        const obj = {};
        obj.yAxis = { title: { text: '' },min:0 ,max:100, tickInterval:20 }
        obj.series = [{data: cpuRunQueue}]
        obj.title= {text :'<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+d.name+''}
        obj.legend={ labelFormat : d.name}
        configArray.push(obj);
      }
      if(graphHwName.includes("Load Avg")) {
        const array = [];
        hwSearchName.forEach(h => { if(h.id === 5) { array.push(h.name); }})
        const obj = {};
        obj.yAxis = { title: { text: '' },min:0 ,max:2, tickInterval:0.5 }
        obj.series = [{data: cpuLoadAvg}]
        obj.title= {text :'<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+d.name+''}
        obj.legend={ labelFormat : d.name}
        configArray.push(obj);
      }

      console.log(configArray);
      this.setState({
        graphCheck:true,
        config:configArray
      })
     
    })
   })
 }

 inputChartLineBar = (e,c,i) => {
   console.log(i);

   if(e.target.value === 'bar') {
    c.chart={type: 'column'};

    if(c.chart.type === 'column') {
      this.setState({inputIdsChartType: e.target.value, inputIdsChartCheck:i })
    } 
   } 

   else if(e.target.value === 'line') { 
    c.chart={type: 'line'};
    if(c.chart.type === 'line') {
      this.setState({inputIdsChartType: e.target.value , inputIdsChartCheck:i })
    }
   }
 }

 /* 최대치 기준 */
 maxStandred = (e,c) => {
   console.log(e.target.checked);
   console.log(c);
   this.setState({inputMaxCheck:e.target.checked})
 
  const { processor} =this.state;
  const max = Math.max.apply(null,processor);
  const min = Math.min.apply(null,processor);
  const maxStandred =  max / 10;
  const minStandred = min / 5;
  c.yAxis={min:min , max:max, tickInterval:20}
 }


  render() {
    const { buttonIdsArray,clickedId,calendarCheckFirst,calendarCheckSecond,date,firstDateFormat,secondDateFormat,firstTimeFormat,secondTimeFormat,filterCheck,
      config,clickHwModel,hwColumnDefs,hwData,hwDefaultColDef,clickDeviceModel,deviceColumnDefs,deviceData,deviceDefaultColDef,buttonIdsDeviceArray,clickedDeviceId,
      autoGroupColumnDef,deviceSearchName,hwSearchName,graphCheck,inputIdsChart,inputIdsChartDefault,inputIdsChartCheck,inputIdsChartType,inputMaxCheck,chartTotalBoxCheck,
      chartColumnDefs,totalData,chartDefaultColDef } =this.state;
      
    const firstDateFormatInput = Moment(firstDateFormat, "YYYY.MM.DD").format("YYYY-MM-DD");
    const secondDateFormatInput = Moment(secondDateFormat, "YYYY.MM.DD").format("YYYY-MM-DD");

    console.log(inputIdsChartCheck);
    
    return (
      <>
      <div className="reportResourceContainer" > 
       <div className="reportHighTitleArea">
        { 
          buttonIdsArray.map((b,i) => (
            <button key={i} className={i === clickedId ? "reportHighButtonAction" : "reportHighButton"} onClick={() => this.labelChange(i)} >
              <label className={i === clickedId ? "reportHighLabelAction" : "reportHighLabel"} >
                {b}
              </label>
            </button>
          ))
        }
       </div>

        {
          filterCheck ? (
            <div className="reportFilterArea">
            <div className="reportFilterBox">
                <div className="reportFilterFirstDiv">
                  <div className="reportFilterLeftBox">
                    <label className="reportFilterLeftText">자원</label>
                  </div>
                  <div className="reportFilterRightBox">
                    <div className="reportFilterRightBoxSecond">
                      <button className="reportFilterSearch" onClick={()=> this.clickHwModelBtn()} >
                        선택
                        <img src={Search} style={{width:20, padding:1}} />
                      </button>
                      <div className="reportFilterScroll">
                        <Select 
                          value={hwSearchName}
                          className="reportFilterSelect" 
                          isDisabled={true} 
                          isMulti
                          name="colors"
                          components={{
                            DropdownIndicator: () => null,
                            IndicatorSeparator: () => null
                          }}
                          styles={customStyles}
                          placeholder="검색"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {
                  clickHwModel && (
                    <>
                    <Modal show={clickHwModel} onHide={()=>this.setState({clickHwModel:false})} dialogClassName="userModel" className="reportModelHw"  >
                    <Modal.Header  className="header-Area">
                    <Modal.Title id="contained-modal-title-vcenter" className="header_Text">
                      자원
                    </Modal.Title>
                    </Modal.Header>
                        <Modal.Body>
                              <div className="ag-theme-alpine" style={{ width:'43vw', height:'60vh'}}>
                                  <AgGridReact
                                    headerHeight='30'
                                    floatingFiltersHeight='27'
                                    rowHeight='30'
                                    rowData={hwData} 
                                    columnDefs={hwColumnDefs} 
                                    defaultColDef={hwDefaultColDef}
                                    rowSelection='multiple'
                                    autoGroupColumnDef={autoGroupColumnDef}
                                    groupSelectsChildren={true}
                                    onGridReady={params => {this.gridApi = params.api; }} 
                                  />        
                              </div>
                      </Modal.Body>

                      <Form.Group className="reportHwFooter">
                          <Button onClick={()=> this.clickHwModelSubmit()} className="reportActiveBtn"  >적용</Button>
                          <Button onClick={()=> this.setState({clickHwModel:false})} className="reporthideBtn"  >닫기</Button>
                      </Form.Group>
                      </Modal>
                    </>
                  )
                }
                <div className="reportFilterFirstDiv">
                  <div className="reportFilterLeftBox">
                    <label className="reportFilterLeftText">장비</label>
                  </div>
                  <div className="reportFilterRightBox">
                    <div className="reportFilterRightBoxSecond">
                      <button className="reportFilterSearch" onClick={()=> this.clickDeviceModelBtn()} >
                        선택
                        <img src={Search} style={{width:20, padding:1}} />
                      </button>
                      <div className="reportFilterScroll">
                        <Select 
                          value={deviceSearchName}
                          className="reportFilterSelect" 
                          isDisabled={true} 
                          isMulti
                          name="colors"
                          components={{
                            DropdownIndicator: () => null,
                            IndicatorSeparator: () => null
                          }}
                          styles={customStyles}
                          placeholder="검색"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {
                  clickDeviceModel && (
                    <>
                    <Modal show={clickDeviceModel} onHide={()=>this.setState({clickDeviceModel:false})} dialogClassName="userModel" className="reportModelHw"  >
                    <Modal.Header  className="header-Area">
                      
                    <Modal.Title id="contained-modal-title-vcenter" className="header_Text">
                      장비
                    </Modal.Title>
                    
                    </Modal.Header>
                        <Modal.Body>
                              <div className="ag-theme-alpine" style={{ width:'43vw', height:'40vh'}}>
                                {/* <button>아아</button> */}
                                <div className="reportDeviceBar">
                                  { 
                                    buttonIdsDeviceArray.map((b,i) => (
                                      <button key={i} className={i === clickedDeviceId ? "reportModelDeviceAction" : "reportModelDevice"} onClick={() => this.labelDeviceChange(i)} >
                                        <label className={i === clickedDeviceId ? "reportModelDeviceLabelAction" : "reportModelDeviceLabel"} >
                                          {b}
                                        </label>
                                      </button>
                                    ))
                                  }
                                </div>
                                  <AgGridReact
                                    headerHeight='30'
                                    floatingFiltersHeight='27'
                                    rowHeight='30'
                                    rowData={deviceData} 
                                    columnDefs={deviceColumnDefs} 
                                    defaultColDef={deviceDefaultColDef}
                                    rowSelection='multiple'
                                    onGridReady={params => {this.gridApis = params.api; 
                                      this.gridApis.forEachLeafNode( (node) => {
                                      // searchName.forEach(s => {
                                      //   if (node.data.id === s.id) {
                                      //     node.setSelected(true);
                                      // }
                                      // })
                                      
                                  });}} 
                                  />        
                              </div>
                      </Modal.Body>

                      <Form.Group className="reportDeviceFooter">
                          <Button onClick={()=> this.clickDeviceModelSubmit()} className="reportActiveBtn"  >적용</Button>
                          <Button onClick={()=> this.setState({clickDeviceModel:false})} className="reporthideBtn"  >닫기</Button>
                      </Form.Group>
                      </Modal>
                    </>
                  )
                }
                <div className="reportFilterFirstDivThird">
                  <div className="reportFilterLeftBox">
                    <label className="reportFilterLeftText">날짜</label>
                  </div>
                  <div className="reportFilterRightBoxThird">
                    <div className="reportCalendarYear">
                       <input className="reportCalendarInput" type="text" value={firstDateFormatInput} disabled readonly />
                       <button className="reportCalendarIcon" onClick={(e)=> this.calendarFirst(e)} >
                        <FcCalendar className="reportCalendarIconStyle"  size="20" />
                      </button>
                      {
                          calendarCheckFirst && (
                            <DatePicker
                            locale={ko}
                            selected={date}
                            dateFormat="yyyy-mm-dd"
                            onChange={date => this.calenderFirstChange(date)} 
                            inline 
                            dayClassName={date => getDayName(createDate(date)) === '토' ? "saturday" : getDayName(createDate(date)) === '일' ? "sunday" : undefined }
                            closeOnScroll={true}
                            />
                          )
                      }
                    </div>
    
                    <select 
                      className="reportCalendarTimeArea" 
                      placeholder="년월일 입력" 
                      defaultValue={firstTimeFormat} 
                      value={firstTimeFormat} 
                      onChange={e => this.setState({firstTimeFormat:e.target.value})}  
                    >
                      {time.map(t => 
                        <option value={t.value} selected={t.value} >{t.value}</option>
                        ) }
                    </select>
                    <p className="reportCalendarDateMiddle">~</p>
                    <div className="reportCalendarYear">
                       <input className="reportCalendarInput" type="text" value={secondDateFormatInput} disabled readonly />
                       <button className="reportCalendarIcon"  onClick={(e)=> this.calendarSecond(e)} >
                        <FcCalendar className="reportCalendarIconStyle"  size="20" />
                      </button>
                      {
                          calendarCheckSecond && (
                            <DatePicker
                            locale={ko}
                            selected={date}
                            dateFormat="yyyy-mm-dd"
                            // minDate={new Date()}
                            onChange={date => this.calenderSecondChange(date)} 
                            inline 
                            dayClassName={date => getDayName(createDate(date)) === '토' ? "saturday" : getDayName(createDate(date)) === '일' ? "sunday" : undefined }
                            closeOnScroll={true}
                            />
                          )
                      }
                    </div>
    
                    <select 
                      className="reportCalendarTimeArea" 
                      placeholder="년월일 입력" 
                      defaultValue={secondTimeFormat} 
                      value={secondTimeFormat} 
                      onChange={e => this.setState({secondTimeFormat:e.target.value})}  
                    >
                      {time.map(t => 
                        <option value={t.value} selected={t.value} >{t.value}</option>
                        ) }
                    </select>
                  </div>
                </div>
    
                <div className="reportFilterSelectBox">
                  <Button className="reportFilterSelectBtn" onClick={()=> this.reportSelectSubmit()}>통계하기</Button>
                  <Button className="reportFilterReloadBtn" onClick={()=> this.reload()}>초기화</Button>
                </div>
            </div>
           </div>
          ) : (
            null
          )
        }
      

       <div className="reportFilterButtonBox">
          <button type="button" className="input-group-addon reportFilterButtonBtn" onClick={()=> this.clickFilter()}>
            <label className="reportFilterLabel">
             ▲ Filter
            </label>
          </button>
        </div>

        {/* <div className="reportOutputBox">
          <Button className="reportOutputButton">PDF</Button>
          <Button className="reportOutputButton">Excel-자원 개별</Button>
          <Button className="reportOutputButton">Excel-자원 통합</Button>
        </div> */}

        {
          graphCheck && (
            <>
                  {
                    config.map((c,i) => (
                      <>
                      <div className="reportChartParent">
                      <div className="reportChartArea">
                        <div className="reportChartBox">
                      <ReactHighcharts config={c} />
                      <div className="reportChartMaxSelect">
                        {
                          inputIdsChartCheck !== i  ?  (
                            <>
                            <select 
                              className="reportChartSelect"
                              defaultValue={inputIdsChartDefault}
                              value={inputIdsChartDefault}
                              onChange={e => this.inputChartLineBar(e,c,i)}
                              >
                              {
                                inputIdsChart.map(i => (
                                  <option value={i.value} selected={i.value}>{i.value}</option>
                                ))
                              }
                            </select>
                            </>
                          ) : (
                            <>
                            <select 
                              className="reportChartSelect"
                              defaultValue={inputIdsChartType}
                              value={inputIdsChartType}
                              onChange={e => this.inputChartLineBar(e,c,i)}
                              >
                              {
                                inputIdsChart.map(i => (
                                  <option value={i.value} selected={i.value}>{i.value}</option>
                                ))
                              }
                            </select>
                            </>
                          )
                        }
                        <label className="reportChartLabel">최대치 기준</label>
                        <input type="checkbox" checked={inputMaxCheck} onChange={(e)=> this.maxStandred(e,c)} className="reportChartInput" />
                      </div>
                      </div>

                      <div className="reportChartTotalArea">
                      <button className="reportChartTotalBox" onClick={() => this.setState({chartTotalBoxCheck: true})}>
                        <label className="reportChartTotalText">
                          ▼ 차트 통계
                        </label>
                      </button>

                      <div className="reportChartTotalGrid">
                         <div className="ag-theme-alpine" style={{ width:'90vw', height:'40vh',marginLeft:'0.5vw'}}>
                            <AgGridReact
                            headerHeight='30'
                            floatingFiltersHeight='23'
                            rowHeight='25'
                            columnDefs={chartColumnDefs}  
                            defaultColDef={chartDefaultColDef}
                            rowData={totalData}
                            onGridReady={params => { this.gridApis = params.api;}}
                          />       
                         </div>
                       </div>
                      </div>
                    </div>
                  </div>
                  
                      </>
                    ))
                  }
            <div className="reportFooter"></div>
            </>
          )
        }
        
      </div>

      
      </>
    );
  }
}



export default ReportResoruce;