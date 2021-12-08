import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import Select from "react-select";
import AiwacsService from '../../services/equipment.service';
import ReportService from '../../services/report.service';
import ChartComponent from './ChartComponent';

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
import Highcharts from "highcharts";
import Drilldown from 'highcharts-drilldown'; 
import {  AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import "ag-grid-enterprise";
import '../../css/reportResource.css'

import _ from "lodash";

const time = [{value:'00'},{value:'01'},{value:'02'},{value:'03'},{value:'04'},{value:'05'},{value:'06'},{value:'07'},{value:'08'},{value:'09'},{value:'10'},{value:'11'},{value:'12'}
,{value:'13'},{value:'14'},{value:'15'},{value:'16'},{value:'17'},{value:'18'},{value:'19'},{value:'20'},{value:'21'},{value:'22'},{value:'23'}]

// calendar 사이즈 조절
const customStyles = { control: base => ({ ...base, height: 26, minHeight: 26 }) };
// 요일 반환
const getDayName = (date) => { return date.toLocaleDateString('ko-KR', { weekday: 'long', }).substr(0, 1); }
// 날짜 비교시 년 월 일까지만 비교하게끔
const createDate = (date) => { return new Date(new Date(date.getFullYear() , date.getMonth() , date.getDate() , 0 , 0 , 0)); }

const hwDatas = [
{id:1, group:"CPU", cpu:"CPU Processor (%)"},{id:2, group:"CPU", cpu:"CPU Used (%)"},{id:3, group:"CPU", cpu:"CPU Context Switch"},
{id:4, group:"CPU", cpu:"CPU Run Queue"}    ,{id:5, group:"CPU", cpu:"CPU Core"}    ,{id:6, group:"CPU", cpu:"Load Avg"},

{id:7, group:"Memory", memory:"Memory Used (%)"},{id:8, group:"Memory", memory:"Memory Bytes"},{id:9, group:"Memory", memory:"Memory Buffers (%)"},
{id:10, group:"Memory", memory:"Memory Buffers Bytes"},{id:11, group:"Memory", memory:"Memory Cached (%)"},{id:12, group:"Memory", memory:"Memory Cached Bytes"},
{id:13, group:"Memory", memory:"Memory Shared (%)"},{id:14, group:"Memory", memory:"Memory Shared Bytes"},{id:15, group:"Memory", memory:"Memory Swap (%)"},
{id:16, group:"Memory", memory:"Memory Swap Bytes"},{id:17, group:"Memory", memory:"Memory Pagefault (%)"},

{id:18, group:"Disk", disk:"Disk Total Used (%)"},{id:19, group:"Disk", disk:"Disk Total Used Bytes"},{id:20, group:"Disk", disk:"Disk Used (%)"},
{id:21, group:"Disk", disk:"Disk Used Bytes"},{id:22, group:"Disk", disk:"Disk I/O (%)"},{id:23, group:"Disk", disk:"Disk I/O Count"},
{id:24, group:"Disk", disk:"Disk I/O Bytes"},{id:25, group:"Disk", disk:"Disk Queue"},

{id:26, group:"Network", network:"Network Traffic"},{id:27, group:"Network", network:"Network PPS"},
{id:28, group:"Network", network:"NIC Discards"},{id:29, group:"Network", network:"NIC Errors"} ]

// 하루 초 86400 000
const oneMonth = new Date(new Date().getTime() - 34992000000 );


const seriesGrid = [];
const seriesColumn = [];
class ReportResoruce extends PureComponent {
  constructor(props) {
    super(props);
    this.imageRef = React.createRef();
    this.state = {
      loader:false,
      
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
      },
      chartColumnDefs:[],
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
      timeChart:[],
      totalKey:[],
      unitCheck:false,
      totalName:[],
      selectTotalCheck: false,
      partitionLabel:null,

      /* 조회 데이터  */
      graphCheck:true,
      deviceId: [],
      hwName:[],
      deviceSearchName:[],
      hwSearchName:[],
      testt:{value:"아아"}
      
    }
  }
  // componentDidMount() {

  // }

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
      
      // id 추가 
      const objSec= {};
      objSec.id =node.data.id;
      objSec.name = node.data.equipment;
      deviceArray.push(objSec)
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
      hwNodeName.push(obj);
      groupName.push(node.data.group);
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
 /** 차트 이벤트 */
 reportSelectSubmit = () => {
   this.setState({loader:true})
   const { firstDateFormat,firstTimeFormat, secondDateFormat,secondTimeFormat,hwName,deviceId, hwSearchName,deviceSearchName } = this.state;
   const configArray = [];
   const startDate=firstDateFormat+firstTimeFormat+'0000';
   const endDate= secondDateFormat+secondTimeFormat+'5959';
   const graphStartDate = Moment(firstDateFormat, "YYYY.MM.DD").format("YYYY-MM-DD");
   const graphEndDate = Moment(secondDateFormat, "YYYY.MM.DD").format("YYYY-MM-DD");

   const sys=[];
   const sysNetwork=[];
   const sysMemoey=[];
   const id = [];
   const deviceName = [];
   hwName.forEach(h => {
    if(h.includes("CPU") || h.includes("Memory")) {
      sys.push(1);
    } 
    if(sys.length === 0) {
      sys.push(0)
    }
    if(h.includes("Network")) {
      sysNetwork.push(1);
    } 
    if(h.includes("Disk")) {
      sysMemoey.push(1);
    } 
   })
   if(sys.length === 0) { sys.push(0) }
   if(sysNetwork.length === 0) { sysNetwork.push(0) }
   if(sysMemoey.length === 0) { sysMemoey.push(0) }

   deviceId.forEach(d => {
      id.push(d.id)
      deviceName.push(d.name)
   })
   const ids = id.join('|');

    ReportService.getSysCpuDisk(ids,sys[0],sysNetwork[0],sysMemoey[0],startDate,endDate)
    .then(res => {
      console.log(res.data)
      const data = res.data;
      const graphHwName =[];
      const graphDeviceName =[];
      const time = [];
      const cpuProcessor = [];
      const cpuUser = [];
      const cpuContextSwitch = [];
      const cpuRunQueue =[];
      const cpuLoadAvg=[];
      const memoryUsedPercentage=[];
      const memoryBytes=[];
      const memoryBuffersPercentage=[];
      const memoryBuffers=[];
      const memoryCached =[];
      const memoryCachedPercentage=[];
      const memoryShared =[];
      const memorySharedPercentage=[];
      const memorySwapPercentage=[];
      const memorySwap=[];
      const memoryPagefault=[];
      const diskTotalUsedPercentage =[];
      const diskTotalUsedBytes =[];
      const diskUsedPercentage =[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
      const diskUsedBytes =[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
      const diskIoPercentage =[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
      const diskIoCount =[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
      const diskIoBytes =[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
      const diskQueue =[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
      const networkTraffic = [{ in:[], out:[] }];
      const networkPps = [{ in:[], out:[] }];
      const nicDiscards = [{ in:[], out:[] }];
      const nicErrors = [{ in:[], out:[] }];
      const partitionLabel = [];

      for(var i=0; i < id.length; i++) {
      /* 초기화 */
       time.length=0;
       cpuProcessor.length=0;  cpuUser.length=0;  cpuContextSwitch.length=0; cpuRunQueue.length=0;  cpuLoadAvg.length=0;
       memoryUsedPercentage.length=0;  memoryBytes.length=0;  memoryBuffersPercentage.length=0; memoryBuffers.length=0;  memoryCached.length=0; memoryCachedPercentage.length=0;  
       memoryShared.length=0;  memorySharedPercentage.length=0; memorySwapPercentage.length=0;  memorySwap.length=0; memoryPagefault.length=0; 
       diskTotalUsedPercentage.length=0;  diskTotalUsedBytes.length=0; 
       for(var m=0; m < partitionLabel.length; m++) {
        diskUsedPercentage[m].length=0; diskUsedBytes[m].length=0; diskIoPercentage[m].length=0;  
        diskIoCount[m].length=0; diskIoBytes[m].length=0; diskQueue[m].length=0;  
       }
       networkTraffic[0].in.length=0; networkPps[0].in.length=0; nicDiscards[0].in.length=0;  nicErrors[0].in.length=0; 
       networkTraffic[0].out.length=0; networkPps[0].out.length=0; nicDiscards[0].out.length=0;  nicErrors[0].out.length=0; 

       /* 데이터 세분화 */
       data.forEach(d => {
        d.forEach(c => {
          if(c.cpuProcessor !== undefined && id[i] === c.deviceId) {  // CPU MEMORY
            cpuProcessor.push(c.cpuProcessor); cpuUser.push(c.cpuUser); cpuContextSwitch.push(c.cpuContextswitch);  cpuRunQueue.push(c.cpuIrq); cpuLoadAvg.push(c.cpuLoadavg);
            memoryUsedPercentage.push(c.usedMemoryPercentage); memoryBytes.push(c.usedMemory);  memoryBuffersPercentage.push(c.memoryBuffersPercentage); 
            memoryBuffers.push(c.memoryBuffers); memoryCached.push(c.memoryCached); memoryCachedPercentage.push(c.memoryCachedPercentage); 
            memoryShared.push(c.memoryShared); memorySharedPercentage.push(c.memorySharedPercentage); memorySwapPercentage.push(c.usedSwapPercentage);
            memorySwap.push(c.usedSwap); memoryPagefault.push(c.usedSwapPercentage); 
          }
          if(c.ioQueueDepth !== undefined && id[i] === c.deviceId  ) {  // DISK
            if(!partitionLabel.includes(c.partitionLabel) ) {
              partitionLabel.push(c.partitionLabel)
            }
            
            for(var x=0; x<partitionLabel.length; x++) { // 파티션 길이만큼 데이터가 저장 됨
              if(partitionLabel[x] === c.partitionLabel) {
                diskUsedPercentage[x].push(c.usedPercentage); diskUsedBytes[x].push(c.usedBytes); diskIoPercentage[x].push(c.ioTimePercentage);
                diskIoCount[x].push(c.ioTotalCnt); diskIoBytes[x].push(c.ioTotalBps); diskQueue[x].push(c.ioQueueDepth)
              }
            }
          }
          if(c.ioTotalBps === undefined && id[i] === c.deviceId && c.usedPercentage !== undefined) {  // DISK TOTAL
            diskTotalUsedPercentage.push(c.usedPercentage); diskTotalUsedBytes.push(c.usedBytes); 
          }
          if(c.inBytesPerSec !== undefined && id[i] === c.deviceId) { // NETWORK  
            nicDiscards[0].in.push(c.inDiscardPkts); nicDiscards[0].out.push(c.outDiscardPkts);
            nicErrors[0].in.push(c.inErrorPkts); nicErrors[0].out.push(c.outErrorPkts);
            networkTraffic[0].in.push(c.inBytesPerSec); networkTraffic[0].out.push(c.outBytesPerSec);
            networkPps[0].in.push(c.inPktsPerSec); networkPps[0].out.push(c.outPktsPerSec);
          }

          /* 각 데이터마다 시간 조절 */
          if(c.cpuProcessor !== undefined && id[i] === c.deviceId) {
            c.generateTime= c.generateTime.replace("T"," ");
            Moment(c.generateTime, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:00");
            time.push(Moment(c.generateTime, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:00"));
          } else if(c.inBytesPerSec !== undefined && id[i] === c.deviceId && memoryUsedPercentage.length === 0 ) {
            c.generateTime= c.generateTime.replace("T"," ");
            Moment(c.generateTime, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:00");
            time.push(Moment(c.generateTime, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:00"));
          } else if(c.totalBytes === undefined && id[i] === c.deviceId && nicDiscards[0].in.length === 0) {
            c.generateTime= c.generateTime.replace("T"," ");
            Moment(c.generateTime, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:00");
            time.push(Moment(c.generateTime, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:00"));
          } 
        })
      })

      this.setState({ partitionLabel : partitionLabel})
      /* 장비 이름 출력 */
      hwSearchName.forEach(h => {
        if(h.id === 1)  { graphHwName.push(h.name); } if(h.id === 2)  { graphHwName.push(h.name); } if(h.id === 3)  { graphHwName.push(h.name); } 
        if(h.id === 4)  { graphHwName.push(h.name); } if(h.id === 5)  { graphHwName.push(h.name); } if(h.id === 6)  { graphHwName.push(h.name); }
        if(h.id === 7)  { graphHwName.push(h.name); } if(h.id === 8)  { graphHwName.push(h.name); } if(h.id === 9)  { graphHwName.push(h.name); }
        if(h.id === 10) { graphHwName.push(h.name); } if(h.id === 11) { graphHwName.push(h.name); } if(h.id === 12) { graphHwName.push(h.name); }
        if(h.id === 13) { graphHwName.push(h.name); } if(h.id === 14) { graphHwName.push(h.name); } if(h.id === 15) { graphHwName.push(h.name); }
        if(h.id === 16) { graphHwName.push(h.name); } if(h.id === 17) { graphHwName.push(h.name); } if(h.id === 18) { graphHwName.push(h.name); }
        if(h.id === 19) { graphHwName.push(h.name); } if(h.id === 20) { graphHwName.push(h.name); } if(h.id === 21) { graphHwName.push(h.name); }
        if(h.id === 22) { graphHwName.push(h.name); } if(h.id === 23) { graphHwName.push(h.name); } if(h.id === 24) { graphHwName.push(h.name); }
        if(h.id === 25) { graphHwName.push(h.name); } if(h.id === 26) { graphHwName.push(h.name); } if(h.id === 27) { graphHwName.push(h.name); }
        if(h.id === 28) { graphHwName.push(h.name); } if(h.id === 29) { graphHwName.push(h.name); } if(h.id === 30) { graphHwName.push(h.name); }
      })
      /* 하드웨어 이름 출력 */ 
      deviceSearchName.forEach(d => {
        graphDeviceName.push(d.value)
      })
      /* 시간 간격 조절 */
      const timeInterval = [];
      console.log(time.length);
      if(time.length <= 24) { timeInterval.push(2)} 
      else if(time.length > 24 && time.length <= 48) { timeInterval.push(4) }
      else if(time.length > 48 && time.length <= 100) { timeInterval.push(8) } 
      else { timeInterval.push(100)}
      this.setState({ timeChart: time})

      Highcharts.setOptions({
        chart: { type:  'line', height:300, width:1560,  styledMode: true},   
        xAxis: { categories: time, tickInterval:2,labels: {align:'center'},crosshair: {width: 2}}, 
        yAxis: { title: { text: '' },min:0,  }, 
        plotOptions: { line: { marker: { enabled: false }}, series:{ color : 'rgb(0, 169, 255)'} }, // sky blue 00CCFF
        title: { text:null, margin:40, align:'left',style:{fontSize:'12',fontWeight:'none'}},
        legend: { align: 'right', verticalAlign: 'top', layout: 'vertical', x: 0, y: 100, },
        tooltip : { shared:true, },
      })

      if(graphHwName.includes("CPU Processor (%)")) {
        const array = [];  // HW 이름
        hwSearchName.forEach(h => { if(h.id === 1) {  array.push(h.name); }})
        const obj= {};

        obj.key="chart_1_"+i
        obj.yAxis = { max:100, tickInterval:20   } 
        const testData = [0, 0, 0,0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 0, 0, 0, 0, 0, 0]
        obj.series = [{data: testData  }]
        obj.title={text : '<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+'' }
        obj.legend={ labelFormat : deviceName[i]}
        obj.totalName=deviceName[i]+'_1' 
        configArray.push(obj);
        
      }
      if(graphHwName.includes("CPU Used (%)")) {
        const array = [];
        hwSearchName.forEach(h => { if(h.id === 2) { array.push(h.name); }})
        const obj = {};
        obj.key="chart_2_"+i
        obj.yAxis = { max:100, tickInterval:20  } 
        obj.series = [{data: cpuUser}]
        obj.title= {text :'<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+''}
        obj.legend={ labelFormat : deviceName[i]}
        obj.totalName=deviceName[i]+'_2' 
        configArray.push(obj);
      }
      if(graphHwName.includes("CPU Context Switch")) {
        const array = [];
        hwSearchName.forEach(h => { if(h.id === 3) { array.push(h.name); }})
        const obj = {};
        obj.key="chart_3_"+i
        obj.series = [{data: cpuContextSwitch}]
        obj.title= {text :'<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+''}
        obj.legend={ labelFormat : deviceName[i]}
        obj.totalName=deviceName[i]+'_3' 
        configArray.push(obj);
      }
      if(graphHwName.includes("CPU Run Queue")) {
        const array = [];
        hwSearchName.forEach(h => { if(h.id === 4) { array.push(h.name); }})
        const obj = {};
        obj.key="chart_4_"+i
        obj.series = [{data: cpuRunQueue}]
        obj.title= {text :'<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+''}
        obj.legend={ labelFormat : deviceName[i]}
        obj.totalName=deviceName[i]+'_4'
        configArray.push(obj);
      }
      if(graphHwName.includes("Load Avg")) {
        const array = [];
        hwSearchName.forEach(h => { if(h.id === 6) { array.push(h.name); }})
        const obj = {};
        obj.key="chart_6_"+i
        obj.series = [{data: cpuLoadAvg}]
        obj.title= {text :'<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+''}
        obj.legend={ labelFormat : deviceName[i]}
        obj.totalName=deviceName[i]+'_6'
        configArray.push(obj);
      }
      if(graphHwName.includes("Memory Used (%)")) {
        const obj= {};
        const array = [];  
        hwSearchName.forEach(h => { if(h.id === 7) {  array.push(h.name); }})
        obj.key="chart_7_"+i
        obj.yAxis = { max:100, tickInterval:20  } 
        obj.series = [{data: memoryUsedPercentage  }]
        obj.title={text : '<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+'' }
        obj.legend={ labelFormat : deviceName[i]}
        obj.totalName=deviceName[i]+'_7'
        configArray.push(obj);
      }
      if(graphHwName.includes("Memory Bytes")) {
        const unitData = [];
        for(var e=0; e< memoryBytes.length; e++) {
          var q = Math.floor( Math.log(memoryBytes[e]) / Math.log(1024) );
          var unit = ['B', 'kB', 'MB', 'GB'][q];
          unitData.push(Number(( memoryBytes[e] / Math.pow(1024, q) ).toFixed(0)));
        }
        const obj= {};
        const array = [];  
        hwSearchName.forEach(h => { if(h.id === 8) {  array.push(h.name); }})
        obj.key="chart_8_"+i
        obj.series = [{data:  unitData}]
        obj.title={text : '<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+'' }
        obj.legend={ labelFormat : deviceName[i]}
        obj.totalName=deviceName[i]+'_8'
        obj.bytes=memoryBytes;
        obj.unit=unit;
        configArray.push(obj);
      }
      if(graphHwName.includes("Memory Buffers (%)")) {
        const obj= {};
        const array = [];  
        hwSearchName.forEach(h => { if(h.id === 9) {  array.push(h.name); }})
        obj.key="chart_9_"+i
        obj.yAxis = { max:100, tickInterval:20  } 
        obj.series = [{data: memoryBuffersPercentage  }]
        obj.title={text : '<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+'' }
        obj.legend={ labelFormat : deviceName[i]}
        obj.totalName=deviceName[i]+'_9'
        configArray.push(obj);
      }
      if(graphHwName.includes("Memory Buffers Bytes")) {
        const unitData = [];
        for(var e=0; e< memoryBuffersPercentage.length; e++) {
          if(memoryBuffersPercentage[0]  !== 0  ) { var q = Math.floor( Math.log(memoryBuffersPercentage[0] ) / Math.log(1024)); }
          var unit = ['B', 'kB', 'MB', 'GB'][q];
          unitData.push(Number(( memoryBuffersPercentage[e] / Math.pow(1024, q) ).toFixed(0)));
        }
        const obj= {};
        const array = [];  
        hwSearchName.forEach(h => { if(h.id === 10) {  array.push(h.name); }})
        obj.key="chart_10_"+i
        obj.series = [{data: unitData    }]
        obj.title={text : '<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+'' }
        obj.legend={ labelFormat : deviceName[i]}
        obj.totalName=deviceName[i]+'_10' 
        obj.bytes=memoryBuffersPercentage;
        obj.unit=unit;
        configArray.push(obj);
      }
      if(graphHwName.includes("Memory Cached (%)")) {
        const obj= {};
        const array = [];  
        hwSearchName.forEach(h => { if(h.id === 11) {  array.push(h.name); }})
        obj.key="chart_11_"+i
        obj.yAxis = { max:100, tickInterval:20  }
        obj.series = [{data: memoryCachedPercentage  }]
        obj.title={text : '<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+'' }
        obj.legend={ labelFormat : deviceName[i]}
        obj.totalName=deviceName[i]+'_11' 
        configArray.push(obj);
      }
      if(graphHwName.includes("Memory Cached Bytes")) {
        const unitData = [];
        for(var e=0; e< memoryCached.length; e++) {
          var q = Math.floor( Math.log(memoryCached[e]) / Math.log(1024) );
          var unit = ['B', 'kB', 'MB', 'GB'][q];
          unitData.push(Number(( memoryCached[e] / Math.pow(1024, q) ).toFixed(0)));
        }
        const obj= {};
        const array = [];  
        hwSearchName.forEach(h => { if(h.id === 12) {  array.push(h.name); }})
        obj.key="chart_12_"+i
        obj.series = [{data: unitData   }]
        obj.title={text : '<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+'' }
        obj.legend={ labelFormat : deviceName[i]}
        obj.totalName=deviceName[i]+'_12' 
        obj.bytes=memoryCached;
        obj.unit=unit;
        configArray.push(obj);
      }
      if(graphHwName.includes("Memory Shared (%)")) {
        const obj= {};
        const array = [];  
        hwSearchName.forEach(h => { if(h.id === 13) {  array.push(h.name); }})
        obj.key="chart_13_"+i
        obj.yAxis = { max:100, tickInterval:20  } 
        obj.series = [{data: memorySharedPercentage  }]
        obj.title={text : '<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+'' }
        obj.legend={ labelFormat : deviceName[i]}
        obj.totalName=deviceName[i]+'_13'
        configArray.push(obj);
      }
      if(graphHwName.includes("Memory Shared Bytes")) {
        const unitData = [];
        for(var e=0; e< memoryShared.length; e++) {
          var q = Math.floor( Math.log(memoryShared[e]) / Math.log(1024) );
          var unit = ['B', 'kB', 'MB', 'GB'][q];
          unitData.push(Number(( memoryShared[e] / Math.pow(1024, q) ).toFixed(0)));
        }
        const obj= {};
        const array = [];  
        hwSearchName.forEach(h => { if(h.id === 14) {  array.push(h.name); }})
        obj.key="chart_14_"+i
        obj.series = [{data: unitData }]
        obj.title={text : '<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+'' }
        obj.legend={ labelFormat : deviceName[i]}
        obj.totalName=deviceName[i]+'_14' 
        obj.bytes=memoryShared;
        obj.unit=unit;
        configArray.push(obj);
      }
      if(graphHwName.includes("Memory Swap (%)")) {
        const obj= {};
        const array = [];  
        hwSearchName.forEach(h => { if(h.id === 15) {  array.push(h.name); }})
        obj.key="chart_15_"+i
        obj.yAxis = { max:100, tickInterval:20  }
        obj.series = [{data: memorySwapPercentage  }]
        obj.title={text : '<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+'' }
        obj.legend={ labelFormat : deviceName[i]}
        obj.totalName=deviceName[i]+'15' 
        configArray.push(obj);
      }
      if(graphHwName.includes("Memory Swap Bytes")) {
        const unitData = [];
        for(var e=0; e< memorySwap.length; e++) {
          var q = Math.floor( Math.log(memorySwap[e]) / Math.log(1024) );
          var unit = ['B', 'kB', 'MB', 'GB'][q];
          unitData.push(Number(( memorySwap[e] / Math.pow(1024, q) ).toFixed(0)));
        }
        const obj= {};
        const array = [];  
        hwSearchName.forEach(h => { if(h.id === 16) {  array.push(h.name); }})
        obj.key="chart_16_"+i
        obj.series = [{data: unitData }]
        obj.title={text : '<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+'' }
        obj.legend={ labelFormat : deviceName[i]}
        obj.totalName=deviceName[i]+'_16' 
        obj.bytes=memorySwap;
        obj.unit=unit;
        configArray.push(obj);
      }
      if(graphHwName.includes("Memory Pagefault (%)")) {
        const obj= {};
        const array = [];  
        hwSearchName.forEach(h => { if(h.id === 17) {  array.push(h.name); }})
        obj.key="chart_17_"+i
        obj.yAxis = { max:100, tickInterval:20  }
        obj.series = [{data: memoryPagefault  }]
        obj.title={text : '<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+'' }
        obj.legend={ labelFormat : deviceName[i]}
        obj.totalName=deviceName[i]+'_17'
        configArray.push(obj);
      }
      if(graphHwName.includes("Disk Total Used (%)")) {
        const obj= {};
        const array = [];  
        hwSearchName.forEach(h => { if(h.id === 18) {  array.push(h.name); }})
        obj.key="chart_18_"+i
        obj.yAxis = { max:100, tickInterval:20  }
        obj.series = [{data: diskTotalUsedPercentage   }]
        obj.title={text : '<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+'' }
        obj.legend={ labelFormat : deviceName[i]}
        obj.totalName=deviceName[i]+'_18' 
        configArray.push(obj);
      }
      if(graphHwName.includes("Disk Total Used Bytes")) {
        const unitData = [];
        for(var e=0; e< diskTotalUsedBytes.length; e++) {
          var q = Math.floor( Math.log(diskTotalUsedBytes[e]) / Math.log(1024) );
          var unit = ['B', 'kB', 'MB', 'GB'][q];
          unitData.push(Number(( diskTotalUsedBytes[e] / Math.pow(1024, q) ).toFixed(0)));
        }
        const obj= {};
        const array = [];  
        hwSearchName.forEach(h => { if(h.id === 19) {  array.push(h.name); }})
        obj.key="chart_19_"+i
        obj.series = [{data: unitData  }]
        obj.title={text : '<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+'' }
        obj.legend={ labelFormat : deviceName[i]}
        obj.totalName=deviceName[i]+'19'
        obj.bytes=diskTotalUsedBytes;
        obj.unit=unit;
        configArray.push(obj);
      }
      console.log(diskUsedBytes);
      if(graphHwName.includes("Disk Used (%)")) {
        const obj= {};
        const array = [];  
        const diskData = [];
        const gridData = [];  // 단위가 변환된 데이터
        const diskGridData = []; 
        hwSearchName.forEach(h => { if(h.id === 20) {  array.push(h.name); }})
        for(var z=0; z<partitionLabel.length; z++) {
          const obj2={};
          console.log(diskUsedPercentage);
          obj2.data=diskUsedPercentage[z];
          if(z === 1)      { obj2.color= 'rgb(255,184,64)'; } 
          else if(z === 2) { obj2.color = 'red' }
          obj2.name = partitionLabel[z];
          diskData.push(obj2);
          gridData.push(diskUsedPercentage[z])
        }
        for(var x=0; x<partitionLabel.length; x++) {
          if(diskGridData.length === 0) {
            const obj = {};
            obj[partitionLabel[x]] = gridData[x]
            obj[partitionLabel[x+1]] = gridData[x+1]
            obj[partitionLabel[x+2]] = gridData[x+2]
            obj[partitionLabel[x+3]] = gridData[x+3]
            obj[partitionLabel[x+4]] = gridData[x+4]
            obj[partitionLabel[x+5]] = gridData[x+5]
            obj[partitionLabel[x+6]] = gridData[x+6]
            obj[partitionLabel[x+7]] = gridData[x+7]
            obj[partitionLabel[x+8]] = gridData[x+8]
            obj[partitionLabel[x+9]] = gridData[x+9]
            diskGridData.push(obj)
          }
        }
        obj.series = diskData
        obj.key="chart_20_"+i
        obj.title={text : '<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+'' }
        obj.data=diskGridData;
        obj.totalName=deviceName[i]+'_20'
        obj.yAxis = { max:100, tickInterval:20  }
        configArray.push(obj);
      }
      if(graphHwName.includes("Disk Used Bytes")) {
        const obj= {};
        const array = [];  
        const diskData = [];
        const unitData = [];
        const gridData = [];  // 단위가 변환된 데이터
        const diskGridData = []; 

        hwSearchName.forEach(h => { if(h.id === 21) {  array.push(h.name); }})
        for(var z=0; z<partitionLabel.length; z++) {
          const obj2={};
          obj2.data=diskUsedBytes[z];
          diskData.push(obj2);
        }
        for(var l=0; l<partitionLabel.length; l++) {
          const udata =[];
          for(var e=0; e< diskData[0].data.length; e++) {
            var q= Math.floor(Math.log(diskData[l].data[e]) / Math.log(1024));    
            var unit = ['B', 'kB', 'MB', 'GB'][q];
            udata.push(Number((diskData[l].data[e]/ Math.pow(1024, q)).toFixed(0)))
          }
          const obj3={};
          obj3.data = udata
          obj3.name = partitionLabel[l]
          obj3.length = l;
          if(l === 1)      { obj3.color= 'rgb(255,184,64)'; } 
          else if(l === 2) { obj3.color = 'red' }
          unitData.push(obj3)
          gridData.push(udata)
        }
        for(var x=0; x<partitionLabel.length; x++) {
          if(diskGridData.length === 0) {
            const obj = {};
            obj[partitionLabel[x]] = gridData[x]
            obj[partitionLabel[x+1]] = gridData[x+1]
            obj[partitionLabel[x+2]] = gridData[x+2]
            obj[partitionLabel[x+3]] = gridData[x+3]
            obj[partitionLabel[x+4]] = gridData[x+4]
            obj[partitionLabel[x+5]] = gridData[x+5]
            obj[partitionLabel[x+6]] = gridData[x+6]
            obj[partitionLabel[x+7]] = gridData[x+7]
            obj[partitionLabel[x+8]] = gridData[x+8]
            obj[partitionLabel[x+9]] = gridData[x+9]
            diskGridData.push(obj)
          }
        }
        obj.series = unitData
        obj.key="chart_21_"+i
        obj.title={text : '<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+'' }
        obj.data=diskGridData;  // [ { /dev: [array24] ,/boot: [array24] , /: [array24] ,  }]
        obj.bytes=diskData;  // [ { data : [array24], { data : [array24], { data : [array24], }]
        obj.unit=unit;
        obj.totalName=deviceName[i]+'_21' 
        configArray.push(obj);
      }
      if(graphHwName.includes("Disk I/O (%)")) {
        const obj= {};
        const array = [];  
        const gridData = [];  // 단위가 변환된 데이터
        const diskGridData = []; 
        hwSearchName.forEach(h => { if(h.id === 22) {  array.push(h.name); }})
        
        const diskData = [];
        for(var z=0; z<partitionLabel.length; z++) {
          const obj2={};
          obj2.data=diskIoPercentage[z];
          if(z === 1)      { obj2.color= 'rgb(255,184,64)'; } 
          else if(z === 2) { obj2.color = 'red' }
          obj2.name = partitionLabel[z];
          diskData.push(obj2);
          gridData.push(diskIoPercentage[z])
        }
        for(var x=0; x<partitionLabel.length; x++) {
          if(diskGridData.length === 0) {
            const obj = {};
            obj[partitionLabel[x]] = gridData[x]
            obj[partitionLabel[x+1]] = gridData[x+1]
            obj[partitionLabel[x+2]] = gridData[x+2]
            obj[partitionLabel[x+3]] = gridData[x+3]
            obj[partitionLabel[x+4]] = gridData[x+4]
            obj[partitionLabel[x+5]] = gridData[x+5]
            obj[partitionLabel[x+6]] = gridData[x+6]
            obj[partitionLabel[x+7]] = gridData[x+7]
            obj[partitionLabel[x+8]] = gridData[x+8]
            obj[partitionLabel[x+9]] = gridData[x+9]
            diskGridData.push(obj)
          }
        }
        obj.series = diskData
        obj.key="chart_22_"+i
        obj.yAxis = { max:100, tickInterval:20  }
        obj.title={text : '<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+'' }
        obj.data=diskGridData;
        obj.totalName=deviceName[i]+'_22' 
        configArray.push(obj);
      }
      if(graphHwName.includes("Disk I/O Count")) {
        const obj= {};
        const array = []; 
        const diskData = [];
        const gridData = [];  // 단위가 변환된 데이터
        const diskGridData = [];  
        hwSearchName.forEach(h => { if(h.id === 23) {  array.push(h.name); }})
        for(var z=0; z<partitionLabel.length; z++) {
          const obj2={};
          obj2.data=diskIoCount[z];
          if(z === 1)      { obj2.color= 'rgb(255,184,64)'; } 
          else if(z === 2) { obj2.color = 'red' }
          obj2.name = partitionLabel[z];
          diskData.push(obj2);
          gridData.push(diskIoCount[z])
        }
        for(var x=0; x<partitionLabel.length; x++) {
          if(diskGridData.length === 0) {
            const obj = {};
            obj[partitionLabel[x]] = gridData[x]
            obj[partitionLabel[x+1]] = gridData[x+1]
            obj[partitionLabel[x+2]] = gridData[x+2]
            obj[partitionLabel[x+3]] = gridData[x+3]
            obj[partitionLabel[x+4]] = gridData[x+4]
            obj[partitionLabel[x+5]] = gridData[x+5]
            obj[partitionLabel[x+6]] = gridData[x+6]
            obj[partitionLabel[x+7]] = gridData[x+7]
            obj[partitionLabel[x+8]] = gridData[x+8]
            obj[partitionLabel[x+9]] = gridData[x+9]
            diskGridData.push(obj)
          }
        }
        obj.series = diskData
        obj.key="chart_23_"+i
        obj.title={text : '<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+'' }
        obj.data=diskGridData;
        obj.totalName=deviceName[i]+'_23' 
        configArray.push(obj);
      }
      if(graphHwName.includes("Disk I/O Bytes")) {
        const obj= {};
        const array = [];  
        const diskData = [];
        const unitData = [];
        const gridData = [];  // 단위가 변환된 데이터
        const diskGridData = []; 
        hwSearchName.forEach(h => { if(h.id === 24) {  array.push(h.name); }})

        for(var z=0; z<partitionLabel.length; z++) {
          const obj2={};
          obj2.data=diskIoBytes[z];
          diskData.push(obj2);
        }
        for(var l=0; l<partitionLabel.length; l++) {
          const udata =[];
          for(var e=0; e< diskData[0].data.length; e++) {
            var q= Math.floor(Math.log(diskData[l].data[e]) / Math.log(1024));    
            var unit = ['B', 'kB', 'MB', 'GB'][q];
            udata.push(Number((diskData[l].data[e]/ Math.pow(1024, q)).toFixed(0)))
          }
          const obj3={};
          obj3.data = udata
          obj3.name = partitionLabel[l]
          if(l === 1)      { obj3.color= 'rgb(255,184,64)'; } 
          else if(l === 2) { obj3.color = 'red' }
          unitData.push(obj3)
          gridData.push(udata)
        }
        for(var x=0; x<partitionLabel.length; x++) {
          if(diskGridData.length === 0) {
            const obj = {};
            obj[partitionLabel[x]] = gridData[x]
            obj[partitionLabel[x+1]] = gridData[x+1]
            obj[partitionLabel[x+2]] = gridData[x+2]
            obj[partitionLabel[x+3]] = gridData[x+3]
            obj[partitionLabel[x+4]] = gridData[x+4]
            obj[partitionLabel[x+5]] = gridData[x+5]
            obj[partitionLabel[x+6]] = gridData[x+6]
            obj[partitionLabel[x+7]] = gridData[x+7]
            obj[partitionLabel[x+8]] = gridData[x+8]
            obj[partitionLabel[x+9]] = gridData[x+9]
            diskGridData.push(obj)
          }
        }
        obj.series = unitData
        obj.key="chart_24_"+i
        obj.title={text : '<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+'' }
        obj.data=diskGridData;
        obj.bytes=diskData;
        obj.unit=unit;
        obj.totalName=deviceName[i]+'_24'
        configArray.push(obj);
      }
      if(graphHwName.includes("Disk Queue")) {
        const obj= {};
        const array = [];  
        const diskData = [];
        const gridData = [];  // 단위가 변환된 데이터
        const diskGridData = [];  
        hwSearchName.forEach(h => { if(h.id === 25) {  array.push(h.name); }})
        for(var z=0; z<partitionLabel.length; z++) {
          const obj2={};
          obj2.data=diskQueue[z];
          if(z === 1)      { obj2.color= 'rgb(255,184,64)'; } 
          else if(z === 2) { obj2.color = 'red' }
          obj2.name = partitionLabel[z];
          diskData.push(obj2);
          gridData.push(diskQueue[z])
        }
        for(var x=0; x<partitionLabel.length; x++) {
          if(diskGridData.length === 0) {
            const obj = {};
            obj[partitionLabel[x]] = gridData[x]
            obj[partitionLabel[x+1]] = gridData[x+1]
            obj[partitionLabel[x+2]] = gridData[x+2]
            obj[partitionLabel[x+3]] = gridData[x+3]
            obj[partitionLabel[x+4]] = gridData[x+4]
            obj[partitionLabel[x+5]] = gridData[x+5]
            obj[partitionLabel[x+6]] = gridData[x+6]
            obj[partitionLabel[x+7]] = gridData[x+7]
            obj[partitionLabel[x+8]] = gridData[x+8]
            obj[partitionLabel[x+9]] = gridData[x+9]
            diskGridData.push(obj)
          }
        }
        obj.series = diskData
        obj.key="chart_25_"+i
        obj.title={text : '<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+'', }
        obj.data=diskGridData;
        obj.totalName=deviceName[i]+'_26'
        configArray.push(obj);
      }
      if(graphHwName.includes("Network Traffic")) {
        const unitData =  [{ in:[], out:[] }];
        for(var e=0; e< networkTraffic[0].in.length; e++) {
          // 값이 0 일 때 나눌 수 없어 nan 뜨는 예외처리
          if(networkTraffic[0].in[e] !== 0  ) { var q = Math.floor( Math.log(networkTraffic[0].in[e]) / Math.log(1024)); }
          if(networkTraffic[0].out[e]  !== 0 ) { var w = Math.floor( Math.log(networkTraffic[0].out[e]) / Math.log(1024) ); }
          var unit = ['B', 'kB', 'MB', 'GB'][q];
          unitData[0].in.push(Number(( networkTraffic[0].in[e] / Math.pow(1024, q) ).toFixed(0)));
          unitData[0].out.push(Number(( networkTraffic[0].out[e] / Math.pow(1024, w) ).toFixed(0)));
        }
        const obj= {};
        const array = [];  
        hwSearchName.forEach(h => { if(h.id === 26) {  array.push(h.name); }})
        obj.key="chart_26_"+i
        obj.series = [{data: unitData[0].in, name: 'RX'},{ data: unitData[0].out, name:'TX', color:'rgb(255, 184, 64)'}]
        obj.title={text : '<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+'', }
        obj.data = unitData;
        obj.bytes = networkTraffic;
        obj.unit=unit;
        obj.totalName=deviceName[i]+'_27'
        configArray.push(obj);
      }
      if(graphHwName.includes("Network PPS")) {
        const unitData =  [{ in:[], out:[] }];
        for(var e=0; e< networkPps[0].in.length; e++) {
          if(networkPps[0].in[e] !== 0  ) { var q = Math.floor( Math.log(networkPps[0].in[e]) / Math.log(1024)); }
          if(networkPps[0].out[e]  !== 0 ) { var w = Math.floor( Math.log(networkPps[0].out[e]) / Math.log(1024) ); }
          var unit = ['B', 'kB', 'MB', 'GB'][q];
          unitData[0].in.push(Number(( networkPps[0].in[e] / Math.pow(1024, q) ).toFixed(0)));
          unitData[0].out.push(Number(( networkPps[0].out[e] / Math.pow(1024, w) ).toFixed(0)));
        }
        const obj= {};
        const array = [];  
        hwSearchName.forEach(h => { if(h.id === 27) {  array.push(h.name); }})
        obj.key="chart_27_"+i
        obj.yAxis = { max:100, tickInterval:20  }
        obj.series = [{data: unitData[0].in, name: 'RX'},{ data: unitData[0].out, name:'TX', color:'rgb(255, 184, 64)'}]
        obj.title={text : '<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+'', }
        obj.data = unitData;
        obj.bytes = networkPps;
        obj.unit=unit;
        obj.totalName=deviceName[i]+'_28'
        configArray.push(obj);
      }
      if(graphHwName.includes("NIC Discards")) {
        const unitData =  [{ in:[], out:[] }];
        for(var e=0; e< nicDiscards[0].in.length; e++) {
          if(nicDiscards[0].in[e] !== 0  ) { var q = Math.floor( Math.log(nicDiscards[0].in[e]) / Math.log(1024)); }
          if(nicDiscards[0].out[e]  !== 0 ) { var w = Math.floor( Math.log(nicDiscards[0].out[e]) / Math.log(1024) ); }
          var unit = ['B', 'kB', 'MB', 'GB'][q];
          unitData[0].in.push(Number(( nicDiscards[0].in[e] / Math.pow(1024, q) ).toFixed(0)));
          unitData[0].out.push(Number(( nicDiscards[0].out[e] / Math.pow(1024, w) ).toFixed(0)));
        }
        const obj= {};
        const array = [];  
        hwSearchName.forEach(h => { if(h.id === 28) {  array.push(h.name); }})
        obj.key="chart_28_"+i
        obj.yAxis = { max:100, tickInterval:20  }
        obj.series = [{data: unitData[0].in, name: 'RX'},{ data: unitData[0].out, name:'TX', color:'rgb(255, 184, 64)'}]
        obj.title={text : '<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+'', }
        obj.data = unitData;
        obj.bytes = nicDiscards;
        obj.unit=unit;
        obj.totalName=deviceName[i]+'_29'
        configArray.push(obj);
      } 
      if(graphHwName.includes("NIC Errors")) {
        const unitData =  [{ in:[], out:[] }];
        for(var e=0; e< nicErrors[0].in.length; e++) {
          if(nicErrors[0].in[e] !== 0  ) { var q = Math.floor( Math.log(nicErrors[0].in[e]) / Math.log(1024)); }
          if(nicErrors[0].out[e]  !== 0 ) { var w = Math.floor( Math.log(nicErrors[0].out[e]) / Math.log(1024) ); }
          var unit = ['B', 'kB', 'MB', 'GB'][q];
          unitData[0].in.push(Number(( nicErrors[0].in[e] / Math.pow(1024, q) ).toFixed(0)));
          unitData[0].out.push(Number(( nicErrors[0].out[e] / Math.pow(1024, w) ).toFixed(0)));
        }
        const obj= {};
        const array = [];  
        hwSearchName.forEach(h => { if(h.id === 29) {  array.push(h.name); }})
        obj.key="chart_29_"+i
        obj.yAxis = { max:100, tickInterval:20  }
        obj.series = [{data: unitData[0].in, name: 'RX'},{ data: unitData[0].out, name:'TX', color:'rgb(255, 184, 64)'}]
        obj.title={text : '<span style="font-weight: bold; font-size:18px;">'+array+'</span> / '+graphStartDate+'∽'+graphEndDate+', '+deviceName[i]+'', }
        obj.data = unitData;
        obj.bytes = nicErrors;
        obj.unit=unit;
        obj.totalName=deviceName[i]+'_30'
        configArray.push(obj);
      } 
      
      console.log(configArray);
    }
    for(var k=0; k< this.state.totalKey.length; k++) {
      seriesGrid.splice(0, 1);
      seriesColumn.splice(0, 1);
    }
      this.setState({
        graphCheck:true,
        config:configArray,
        totalKey: [],
        totalData:[],
        chartColumnDefs:[],
        totalName:[],
        loader:false
      })
    })
 }

 /* Line && Bar 변경 */
 inputChartLineBar = (e,c,i) => {
   console.log(c);
   if(e.target.value === 'line') {
     c.chart = {type: 'line'};
   } else if(e.target.value === 'bar') {
     c.chart={type: 'column'};
   }
   this.setState({config:[...this.state.config]})  
}

/* bytes 단위 변환 */
inputChartBytes = (e,c,i) => {
  const { partitionLabel } = this.state; 
  console.log(c);
  const changeBytes = [];
  const bytes = [];
  const changeData = [];
  const changeGridData = []; // 파티션의 길이를 넓히기 위한 변수
  
  c.bytes.forEach((f,i) => {
    console.log(f);
      if(c.series.length === 1) {
        bytes.push(f)
      } else if(c.series.length === 3) {
        const obj={};
        if(e.target.value === 'bps') {
          const datas = [];
          for(var y=0; y< f.data.length; y++) { datas.push(Number((f.data[y] * 8).toFixed(0))); }
          obj.data = datas;
          changeData.push(obj)
          changeGridData.push(datas)
        } else if(e.target.value === 'B') {
          const datas = [];
          for(var y=0; y< f.data.length; y++) { datas.push(f.data[y]); }
          obj.data = datas;
          changeData.push(obj)
          changeGridData.push(datas)
        } else if(e.target.value === 'KB') {
          const datas = [];
          for(var y=0; y< f.data.length; y++) { datas.push(Number((f.data[y] / 1024).toFixed(0)));  }
          obj.data = datas;
          changeData.push(obj)
          changeGridData.push(datas)
        } else if(e.target.value === 'MB') {
          const datas = [];
          for(var y=0; y< f.data.length; y++) {datas.push(Number((f.data[y] / 1024/ 1024).toFixed(0))); }
          obj.data = datas;
          changeData.push(obj)
          changeGridData.push(datas)
        } else if(e.target.value === 'GB') {
          const datas = [];
          for(var y=0; y< f.data.length; y++) { datas.push(Number((f.data[y] / 1024/ 1024/ 1024).toFixed(0))); }
          obj.data = datas;
          changeData.push(obj)
          changeGridData.push(datas)
        }
        obj.name = partitionLabel[i]
        if(i === 1)   { obj.color= 'rgb(255,184,64)'; } 
        else if(i === 2) { obj.color = 'red' }
      }
  })
  
  if(c.series.length === 3) {
    c.series = changeData;

    /* 단위 변경 후 data 초기화 */
    const diskGridData = [];
    for(var x=0; x<partitionLabel.length; x++) {
      if(diskGridData.length === 0) {
        const obj = {};
        obj[partitionLabel[x]] = changeGridData[x]
        obj[partitionLabel[x+1]] = changeGridData[x+1]
        obj[partitionLabel[x+2]] = changeGridData[x+2]
        obj[partitionLabel[x+3]] = changeGridData[x+3]
        obj[partitionLabel[x+4]] = changeGridData[x+4]
        obj[partitionLabel[x+5]] = changeGridData[x+5]
        obj[partitionLabel[x+6]] = changeGridData[x+6]
        obj[partitionLabel[x+7]] = changeGridData[x+7]
        obj[partitionLabel[x+8]] = changeGridData[x+8]
        obj[partitionLabel[x+9]] = changeGridData[x+9]
        diskGridData.push(obj)
      }
    }
    c.data = diskGridData;
  }
  c.unit = e.target.value;

  /* cpu 단위 변환  */ 
  c.series.forEach(d => {
    if(c.series.length === 1) {
     for(var i=0; i<d.data.length; i++) {
        if(e.target.value === 'bps') {
          changeBytes.push(Number((bytes[i] * 8).toFixed(0)))
        } else if(e.target.value === 'B') {
          changeBytes.push(bytes[i])
        } else if(e.target.value === 'KB') {
          changeBytes.push(Number((bytes[i] / 1024).toFixed(0)))        
        } else if(e.target.value === 'MB') {
          changeBytes.push(Number((bytes[i] / 1024 / 1024).toFixed(0)))        
        } else if(e.target.value === 'GB') {
          changeBytes.push(Number((bytes[i] / 1024 / 1024 / 1024).toFixed(0)))        
        }
      } 
       d.data=changeBytes;
    }
  })

  if(this.state.totalKey.includes(c.key)) {
    this.chartTotalCheckSecond(e,c,i);
    this.setState({config:[...this.state.config] })
    
  } else {
    this.setState({config:[...this.state.config] })
  }
}

/* disk && network 단위 변환 */
inputChartTime = (e,c,i) => {
  console.log(c);
  const { totalKey } = this.state;
  const changeBytes = [];
  const data = [];
  const value = [];
  const value1 = [];
  c.bytes.forEach(f => {
    for(var y=0; y<f.in.length; y++) {
       if(e.target.value === 'bps' || e.target.value === 'pps') {
        value.push(f.in[y])
        value1.push(f.out[y])
      } else if(e.target.value === 'Kbps' || e.target.value === 'Kpps') {
        value.push(Number((f.in[y] / 1024).toFixed(0)))
        value1.push(Number((f.out[y] / 1024).toFixed(0)))   
      } else if(e.target.value === 'Mbps' || e.target.value === 'Mpps') {
        value.push(Number((f.in[y] / 1024 / 1024).toFixed(0)))
        value1.push(Number((f.out[y] / 1024 / 1024).toFixed(0)))        
      } else if(e.target.value === 'Gbps' || e.target.value === 'Gpps' ) {
        value.push(Number((f.in[y] / 1024 / 1024 / 1024).toFixed(0)))
        value1.push(Number((f.out[y] / 1024 / 1024 / 1024).toFixed(0)))
      }
    }
  })
    const obj ={};
    const obj1= {};
    const objData = {};

    obj.data = value;
    obj.name = 'RX';
    obj1.data = value1;
    obj1.name = 'TX';
    obj1.color = 'rgb(255, 184, 64)';
    changeBytes.push(obj,obj1)

    objData.in = value;
    objData.out = value1;
    data.push(objData);

    c.series = changeBytes;
    c.data=data;
    c.unit = e.target.value;

    if(totalKey.includes(c.key)) {
      this.chartTotalCheckSecond(e,c,i);
      this.setState({config:[...this.state.config] })
      
    } else {
      this.setState({config:[...this.state.config] })
    }
    
}
 /* 최대치 기준 */
 maxStandred = (e,c) => {
  var seriesData = [];
  c.series.forEach(d => {
    seriesData.push(d.data)
  })
  if(e.target.checked == true) {
    var max = Math.max(...seriesData[0]);
    c.yAxis={max:max}
  } else {
    c.yAxis={max:100,tickInterval:20}
  } 
  this.setState({inputMaxCheck:e.target.checked})
 }

 /* 차트 통계 */
 chartTotalCheck = (e,c,i) => {
   const { timeChart, totalKey, totalName,partitionLabel  } = this.state;
   console.log(c);

   if(totalKey.length >= 0 && !totalKey.includes(c.key)) {
    var seriesData = [];
    const totalTime = [];
    timeChart.forEach(t => {
        totalTime.push(t);
    })
    if(!totalTime.includes('Max')) {
      totalTime.push('Max')
      totalTime.push('Min')
      totalTime.push('Avg')
    }
 
    var data = [];
    c.series.forEach(s => {
       data.push(s.data)
    })
    const dataLength = [];
    dataLength.push(data[0].length)

    /* 최대값, 최소값, 평균 */
    if(c.data === undefined ) {
      data[0].push(Math.max(...data[0]))
      data[0].push(Math.min(...data[0]))
      const avg = data[0].reduce((a,b) => a+b, 0) / data[0].length;
      data[0].push(avg.toFixed(0))
    } else {
      for(var w=0; w < c.series.length; w++) {
        data[w].push(Math.max(...data[w]))
        data[w].push(Math.min(...data[w]))
        const avg = data[w].reduce((a,b) => a+b, 0) / data[w].length;
        data[w].push(avg.toFixed(0))
      }
    }
    
    /* line 1개일 경우 */
    c.series.forEach(d => {
        if(c.series.length === 1 ) {
          const array = [];
          for(var i=0; i < totalTime.length; i++) {
            const obj = {};
            obj.time = totalTime[i];
            obj.value = d.data[i];
            array.push(obj);
          }
          seriesGrid.push(array)
        } 
    })

    /* line 2~3개일 경우 */
    if(c.data !== undefined) {
      const array2 = [];
      c.data.forEach(e => {
        
        for(var i=0; i< totalTime.length; i++) {
          if(c.series.length === 2) {
            const obj = {};
            obj.time = totalTime[i];
            obj.in = e.in[i];
            obj.out = e.out[i];
            obj.total = Number(e.in[i]) +Number( e.out[i])
            array2.push(obj);
          }  else if(c.series.length === 3) {
            const obj = {};
            obj.time = totalTime[i];
            for(var x=0; x< partitionLabel.length; x++) {
              obj[partitionLabel[x]]= e[partitionLabel[x]][i]
            }
            array2.push(obj);
          }
        }
      })
      seriesGrid.push(array2)
    }
   
  const diskTotalData=[]
  diskTotalData.push({headerName:'시간' ,field:'time',maxWidth:180, cellStyle: { textAlign: 'center' }})
  partitionLabel.map((i,p) => {
    diskTotalData.push({
      headerName:partitionLabel[p] ,
      valueFormatter: params => {
        if(c.unit !== undefined) {
       return  params.data[partitionLabel[p]]+' '+c.unit
      } else if(c.yAxis !== undefined) {
        return params.data[partitionLabel[p]]+' '+'%'
      } else {
        return params.data[partitionLabel[p]]
      }
    },
      type: 'rightAligned', 
      headerClass: "grid-cell-left" 
    })
  })
  const columnDefs = c.series.length === 1  ?   ([
    {headerName:'시간' ,field:'time',maxWidth:180, cellStyle: { textAlign: 'center' } },
    {headerName: c.legend.labelFormat ,type: 'rightAligned', headerClass: "grid-cell-left",
    valueFormatter: params =>  {
      if(c.yAxis !== undefined) {
        return params.data.value+'%' 
      } else if(c.unit !== undefined) {
        return params.data.value+c.unit
      } else {
        return params.data.value
      }
    }}
    ]) :  ( diskTotalData )

  const columnDefsNetwork = [
      {headerName:'시간' ,field:'time',maxWidth:180, cellStyle: { textAlign: 'center' } },
      {headerName:'RX' ,valueFormatter: params => c.unit !== undefined ? params.data.in+' '+c.unit : params.data.in,  type: 'rightAligned', headerClass: "grid-cell-left" },
      {headerName:'TX' ,valueFormatter: params => c.unit !== undefined ? params.data.out+' '+c.unit : params.data.out,  type: 'rightAligned', headerClass: "grid-cell-left" },
      {headerName:'Total' ,valueFormatter: params => c.unit !== undefined ? params.data.total+' '+c.unit : params.data.total,  type: 'rightAligned', headerClass: "grid-cell-left" },
    ]
  if(c.series.length !== 2) {
    seriesColumn.push(columnDefs);
  } else {
    seriesColumn.push(columnDefsNetwork)
  }
  console.log(seriesColumn);
  console.log(seriesGrid);
    this.setState({
      chartColumnDefs: seriesColumn,
      totalData: seriesGrid,
      totalKey:totalKey.concat(c.key),
      totalName: totalName.concat(c.totalName) 
    })
    /* 데이터 초기화 */
    for(var u=0; u< data.length; u++) {
      data[u].length=dataLength
    }
   } 
    else if(totalKey.includes(c.key)) {
      console.log(totalKey.length);
      console.log(seriesColumn.length);

      this.setState({
        totalKey: totalKey.filter(totalKey => totalKey !== c.key) ,
        totalName: totalName.filter(totalName => totalName !== c.totalName) 
      })  
      console.log(totalKey.length);
      seriesGrid.splice(totalKey.length-1, 1)
      seriesColumn.splice(totalKey.length-1, 1)
     }
    
}

 /* 단위 변화 차트 통계 */
 chartTotalCheckSecond = (e,c,i) => {
  const { timeChart, totalKey,partitionLabel  } = this.state;
  console.log(c);

  if(totalKey.length >= 0 && totalKey.includes(c.key)) {
    seriesGrid.splice(totalKey.length-1, 1)
    seriesColumn.splice(totalKey.length-1, 1)

   const totalTime = [];
   timeChart.forEach(t => {
       totalTime.push(t);
   })
   if(!totalTime.includes('Max')) {
     totalTime.push('Max')
     totalTime.push('Min')
     totalTime.push('Avg')
   }

   var data = [];
   c.series.forEach(s => {
      data.push(s.data)
   })
   console.log(data);
   const dataLength = [];
   dataLength.push(data[0].length)

   /* 최대값, 최소값 ,평균 */
   if(c.data === undefined ) {
     data[0].push(Math.max(...data[0]))
     data[0].push(Math.min(...data[0]))
     const avg = data[0].reduce((a,b) => a+b, 0) / data[0].length;
     data[0].push(avg.toFixed(0))
   } else {
     for(var w=0; w < c.series.length; w++) {
       console.log( Math.max(...data[w]));
       data[w].push(Math.max(...data[w]))
       data[w].push(Math.min(...data[w]))
       const avg = data[w].reduce((a,b) => a+b, 0) / data[w].length;
       data[w].push(avg.toFixed(0))
     }
   }

   /* line 1개일 경우 */
   c.series.forEach(d => {
       if(c.series.length === 1 ) {
        const array = [];
         for(var i=0; i < totalTime.length; i++) {
           const obj = {};
           obj.time = totalTime[i];
           obj.value = d.data[i];
           array.push(obj)
         }
         seriesGrid.push(array)
       } 
   })


   console.log(seriesGrid);
   /* line 2~3개일 경우 */
   if(c.data !== undefined) {
     const array2=[];
     c.data.forEach(e => {
       for(var i=0; i< totalTime.length; i++) {
         if(c.series.length === 2) {
           const obj = {};
           obj.time = totalTime[i];
           obj.in = e.in[i];
           obj.out = e.out[i];
           obj.total = Number(e.in[i]) +Number( e.out[i])
           array2.push(obj);
         }  else if(c.series.length === 3) {
           const obj = {};
           obj.time = totalTime[i];
           for(var x=0; x< partitionLabel.length; x++) {
             obj[partitionLabel[x]]= e[partitionLabel[x]][i]
           }
           array2.push(obj);
         }
       }
     })
     seriesGrid.push(array2)
   }

const diskTotalData=[]
diskTotalData.push({headerName:'시간' ,field:'time',maxWidth:180, cellStyle: { textAlign: 'center' }},)
partitionLabel.map((i,p) => {
  diskTotalData.push({
    headerName:partitionLabel[p] ,
    valueFormatter: params => {
      if(c.unit !== undefined) {
      return  params.data[partitionLabel[p]]+' '+c.unit
    } else if(c.yAxis !== undefined) {
      return params.data[partitionLabel[p]]+' '+'%'
    } else {
      return params.data[partitionLabel[p]]
    }
  },
    type: 'rightAligned', 
    headerClass: "grid-cell-left" })
})
 const columnDefs = c.series.length === 1  ?   ([
     {headerName:'시간' ,field:'time',maxWidth:180, cellStyle: { textAlign: 'center' } },
     {headerName: c.legend.labelFormat ,type: 'rightAligned', headerClass: "grid-cell-left",
     valueFormatter: params =>  {
       if(c.yAxis !== undefined) {
         return params.data.value+' '+'%' 
       } else if(c.unit !== undefined) {
         return params.data.value+' '+c.unit
       } else {
         return params.data.value
       }
     }}
     ]) :  ( diskTotalData )

 const columnDefsNetwork = [
     {headerName:'시간' ,field:'time',maxWidth:180, cellStyle: { textAlign: 'center' } },
     {headerName:'RX' ,valueFormatter: params => c.unit !== undefined ? params.data.in+' '+c.unit : params.data.in,  type: 'rightAligned', headerClass: "grid-cell-left" },
     {headerName:'TX' ,valueFormatter: params => c.unit !== undefined ? params.data.out+' '+c.unit : params.data.out,  type: 'rightAligned', headerClass: "grid-cell-left" },
     {headerName:'Total' ,valueFormatter: params => c.unit !== undefined ? params.data.total+' '+c.unit : params.data.total,  type: 'rightAligned', headerClass: "grid-cell-left" },
   ]
       
 if(c.series.length !== 2) {
  seriesColumn.push(columnDefs);
} else {
  seriesColumn.push(columnDefsNetwork)
}
 this.setState({
  chartColumnDefs: seriesColumn,
  totalKey:totalKey
})
this.gridApiChart.setRowData(seriesGrid[totalKey.length-1])
   /* 데이터 초기화 */
   for(var u=0; u< data.length; u++) {
     data[u].length=dataLength
   }
  } 
}



diskValueFormatter = (c,params) => {
   if(c.unit !== undefined) {
    return params.data.href+' '+c.unit
  } else if(c.yAxis !== undefined) {
    return params.data.href+' '+'%'
  } else {
    return params.data.href
  }
}

reload = () => {
  for(var k=0; k< this.state.totalKey.length; k++) {
    seriesGrid.splice(0, 1);
    seriesColumn.splice(0, 1);
  }
    this.setState({
      graphCheck:false,
      config:[],
      totalKey: [],
      totalData:[],
      chartColumnDefs:[],
      totalName:[],
      deviceSearchName:[],
      hwSearchName:[],
      firstDateFormat:Moment(oneMonth, "YYYY.MM.DD").format("YYYYMMDD"), 
      secondDateFormat:Moment(oneMonth, "YYYY.MM.DD").format("YYYYMMDD"), 
      calendarCheckFirst:false,
      calendarCheckSecond:false,
    })
}



  render() {
    const { buttonIdsArray,clickedId,calendarCheckFirst,calendarCheckSecond,date,firstDateFormat,secondDateFormat,firstTimeFormat,secondTimeFormat,filterCheck,
      config,clickHwModel,hwColumnDefs,hwData,hwDefaultColDef,clickDeviceModel,deviceColumnDefs,deviceData,deviceDefaultColDef,buttonIdsDeviceArray,clickedDeviceId,
      autoGroupColumnDef,deviceSearchName,hwSearchName,graphCheck,inputIdsChart,inputIdsChartDefault,inputIdsChartCheck,inputIdsChartType,inputMaxCheck,
      chartColumnDefs,totalData,chartDefaultColDef,loader, totalKey, totalName,deviceId } =this.state;

    const firstDateFormatInput = Moment(firstDateFormat, "YYYY.MM.DD").format("YYYY-MM-DD");
    const secondDateFormatInput = Moment(secondDateFormat, "YYYY.MM.DD").format("YYYY-MM-DD");

    console.log(totalKey);
    console.log(totalName);
    console.log(config);

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
                                    onGridReady={params => {
                                      this.gridApi = params.api; 
                                      this.gridApi.forEachLeafNode( (node) => {
                                      hwSearchName.forEach(s => {
                                        if (node.data.id === s.id) {
                                          node.setSelected(true);
                                      }})
                                   });}
                                  } 
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
                                    onGridReady={params => {
                                      this.gridApis = params.api; 
                                      this.gridApis.forEachLeafNode( (node) => {
                                        deviceId.forEach(s => {
                                        if (node.data.id === s.id) {
                                          node.setSelected(true);
                                      }})
                                   });}
                                  }  
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
                       <input className="reportCalendarInput" type="text" value={firstDateFormatInput} disabled readOnly />
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
                      // defaultValue={firstTimeFormat} 
                      value={firstTimeFormat} 
                      onChange={e => this.setState({firstTimeFormat:e.target.value})}  
                    >
                      {time.map((t,i) => 
                        <option key={i} value={t.value} selected={t.value} >{t.value}</option>
                        ) }
                    </select>
                    <p className="reportCalendarDateMiddle">~</p>
                    <div className="reportCalendarYear">
                       <input className="reportCalendarInput" type="text" value={secondDateFormatInput} disabled readOnly />
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
                      // defaultValue={secondTimeFormat} 
                      value={secondTimeFormat} 
                      onChange={e => this.setState({secondTimeFormat:e.target.value})}  
                    >
                      {time.map((t,i) => 
                        <option key={i} value={t.value} selected={t.value} >{t.value}</option>
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

        {
          graphCheck && (
            <>
              {
                config.map((c,i) => (
                 <div className="reportChartParent" key={"i_"+i} >
                  <div className="reportChartArea">
                    <div className="reportChartBox">
                      <ChartComponent option={c} />
                      <div className="reportChartMaxSelect">
                        <select 
                          name={"name"+i} 
                          key={c.key}
                          id={`${c.key}`}
                          className="reportChartSelect"
                          onChange={(e) => this.inputChartLineBar(e,c,i)} >
                            <option value="line">Line</option>
                            <option value="bar">Bar</option>
                        </select>
                        {
                          c.title.text.includes("(%)") && (
                            <>
                            <label className="reportChartLabel">최대치 기준</label>
                            <input type="checkbox"  name={"checkbox_"+i} onChange={(e)=> this.maxStandred(e,c)} className="reportChartInput" />
                            </>
                          )
                        }
                        {
                          c.title.text.includes("Bytes") && (
                            <>
                            <select 
                              name={"name"+i} 
                              className="reportChartSelect"
                              value={c.unit}
                              onChange={(e) => this.inputChartBytes(e,c,i)} >
                                <option value="bps">bps</option>
                                <option value="B">B</option>
                                <option value="KB">KB</option>
                                <option value="MB">MB</option>
                                <option value="GB">GB</option>
                            </select>
                            </>
                          )
                        }
                        {
                          c.title.text.includes("Traffic") && (
                            <>
                            <select 
                              name={"name"+i} 
                              className="reportChartSelect"
                              value={c.unit}
                              onChange={(e) => this.inputChartTime(e,c,i)} >
                                <option value="bps">bps</option>
                                <option value="Kbps">Kbps</option>
                                <option value="Mbps">Mbps</option>
                                <option value="Gbps">Gbps</option>
                            </select>
                            </>
                          )
                        }
                        {
                          c.title.text.includes("PP") || c.title.text.includes("NIC")  ? (
                            <>
                            <select 
                              name={"name"+i} 
                              className="reportChartSelect"
                              value={c.unit}
                              onChange={(e) => this.inputChartTime(e,c,i)} >
                                <option value="pps">pps</option>
                                <option value="Kpps">Kpps</option>
                                <option value="Mpps">Mpps</option>
                                <option value="Gpps">Gpps</option>
                            </select>
                            </>
                          ) : null
                        }
                      </div>
                    </div>

                  <div className="reportChartTotalArea">
                    <button className="reportChartTotalBox"   onClick={(e) => this.chartTotalCheck(e,c,i)}>
                      <label className="reportChartTotalText" >
                        ▼ 차트 통계
                      </label>
                    </button>
                    {
                      totalKey.map((t,a) => 
                        (
                        c.key === t && totalName.includes(c.totalName) && ( 
                          <div className="reportChartTotalGrid" key={t}  >
                            <div className="ag-theme-alpine" style={{ width:'93vw', height:'40vh',marginLeft:'0.5vw'}}>
                                <AgGridReact
                                headerHeight='30'
                                floatingFiltersHeight='23'
                                rowHeight='25'
                                columnDefs={chartColumnDefs[a]}  
                                defaultColDef={chartDefaultColDef}
                                rowData={totalData[a]}
                                onGridReady={params => { this.gridApiChart = params.api;}}
                              />       
                            </div>
                          </div>
                          )
                        ))
                      }
                  </div>
                </div>
              </div>
                ))
              }
              
            <div className="reportFooter"></div>
            </>
          )
        }
        
      </div>

      {
            loader && <Loader  />
      }
      </>
    );
  }
}



export default ReportResoruce;