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
      clickDeviceModel:false,
      clickHwModel:false,
      filterCheck:true,
      clickedId:0,
      clickedDeviceId:0,
      buttonIdsArray: ['보고서', '통계 엑셀 다운로드'],
      buttonIdsDeviceArray: ['장비','장비그룹','비즈니스','서비스','장비OS','제조사'],

      /* 달력 데이터  */
      calendarCheckSecond:false,
      calendarCheckFirst:false,
      date: oneMonth,
      firstDateFormat: Moment(oneMonth, "YYYY.MM.DD").format("YYYYMMDD"),
      firstTimeFormat: '00',
      secondDateFormat: Moment(oneMonth, "YYYY.MM.DD").format("YYYYMMDD"),
      secondTimeFormat: '23',

      config : [],
      text:'아아',
      /* 조회 데이터  */
      graphCheck:false,
      deviceId: [],
      // deviceSelectData:
      hwName:[],
      deviceSearchName:[],
      hwSearchName:[],
      
    }
  }
  componentDidMount() {
    const { config } = this.state;

    // this.setState({
    //   config:{ 
    //     chart: { type: 'line', height:300, width:1500 },   
    //     title: { text: '<span style="font-weight: bold; font-size:18px; margin-top:3px">CPU Processor (%) </span> / 2021-11-10~2021-11-10, DESKTOP-26LI6N0(10.10.80.106)', 
    //               align:'left',style:{'fontSize':'12','fontWeight':'bold'}, margin:40}, 
    //     xAxis: { type: 'category',}, 
    //     yAxis: { title: { text: '' },min:0 ,max:100, tickInterval:20  }, 
    //     legend: {
    //       align: 'right',
    //       verticalAlign: 'top',
    //       layout: 'vertical',
    //       x: 0,
    //       y: 100,
    //       labelFormat: this.state.text,
    //       // enabled: false 
    //   },
    //     series: [{ 
    //        data: [{ name: '2021-11-10 00:00', y: 99.33, drilldown: '2021-11-10 00:00' }, 
    //               { name: '2021-11-10 01:00', y: 24.03, drilldown: '2021-11-10 01:00' }, 
    //               { name: '2021-11-10 02:00', y: 10.38, drilldown: '2021-11-10 02:00' }, 
    //               { name: '2021-11-10 03:00', y: 4.77,  drilldown: '2021-11-10 03:00' }, 
    //               { name: '2021-11-10 04:00', y: 0.91, drilldown: '2021-11-10 04:00' }, 
    //               { name: '2021-11-10 05 :00', y: 0.2, drilldown: '2021-11-10 05:00' }, 
    //               { name: '2021-11-10 06 :00', y: 64.2, drilldown: '2021-11-10 06:00' }, 
    //               { name: '2021-11-10 07 :00', y: 23.2, drilldown: '2021-11-10 07:00' }, 
    //               { name: '2021-11-10 08 :00', y: 64.2, drilldown: '2021-11-10 08:00' }, 
    //               { name: '2021-11-10 13 :00', y: 99.2, drilldown: '2021-11-10 13:00' }, 
    //               { name: '2021-11-10 15 :00', y: 1.2, drilldown: '2021-11-10 15:00' }, 
    //               { name: '2021-11-10 20 :00', y: 2.2, drilldown: '2021-11-10 20:00' }, 
      
    //             ]}],         },
    // })

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
      deviceArray.push(node.data.id)
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
      // console.log(node.data);
      const obj = {};
      console.log(node.data.group);
      if(node.data.cpu !== undefined) {
        obj.label=node.data.group+" > "+node.data.cpu;
        obj.value=node.data.group+" > "+node.data.cpu;
        obj.name=node.data.cpu;
      }  
      if(node.data.memory !== undefined) {
        obj.label=node.data.group+" > "+node.data.memory;
        obj.value=node.data.group+" > "+node.data.memory;
        obj.name=node.data.memory;
      }  
      if(node.data.disk !== undefined) {
        obj.label=node.data.group+" > "+node.data.disk;
        obj.value=node.data.group+" > "+node.data.disk;
        obj.name=node.data.disk;
      }  
      if(node.data.network !== undefined) {
        obj.label=node.data.group+" > "+node.data.network;
        obj.value=node.data.group+" > "+node.data.network;
        obj.name=node.data.network;
      }
      hwNodeName.push(obj);
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
   console.log(hwName);
   hwName.forEach(h => {
     if(h==='CPU' || h == 'Disk') {
       console.log(1);
     }
    if(h==='Network') {
      console.log(3);
    }
    if(h==='Memory') {
      console.log(4);
    }
   })
   if(hwName === 'CPU') {
     console.log(1);
   } 
   if(hwName === 'DISK') {
     console.log(2);
   }
   console.log(startDate);
   console.log(endDate);
   console.log(deviceId);

   const graphStartDate = Moment(firstDateFormat, "YYYY.MM.DD").format("YYYY-MM-DD");
   const graphEndDate = Moment(secondDateFormat, "YYYY.MM.DD").format("YYYY-MM-DD");

  

   ReportService.getSysCpuDisk(deviceId,startDate,endDate)
    .then(res => {
      console.log(res.data)
      const data = res.data;
      const time = [];
      const cpuProcessor = [];
      const graphHwName =[];
      const graphDeviceName =[];
      const cpuUser = [];
      data.forEach(d => {
        d.generateTime= d.generateTime.replace("T"," ");
        Moment(d.generateTime, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:00");
        time.push(Moment(d.generateTime, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:00"));
        cpuProcessor.push(d.cpuProcessor);
        cpuUser.push(d.cpuUser);
      })
      hwSearchName.forEach(h => {
        if(h.name.includes("CPU Processor (%)")) {
          graphHwName.push(h.name);
        }
        if(h.name.includes("CPU User (%)")) {
          graphHwName.push(h.name);
        }
      })
      deviceSearchName.forEach(d => {
        graphDeviceName.push(d.value)
      })
      console.log(time);
      console.log(cpuProcessor);
      console.log(graphHwName);
      console.log(graphDeviceName);

      const test = [];

      const config = {
        chart: { type: 'line', height:300, width:1500 },   
        xAxis: { categories: time, tickInterval:2 }, 
        yAxis: { title: { text: '' },min:0 ,max:100, tickInterval:20  }, 
        plotOptions: { line: { marker: { enabled: false } }},
        title: { margin:40, align:'left',style:{'fontSize':'12','fontWeight':'bold'}},
        legend: { align: 'right', verticalAlign: 'top', layout: 'vertical', x: 0, y: 100, },
        series:[{data: null}],
       

        // title: { text: '<span style="font-weight: bold; font-size:18px; margin-top:3px">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+graphDeviceName+'',}, 
        // legend: { labelFormat: graphDeviceName, },
        // series: [{ data: cpuProcessor }], 
    };
    // test.push(config);
      
      if(graphHwName.includes("CPU Processor (%)")) {
        const array = [];
        hwSearchName.forEach(h => {
          if(h.name.includes("CPU Processor (%)")) {
            array.push(h.name);
          }
        })
        // const config = { 
        //   chart: { type: 'line', height:300, width:1500 },   
        //   title: { text: '<span style="font-weight: bold; font-size:18px; margin-top:3px">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+graphDeviceName+'', 
        //             align:'left',style:{'fontSize':'12','fontWeight':'bold'}, margin:40}, 
        //   xAxis: { categories: time, tickInterval:2 }, 
        //   yAxis: { title: { text: '' },min:0 ,max:100, tickInterval:20  }, 
        //   plotOptions: { line: { marker: { enabled: false } }},
        //   legend: { align: 'right', verticalAlign: 'top', layout: 'vertical', x: 0, y: 100, labelFormat: graphDeviceName, },
        //   series: [{ data: cpuProcessor }], 
        // }

        
        
        // var title = {};
        // title.text = '';
        // title.generateTime
        // config.title = title;
        config.series.data = cpuProcessor;
        test.push(config);

        
      }
      
      if(graphHwName.includes("CPU User (%)")) {
        const array = [];
        hwSearchName.forEach(h => {
          if(h.name.includes("CPU User (%)")) {
            array.push(h.name);
          }
        })
        const config = { 
          chart: { type: 'line', height:300, width:1500 },   
          title: { text: '<span style="font-weight: bold; font-size:18px; margin-top:3px">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+graphDeviceName+'', 
                    align:'left',style:{'fontSize':'12','fontWeight':'bold'}, margin:40}, 
          xAxis: { categories: time, tickInterval:2 }, 
          yAxis: { title: { text: '' },min:0 ,max:100, tickInterval:20  }, 
          plotOptions: { line: { marker: { enabled: false } }},
          legend: { align: 'right', verticalAlign: 'top', layout: 'vertical', x: 0, y: 100, labelFormat: graphDeviceName, },
          series: [{ data: cpuUser }], 
        }
        test.push(config);
      }
      console.log(test);
      this.setState({
        graphCheck:true,
        config:test
      })
     
    })

    
 }


  render() {
    const { buttonIdsArray,clickedId,calendarCheckFirst,calendarCheckSecond,date,firstDateFormat,secondDateFormat,firstTimeFormat,secondTimeFormat,filterCheck,
      config,clickHwModel,hwColumnDefs,hwData,hwDefaultColDef,clickDeviceModel,deviceColumnDefs,deviceData,deviceDefaultColDef,buttonIdsDeviceArray,clickedDeviceId,
      autoGroupColumnDef,deviceSearchName,hwSearchName,graphCheck } =this.state;


    const firstDateFormatInput = Moment(firstDateFormat, "YYYY.MM.DD").format("YYYY-MM-DD");
    const secondDateFormatInput = Moment(secondDateFormat, "YYYY.MM.DD").format("YYYY-MM-DD");
    // console.log(firstDateFormat);
    // console.log(secondDateFormat);
    console.log(firstTimeFormat)
    
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
                                    onGridReady={params => {this.gridApi = params.api; 
                                      this.gridApi.forEachLeafNode( (node) => {
                                      // searchName.forEach(s => {
                                      //   if (node.data.id === s.id) {
                                      //     node.setSelected(true);
                                      // }
                                      // })
                                  });}} 
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

        <div className="reportOutputBox">
          <Button className="reportOutputButton">PDF</Button>
          <Button className="reportOutputButton">Excel-자원 개별</Button>
          <Button className="reportOutputButton">Excel-자원 통합</Button>
        </div>

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
                        <select className="reportChartSelect">
                          <option>Line</option>
                          <option>Bar</option>
                        </select>
                        <label className="reportChartLabel">최대치 기준</label>
                        <input type="checkbox" className="reportChartInput" />
                      </div>
                      </div>
                      <button className="reportChartTotalBox">
                        <label className="reportChartTotalText">
                          ▼ 차트 통계
                        </label>
                      </button>
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