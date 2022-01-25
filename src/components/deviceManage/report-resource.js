import React, { Component } from 'react';
import Select from "react-select";
import _ from "lodash";
import { saveAs } from 'file-saver';
import AiwacsService from '../../services/equipment.service';
import ReportService from '../../services/report.service';
import AuthService from "../../services/auth.service";
import FilterButton from '../../common/components/filterButton';

import Search from '../../images/search.png'
import Loader from '../loader';
import ChartComponent from './ChartComponent';

import {Button, Modal, Form } from "react-bootstrap";

import DatePicker from "react-datepicker";
import Moment from 'moment';

import { ko } from 'date-fns/esm/locale'
import { FcCalendar } from "react-icons/fc"

import {  AgGridReact } from 'ag-grid-react';
import "ag-grid-enterprise";
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import "react-datepicker/dist/react-datepicker.css";

import '../../css/reportResource.css';

const time = [
  {value:'00'}, {value:'01'}, {value:'02'}, {value:'03'}, {value:'04'}, {value:'05'},
  {value:'06'}, {value:'07'}, {value:'08'}, {value:'09'}, {value:'10'}, {value:'11'},
  {value:'12'}, {value:'13'}, {value:'14'}, {value:'15'}, {value:'16'}, {value:'17'},
  {value:'18'}, {value:'19'}, {value:'20'}, {value:'21'}, {value:'22'}, {value:'23'}]

const customStyles = { control: base => ({ ...base, height: 26, minHeight: 26 }) };
const getDayName = (date) => { return date.toLocaleDateString('ko-KR', { weekday: 'long', }).substr(0, 1); }
const createDate = (date) => { return new Date(new Date(date.getFullYear() , date.getMonth() , date.getDate() , 0 , 0 , 0)); }

const resourceData = [
  {id:1, group:"CPU", cpu:"CPU Processor (%)", resourceKey: 'sys', resourceName: 'CPU Processor (%)'},
  {id:2, group:"CPU", cpu:"CPU Used (%)", resourceKey: 'sys', resourceName: 'CPU Used (%)'},
  {id:3, group:"CPU", cpu:"CPU Context Switch", resourceKey: 'sys', resourceName: 'CPU Context Switch'},
  {id:4, group:"CPU", cpu:"CPU Run Queue", resourceKey: 'sys', resourceName: 'CPU Run Queue'},
  {id:5, group:"CPU", cpu:"CPU Core", resourceKey: 'sys', resourceName: 'CPU Core'},
  {id:6, group:"CPU", cpu:"Load Avg", resourceKey: 'sys', resourceName: 'Load Avg'},
  {id:7, group:"Memory", memory:"Memory Used (%)", resourceKey: 'sys', resourceName: 'Memory Used (%)'},
  {id:8, group:"Memory", memory:"Memory Bytes", resourceKey: 'sys', resourceName: 'Memory Bytes'},
  {id:9, group:"Memory", memory:"Memory Buffers (%)", resourceKey: 'sys', resourceName: 'Memory Buffers (%)'},
  {id:10, group:"Memory", memory:"Memory Buffers Bytes", resourceKey: 'sys', resourceName: 'Memory Buffers Bytes'},
  {id:11, group:"Memory", memory:"Memory Cached (%)", resourceKey: 'sys', resourceName: 'Memory Cached (%)'},
  {id:12, group:"Memory", memory:"Memory Cached Bytes", resourceKey: 'sys', resourceName: 'Memory Cached Bytes'},
  {id:13, group:"Memory", memory:"Memory Shared (%)", resourceKey: 'sys', resourceName: 'Memory Shared (%)'},
  {id:14, group:"Memory", memory:"Memory Shared Bytes", resourceKey: 'sys', resourceName: 'Memory Shared Bytes'},
  {id:15, group:"Memory", memory:"Memory Swap (%)", resourceKey: 'sys', resourceName: 'Memory Swap (%)'},
  {id:16, group:"Memory", memory:"Memory Swap Bytes", resourceKey: 'sys', resourceName: 'Memory Swap Bytes'},
  {id:17, group:"Memory", memory:"Memory Pagefault", resourceKey: 'sys', resourceName: 'Memory Pagefault'},
  {id:18, group:"Disk", disk:"Disk Total Used (%)", resourceKey: 'diskTot', resourceName: 'Disk Total Used (%)'},
  {id:19, group:"Disk", disk:"Disk Total Used Bytes", resourceKey: 'diskTot', resourceName: 'Disk Total Used Bytes'},
  {id:20, group:"Disk", disk:"Disk Used (%)", resourceKey: 'disk', resourceName: 'Disk Used (%)'},
  {id:21, group:"Disk", disk:"Disk Used Bytes", resourceKey: 'disk', resourceName: 'Disk Used Bytes'},
  {id:22, group:"Disk", disk:"Disk I/O (%)", resourceKey: 'disk', resourceName: 'Disk I/O (%)'},
  {id:23, group:"Disk", disk:"Disk I/O Count", resourceKey: 'disk', resourceName: 'Disk I/O Count'},
  {id:24, group:"Disk", disk:"Disk I/O Bytes", resourceKey: 'disk', resourceName: 'Disk I/O Bytes'},
  {id:25, group:"Disk", disk:"Disk Queue", resourceKey: 'disk', resourceName: 'Disk Queue'},
  {id:26, group:"Network", network:"Network Traffic", resourceKey: 'nic', resourceName: 'Network Traffic'},
  {id:27, group:"Network", network:"Network PPS", resourceKey: 'nic', resourceName: 'Network PPS'},
  {id:28, group:"Network", network:"NIC Discards", resourceKey: 'nic', resourceName: 'NIC Discards'},
  {id:29, group:"Network", network:"NIC Errors", resourceKey: 'nic', resourceName: 'NIC Errors'}];

const modalOptions = {
  resourceColumnDefs:[{ field:'group', rowGroup: true, hide:true, }],
  resourceDefaultColDef: {
    sortable:true,  
    resizable:true,  
    floatingFilter: true,
    filter:'agTextColumnFilter', 
    flex:1,
    maxWidth:830,
  },
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
    { headerName: '별칭', field:'nickname', headerCheckboxSelection: true, checkboxSelection:true },
    { headerName: '장비 명', field:'equipment' },
    { headerName: 'IP', field:'settingIp' },
    { headerName: 'GUID', field:'settingIp' },
  ],
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
   }
  },
  chartDefaultColDef: {
    sortable:true,  
    resizable:true,  
    floatingFilter: true,
    filter:'agTextColumnFilter', 
    flex:1,
  },
};

// 하루 초 86400000
const oneMonth = new Date(new Date().getTime() - 40435200000 );

const seriesGrid = [];
const seriesColumn = [];

class ReportResoruce extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loader: false,
      isResourceModal:false,
      isDeviceModal: false,
      selectedResource: [],
      selectedResourceName: [],
      selectedDevice: [], 
      selectedDeviceName: [],
      chartData: {},
      totalKey: [],
      totalData : [],
      chartColumnDefs: [],
      firstDateFormat: Moment(oneMonth, "YYYY.MM.DD").format("YYYYMMDD"),
      secondDateFormat: Moment(oneMonth, "YYYY.MM.DD").format("YYYYMMDD"),
      firstTimeFormat: '00',
      secondTimeFormat: '23',
      calendarCheckSecond:false,
      calendarCheckFirst:false,
      filterCheck:true
    };
  }

  componentDidMount() {
     
  }

  selectResourceModal = () => {
    this.setState({isResourceModal:true})
  }

  selectDeviceModal = () => {
    AiwacsService.getEquipmentSnmp() 
      .then(res => {
        this.setState({deviceData:res.data, isDeviceModal: true})
      })
  }

  applyResourceModal = () => {
    let selectedResourceNode = this.resourceGridApi.getSelectedNodes();
    let selectedResourceName = [];
    let selectedResource = [];

    if(selectedResourceNode.length === 0) {
      alert("체크박스를 선택해 주세요.");
      return;
    } else {
      selectedResourceNode.forEach(v => {
        let obj = {};
        obj.label = v.data.group + ">" + v.data.resourceName;
        obj.value = v.data.group + ">" + v.data.resourceName;
        obj.id = v.data.id;
        obj.name = v.data.resourceName;

        selectedResourceName.push(obj);
        selectedResource.push(v.data);
      });
      this.setState({ isResourceModal:false, selectedResourceName: selectedResourceName, selectedResource: selectedResource });
    }
  }

  applyDeviceModal = () => {
    let selectedDeviceNode = this.deviceGridApi.getSelectedNodes();
    let selectedDeviceName = [];
    let selectedDevice = [];

    if(selectedDeviceNode.length === 0) {
      alert("장비를 선택해 주세요.");
      return;
    } else {
      selectedDeviceNode.forEach(v => {
        let obj = {};
        obj.id = v.data.id
        obj.value = v.data.equipment;
        obj.label = v.data.equipment;
        selectedDeviceName.push(obj);
        selectedDevice.push(v.data);
      });
      this.setState({ isDeviceModal:false, selectedDeviceName: selectedDeviceName, selectedDevice: selectedDevice });
    }
  }

  getReportData() {
    let { selectedResource, selectedDevice, firstDateFormat, secondDateFormat, firstTimeFormat, secondTimeFormat } = this.state;
    // 유효성 체크
    if(selectedResource.length === 0) {
      return alert("검색필터에서 자원을 선택하세요");
    }
    if(selectedDevice.length === 0) {
      return alert("검색필터에서 장비을 선택하세요");
    }
    this.setState({ loader: true, chartData : [] });

    const startDate=firstDateFormat+firstTimeFormat+'0000';
    const endDate= secondDateFormat+secondTimeFormat+'5959';
    let resourceKey = _.groupBy(selectedResource, 'resourceKey');
    let sys = 0;
    let disk = 0;
    let nic = 0;

    _.forEach(resourceKey, (obj, key) => {
      if (key === 'sys') sys = 1;
      else if(key === 'disk' || key === 'diskTot') disk = 1;
      else if(key === 'nic') nic = 1;
    });

    let id = [];
    _.forEach(selectedDevice, (obj) => {
      id.push(obj.id);
    });
    let ids = id.join('|');

    ReportService.getStatistics(ids, sys, disk, nic, startDate, endDate)
    .then(res => {
      this.setReportDataFormat(res.data);
    })
    .catch(err => {console.log(err)})
  }

setReportDataFormat(data) {
    let { selectedResource, selectedDevice,firstDateFormat, secondDateFormat } = this.state;
    let startDate = Moment(firstDateFormat).format("YYYY.MM.DD");
    let endDate = Moment(secondDateFormat).format("YYYY.MM.DD");
    let chartData = {};

    _. forEach(selectedDevice , (dobj, dkey) => {
      _.forEach(selectedResource, (obj, key) => {
        let chartObj = {};

        let chartOptions = {
          chart: {
            type: 'line'
          },
          title: {
            text: null,
            align: 'left',
            style: {
                fontSize: "12px"
            }
          },
          xAxis: {
            categories: [],
            labels: {align:'center'}
          },
          series: [
            {
              data: [],
              name: ''
            }
          ],
          yAxis: {
            title: { text: '' },
            min:0, 
          }
        };

        let categoryAry = [];
        let valueAry = [];
        let originValueAry = [];
        let partitionName = [];
        let partitionData = {};
        let seriesDataAry = [];
        let gridTotalAry =[];

        const mathAdd = ['Max', 'Min' , 'Avg']
        const pdfPartitionName = ['Time'];

        if(obj.resourceName === 'CPU Processor (%)') {
          seriesDataAry.push(["Time",dobj.equipment])
          _.forEach(data[obj.resourceKey], (iobj) => {
            if(iobj.deviceId ===  dobj.id) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
              valueAry.push(iobj.cpuProcessor);
              seriesDataAry.push([_.replace(iobj.generateTime, 'T', ' '),iobj.cpuProcessor+'%'])
            }
          });
          seriesDataAry.push(['Max', Math.max(...valueAry)+'%']);
          seriesDataAry.push(['Min', Math.min(...valueAry)+'%']);
          const avg =  valueAry.reduce((a,b) => a+b, 0) / valueAry.length;
          seriesDataAry.push(['Avg', avg.toFixed(0)+'%']);
          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;
          chartOptions.yAxis = {max:100, tickInterval:20 }
          chartOptions.series[0].data = valueAry;
          chartOptions.series[0].name = dobj.equipment;
          
          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = dobj.equipment;
          chartObj.percentMaxType = true;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.key = "chart_"+key+'_'+dkey
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } else if(obj.resourceName === 'CPU Used (%)') {
          const cpuGuest = [];
          const cpuGuestnice = [];
          const cpuIrq = [];
          const cpuNice = [];
          const cpuSoftirq = [];
          const cpuSteal = [];
          const cpuWait = [];
          const cpuSystem = [];
          const cpuProcessor = [];
          const cpuUser = [];
          _.forEach(data[obj.resourceKey], (iobj) => {
            if(iobj.deviceId ===  dobj.id) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
              cpuGuest.push(iobj.cpuGuest); cpuGuestnice.push(iobj.cpuGuestnice); cpuIrq.push(iobj.cpuIrq); cpuSoftirq.push(iobj.cpuSoftirq); cpuNice.push(iobj.cpuNice);
              cpuProcessor.push(iobj.cpuProcessor); cpuSteal.push(iobj.cpuSteal); cpuSystem.push(iobj.cpuSystem); cpuWait.push(iobj.cpuWait); cpuUser.push(iobj.cpuUser);
            }
          });
          partitionData = { cpuGuest: cpuGuest, cpuGuestnice: cpuGuestnice, cpuIrq:cpuIrq, cpuSoftirq:cpuSoftirq, 
                            cpuNice:cpuNice, cpuProcessor:cpuProcessor, cpuSteal:cpuSteal, cpuSystem: cpuSystem, cpuWait:cpuWait, cpuUser:cpuUser }
          partitionName.push('cpuGuest', 'cpuGuestnice', 'cpuIrq', 'cpuSoftirq', 'cpuNice', 'cpuProcessor', 'cpuSteal', 'cpuSystem', 'cpuWait', 'cpuUser')
          valueAry.push({data:cpuGuest,name: 'cpuGuest'},{data:cpuGuestnice,name: 'cpuGuestnice'},{data:cpuIrq,name: 'cpuIrq'},{data:cpuSoftirq,name: 'cpuSoftirq'},
                        {data:cpuNice,name: 'cpuNice'},{data:cpuProcessor,name: 'cpuProcessor'},{data:cpuSteal,name: 'cpuSteal'},
                        {data:cpuSystem,name: 'cpuSystem'},{data:cpuWait,name: 'cpuWait'},{data:cpuUser,name: 'cpuUser'},)
          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;
          chartOptions.yAxis = { max:100, tickInterval:20  }
          chartOptions.series = valueAry;

          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = dobj.equipment;
          chartObj.percentMaxType = true;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.partition = partitionName;
          chartObj.gridData = partitionData;
          chartObj.key = "chart_"+key+'_'+dkey
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } else if(obj.resourceName === 'CPU Context Switch') {
          seriesDataAry.push(["Time",dobj.equipment])
          _.forEach(data[obj.resourceKey], (iobj) => {
            if(iobj.deviceId ===  dobj.id) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
              valueAry.push(iobj.cpuContextswitch);
              seriesDataAry.push([_.replace(iobj.generateTime, 'T', ' '),iobj.cpuContextswitch])
            }
          });
          seriesDataAry.push(['Max', Math.max(...valueAry)]);
          seriesDataAry.push(['Min', Math.min(...valueAry)]);
          const avg =  valueAry.reduce((a,b) => a+b, 0) / valueAry.length;
          seriesDataAry.push(['Avg', avg.toFixed(0)]);
          
          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;
          chartOptions.series[0].data = valueAry;
          chartOptions.series[0].name = dobj.equipment;
          
          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = dobj.equipment;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.key = "chart_"+key+'_'+dkey
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } else if(obj.resourceName === 'CPU Run Queue') {
          seriesDataAry.push(["Time",dobj.equipment])
          _.forEach(data[obj.resourceKey], (iobj) => {
            if(iobj.deviceId ===  dobj.id) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
              valueAry.push(iobj.cpuIrq);
              seriesDataAry.push([_.replace(iobj.generateTime, 'T', ' '),iobj.cpuIrq])
            }
          });
          seriesDataAry.push(['Max', Math.max(...valueAry)]);
          seriesDataAry.push(['min', Math.min(...valueAry)]);
          const avg =  valueAry.reduce((a,b) => a+b, 0) / valueAry.length;
          seriesDataAry.push(['Avg', avg.toFixed(0)]);

          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;
          chartOptions.series[0].data = valueAry;
          chartOptions.series[0].name = dobj.equipment;

          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = dobj.equipment;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.key = "chart_"+key+'_'+dkey
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } else if(obj.resourceName === 'Load Avg') {
          seriesDataAry.push(["Time",dobj.equipment])
          _.forEach(data[obj.resourceKey], (iobj) => {
            if(iobj.deviceId ===  dobj.id) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
              valueAry.push(iobj.cpuLoadavg);
              seriesDataAry.push([_.replace(iobj.generateTime, 'T', ' '),iobj.cpuLoadavg])
            }
          });
          seriesDataAry.push(['Max', Math.max(...valueAry)]);
          seriesDataAry.push(['Min', Math.min(...valueAry)]);
          const avg =  valueAry.reduce((a,b) => a+b, 0) / valueAry.length;
          seriesDataAry.push(['Avg', avg.toFixed(0)]);

          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;
          chartOptions.series[0].data = valueAry;
          chartOptions.series[0].name = dobj.equipment;

          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = dobj.equipment;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.key = "chart_"+key+'_'+dkey
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } else if(obj.resourceName === 'Memory Used (%)') {
          seriesDataAry.push(["Time",dobj.equipment])
          _.forEach(data[obj.resourceKey], (iobj) => {
            if(iobj.deviceId ===  dobj.id) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
              valueAry.push(iobj.usedMemoryPercentage);
              seriesDataAry.push([_.replace(iobj.generateTime, 'T', ' '),iobj.usedMemoryPercentage+'%'])
            }
          });
          seriesDataAry.push(['Max', Math.max(...valueAry)+'%']);
          seriesDataAry.push(['Min', Math.min(...valueAry)+'%']);
          const avg =  valueAry.reduce((a,b) => a+b, 0) / valueAry.length;
          seriesDataAry.push(['Avg', avg.toFixed(0)+'%']);
          
          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;
          chartOptions.series[0].data = valueAry;
          chartOptions.series[0].name = dobj.equipment;

          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = dobj.equipment;
          chartOptions.yAxis = {max:100, tickInterval:20 }
          chartObj.percentMaxType = true;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.key = "chart_"+key+'_'+dkey
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } else if(obj.resourceName === 'Memory Bytes') {
          let byteVal = 'bps';
          seriesDataAry.push(["Time",dobj.equipment])
          byteVal = this.autoConvertByte(obj,data[obj.resourceKey][0].usedMemory).unit;
          _.forEach(data[obj.resourceKey], (iobj,ikey) => {
            if(iobj.deviceId ===  dobj.id) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
              valueAry.push(this.autoConvertByte(obj,iobj.usedMemory).value);
              originValueAry.push(iobj.usedMemory);
              seriesDataAry.push([_.replace(iobj.generateTime, 'T', ' '),this.autoConvertByte(obj,iobj.usedMemory).value+byteVal])
            }
          });
          seriesDataAry.push(['Max', Math.max(...valueAry)+byteVal]);
          seriesDataAry.push(['min', Math.min(...valueAry)+byteVal]);
          const avg =  valueAry.reduce((a,b) => a+b, 0) / valueAry.length;
          seriesDataAry.push(['Avg', avg.toFixed(0)+byteVal]);
          
          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;
          chartOptions.series[0].data = valueAry;
          chartOptions.series[0].name = dobj.equipment;

          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = dobj.equipment;
          chartObj.byteType = true;
          chartObj.byteVal = byteVal;
          chartObj.originValueAry = originValueAry;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.key = "chart_"+key+'_'+dkey
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } else if(obj.resourceName === 'Memory Buffers (%)') {
          seriesDataAry.push(["Time",dobj.equipment])
          _.forEach(data[obj.resourceKey], (iobj) => {
            if(iobj.deviceId ===  dobj.id) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
              valueAry.push(iobj.memoryBuffersPercentage);
              seriesDataAry.push([_.replace(iobj.generateTime, 'T', ' '),iobj.memoryBuffersPercentage+'%'])
            }
          });
          seriesDataAry.push(['Max', Math.max(...valueAry)+'%']);
          seriesDataAry.push(['Min', Math.min(...valueAry)+'%']);
          const avg =  valueAry.reduce((a,b) => a+b, 0) / valueAry.length;
          seriesDataAry.push(['Avg', avg.toFixed(0)+'%']);
          
          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;
          chartOptions.series[0].data = valueAry;
          chartOptions.series[0].name = dobj.equipment;

          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = dobj.equipment;
          chartOptions.yAxis = {max:100, tickInterval:20 }
          chartObj.percentMaxType = true;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.key = "chart_"+key+'_'+dkey
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } else if(obj.resourceName === 'Memory Buffers Bytes') {
          let byteVal = 'bps';
          seriesDataAry.push(["Time",dobj.equipment])
          byteVal = this.autoConvertByte(obj,data[obj.resourceKey][0].memoryBuffers).unit;
          _.forEach(data[obj.resourceKey], (iobj,ikey) => {
            if(iobj.deviceId ===  dobj.id) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
              valueAry.push(this.autoConvertByte(obj,iobj.memoryBuffers).value);
              originValueAry.push(iobj.memoryBuffers);
              seriesDataAry.push([_.replace(iobj.generateTime, 'T', ' '),this.autoConvertByte(obj,iobj.memoryBuffers).value+byteVal])
            }
          });
          seriesDataAry.push(['Max', Math.max(...valueAry)+byteVal]);
          seriesDataAry.push(['Min', Math.min(...valueAry)+byteVal]);
          const avg =  valueAry.reduce((a,b) => a+b, 0) / valueAry.length;
          seriesDataAry.push(['Avg', avg.toFixed(0)+byteVal]);

          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;
          chartOptions.series[0].data = valueAry;
          chartOptions.series[0].name = dobj.equipment;

          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = dobj.equipment;
          chartObj.byteType = true;
          chartObj.byteVal = byteVal;
          chartObj.originValueAry = originValueAry;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.key = "chart_"+key+'_'+dkey
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } else if(obj.resourceName === 'Memory Cached (%)') {
          seriesDataAry.push(["Time",dobj.equipment])
          _.forEach(data[obj.resourceKey], (iobj) => {
            if(iobj.deviceId ===  dobj.id) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
              valueAry.push(iobj.memoryCachedPercentage);
              seriesDataAry.push([_.replace(iobj.generateTime, 'T', ' '),iobj.memoryCachedPercentage+'%'])
            }
          });
          seriesDataAry.push(['Max', Math.max(...valueAry)+'%']);
          seriesDataAry.push(['Min', Math.min(...valueAry)+'%']);
          const avg =  valueAry.reduce((a,b) => a+b, 0) / valueAry.length;
          seriesDataAry.push(['Avg', avg.toFixed(0)+'%']);
          
          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;
          chartOptions.series[0].data = valueAry;
          chartOptions.series[0].name = dobj.equipment;

          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = dobj.equipment;
          chartOptions.yAxis = {max:100, tickInterval:20 }
          chartObj.percentMaxType = true;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.key = "chart_"+key+'_'+dkey
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } else if(obj.resourceName === 'Memory Cached Bytes') {
          let byteVal = 'bps';
          seriesDataAry.push(["Time",dobj.equipment])
          byteVal = this.autoConvertByte(obj,data[obj.resourceKey][0].memoryCached).unit;
          _.forEach(data[obj.resourceKey], (iobj,ikey) => {
            if(iobj.deviceId ===  dobj.id) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
              valueAry.push(this.autoConvertByte(obj,iobj.memoryCached).value);
              originValueAry.push(iobj.memoryCached);
              seriesDataAry.push([_.replace(iobj.generateTime, 'T', ' '),this.autoConvertByte(obj,iobj.memoryCached).value+byteVal])
            }
          });
          seriesDataAry.push(['Max', Math.max(...valueAry)+byteVal]);
          seriesDataAry.push(['Min', Math.min(...valueAry)+byteVal]);
          const avg =  valueAry.reduce((a,b) => a+b, 0) / valueAry.length;
          seriesDataAry.push(['Avg', avg.toFixed(0)+byteVal]);
          
          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;
          chartOptions.series[0].data = valueAry;
          chartOptions.series[0].name = dobj.equipment;

          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = dobj.equipment;
          chartObj.byteType = true;
          chartObj.byteVal = byteVal;
          chartObj.originValueAry = originValueAry;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.key = "chart_"+key+'_'+dkey
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } else if(obj.resourceName === 'Memory Shared (%)') {
          seriesDataAry.push(["Time",dobj.equipment])
          _.forEach(data[obj.resourceKey], (iobj) => {
            if(iobj.deviceId ===  dobj.id) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
              valueAry.push(iobj.memorySharedPercentage);
              seriesDataAry.push([_.replace(iobj.generateTime, 'T', ' '),iobj.memorySharedPercentage+'%'])
            }
          });
          seriesDataAry.push(['Max', Math.max(...valueAry)+'%']);
          seriesDataAry.push(['Min', Math.min(...valueAry)+'%']);
          const avg =  valueAry.reduce((a,b) => a+b, 0) / valueAry.length;
          seriesDataAry.push(['Avg', avg.toFixed(0)+'%']);

          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;
          chartOptions.series[0].data = valueAry;
          chartOptions.series[0].name = dobj.equipment;

          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = dobj.equipment;
          chartOptions.yAxis = {max:100, tickInterval:20 }
          chartObj.percentMaxType = true;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.key = "chart_"+key+'_'+dkey
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } else if(obj.resourceName === 'Memory Shared Bytes') {
          let byteVal = 'bps';
          seriesDataAry.push(["Time",dobj.equipment])
          byteVal = this.autoConvertByte(obj,data[obj.resourceKey][0].memoryShared).unit;
          _.forEach(data[obj.resourceKey], (iobj,ikey) => {
            if(iobj.deviceId ===  dobj.id) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
              valueAry.push(this.autoConvertByte(obj,iobj.memoryShared).value);
              originValueAry.push(iobj.memoryShared);
              seriesDataAry.push([_.replace(iobj.generateTime, 'T', ' '),this.autoConvertByte(obj,iobj.memoryShared).value+byteVal])
            }
          });
          seriesDataAry.push(['Max', Math.max(...valueAry)+byteVal]);
          seriesDataAry.push(['Min', Math.min(...valueAry)+byteVal]);
          const avg =  valueAry.reduce((a,b) => a+b, 0) / valueAry.length;
          seriesDataAry.push(['Avg', avg.toFixed(0)+byteVal]);
          
          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;
          chartOptions.series[0].data = valueAry;
          chartOptions.series[0].name = dobj.equipment;

          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = dobj.equipment;
          chartObj.byteType = true;
          chartObj.byteVal = byteVal;
          chartObj.originValueAry = originValueAry;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.key = "chart_"+key+'_'+dkey
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } else if(obj.resourceName === 'Memory Swap (%)') {
          seriesDataAry.push(["Time",dobj.equipment])
          _.forEach(data[obj.resourceKey], (iobj) => {
            if(iobj.deviceId ===  dobj.id) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
              valueAry.push(iobj.usedSwapPercentage);
              seriesDataAry.push([_.replace(iobj.generateTime, 'T', ' '),iobj.usedSwapPercentage+'%'])
            }
          });
          seriesDataAry.push(['Max', Math.max(...valueAry)+'%']);
          seriesDataAry.push(['Min', Math.min(...valueAry)+'%']);
          const avg =  valueAry.reduce((a,b) => a+b, 0) / valueAry.length;
          seriesDataAry.push(['Avg', avg.toFixed(0)+'%']);
          
          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;
          chartOptions.series[0].data = valueAry;
          chartOptions.series[0].name = dobj.equipment;

          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = dobj.equipment;
          chartOptions.yAxis = {max:100, tickInterval:20 }
          chartObj.percentMaxType = true;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.key = "chart_"+key+'_'+dkey
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } else if(obj.resourceName === 'Memory Swap Bytes') {
          let byteVal = 'bps';
          seriesDataAry.push(["Time",dobj.equipment])
          byteVal = this.autoConvertByte(obj,data[obj.resourceKey][0].usedSwap).unit;
          _.forEach(data[obj.resourceKey], (iobj,ikey) => {
            if(iobj.deviceId ===  dobj.id) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
              valueAry.push(this.autoConvertByte(obj,iobj.usedSwap).value);
              originValueAry.push(iobj.usedSwap);
              seriesDataAry.push([_.replace(iobj.generateTime, 'T', ' '),this.autoConvertByte(obj,iobj.usedSwap).value+byteVal])
            }
          });

          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;
          chartOptions.series[0].data = valueAry;
          chartOptions.series[0].name = dobj.equipment;

          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = dobj.equipment;
          chartObj.byteType = true;
          chartObj.byteVal = byteVal;
          chartObj.originValueAry = originValueAry;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.key = "chart_"+key+'_'+dkey
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } else if(obj.resourceName === 'Memory Pagefault') {
          seriesDataAry.push(["Time",dobj.equipment])
          _.forEach(data[obj.resourceKey], (iobj) => {
            if(iobj.deviceId ===  dobj.id) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
              valueAry.push(iobj.memoryPagefault);
              seriesDataAry.push([_.replace(iobj.generateTime, 'T', ' '),iobj.memoryPagefault])
            }
          });
          seriesDataAry.push(['Max', Math.max(...valueAry)]);
          seriesDataAry.push(['Min', Math.min(...valueAry)]);
          const avg =  valueAry.reduce((a,b) => a+b, 0) / valueAry.length;
          seriesDataAry.push(['Avg', avg.toFixed(0)]);
          
          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;
          chartOptions.series[0].data = valueAry;
          chartOptions.series[0].name = dobj.equipment;

          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = dobj.equipment;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.key = "chart_"+key+'_'+dkey
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } else if(obj.resourceName === 'Disk Total Used (%)') {
          seriesDataAry.push(["Time",dobj.equipment])
          _.forEach(data[obj.resourceKey], (iobj) => {
            if(iobj.deviceId ===  dobj.id) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
              valueAry.push(iobj.usedPercentage);
              seriesDataAry.push([_.replace(iobj.generateTime, 'T', ' '),iobj.usedPercentage+'%'])
            }
          });
          seriesDataAry.push(['Max', Math.max(...valueAry)]);
          seriesDataAry.push(['Min', Math.min(...valueAry)]);
          const avg =  valueAry.reduce((a,b) => a+b, 0) / valueAry.length;
          seriesDataAry.push(['Avg', avg.toFixed(0)]);

          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;
          chartOptions.series[0].data = valueAry;
          chartOptions.series[0].name = dobj.equipment;

          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = dobj.equipment;
          chartOptions.yAxis = {max:100, tickInterval:20 }
          chartObj.percentMaxType = true;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.key = "chart_"+key+'_'+dkey
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } else if(obj.resourceName === 'Disk Total Used Bytes') {
          let byteVal = 'bps';
          seriesDataAry.push(["Time",dobj.equipment])
          byteVal = this.autoConvertByte(obj,data[obj.resourceKey][0].usedBytes).unit;
          _.forEach(data[obj.resourceKey], (iobj,ikey) => {
            if(iobj.deviceId ===  dobj.id) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
              valueAry.push(this.autoConvertByte(obj,iobj.usedBytes).value);
              originValueAry.push(iobj.usedBytes);
              seriesDataAry.push([_.replace(iobj.generateTime, 'T', ' '),this.autoConvertByte(obj,iobj.usedBytes).value+byteVal])
            }
          });
          console.log(valueAry);
          seriesDataAry.push(['Max', Math.max(...valueAry)+byteVal]);
          seriesDataAry.push(['Min', Math.min(...valueAry)+byteVal]);
          const avg =  valueAry.reduce((a,b) => a+b, 0) / valueAry.length;
          seriesDataAry.push(['Avg', avg.toFixed(0)+byteVal]);
          console.log(seriesDataAry);

          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;
          chartOptions.series[0].data = valueAry;
          chartOptions.series[0].name = data[obj.resourceKey][0].deviceName;

          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = dobj.equipment;
          chartObj.byteType = true;
          chartObj.byteVal = byteVal;
          chartObj.originValueAry = originValueAry;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.key = "chart_"+key+'_'+dkey
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } else if(obj.resourceName === 'Disk Used (%)') {
          let diskPartitionAry = _.groupBy(data[obj.resourceKey], 'partitionLabel');
          chartOptions.series = [];
          seriesDataAry.push(pdfPartitionName)
          
          _.forEach(diskPartitionAry, (pobj, key) => {
            let partitionVal = [];
            
            _.forEach(pobj, (disk) => {
              if(disk.deviceId === dobj.id) {
                partitionVal.push(disk.usedPercentage);
              }
              if(!partitionName.includes(key)) {
                partitionName.push(key);
                pdfPartitionName.push(key);
              }
            });
            partitionData[key] = partitionVal;

            const obj = {};
            obj.data = partitionVal;
            obj.name = key;
            if(chartOptions.series.length === 1) { obj.color= 'rgb(255,184,64)' } 
            else if(chartOptions.series.length  === 2)  { obj.color = 'red'; }
            chartOptions.series.push(obj);
          });
         
          _.forEach(data[obj.resourceKey], (iobj,ikey) => {
            if(!categoryAry.includes(_.replace(iobj.generateTime, 'T',' '))) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
            }
          });
          
          _.forEach(categoryAry, (dobj,dkey) => {
            const arrays= [];
            arrays.push(_.replace(dobj, 'T', ' '));
            _.forEach(partitionData, (robj,rkey) => {
              arrays.push(partitionData[rkey][dkey]+'%');
            })
            seriesDataAry.push(arrays);
          })

          _.forEach(mathAdd, (mobj,mkey) => {
            const array = [];
            array.push(mobj);
            _.forEach(chartOptions.series , (cobj,ckey ) => {
              if(mkey === 0) {
                array.push(Math.max(...cobj.data)+'%')
              } else if(mkey === 1) {
                array.push(Math.min(...cobj.data)+'%')
              } else if(mkey === 2) {
                const avg =  cobj.data.reduce((a,b) => a+b, 0) / cobj.data.length;
                array.push(avg.toFixed(0)+'%')
              } 
            })
            seriesDataAry.push(array);
          })
          
          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;
          chartOptions.yAxis = {max:100, tickInterval:20 }

          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = data[obj.resourceKey][0].deviceName;
          chartObj.percentMaxType = true;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.partition = partitionName;
          chartObj.gridPartition = seriesDataAry[0];
          chartObj.key = "chart_"+key+'_'+dkey;
          chartObj.gridData = partitionData;
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } else if(obj.resourceName === 'Disk Used Bytes') {
          let byteVal = 'bps';
          let diskPartitionAry = _.groupBy(data[obj.resourceKey], 'partitionLabel');

          chartOptions.series = [];
          originValueAry = [];
          seriesDataAry.push(pdfPartitionName)
          
          _.forEach(diskPartitionAry, (pobj, key) => {
            let partitionVal = [];
            let originVal = [];
            _.forEach(pobj, (disk) => {
              if(disk.deviceId === dobj.id) {
                partitionVal.push(this.autoConvertByte(obj,disk.usedBytes).value);
                originVal.push(disk.usedBytes);              
              }
              if(!partitionName.includes(key)) {
                partitionName.push(key);
                pdfPartitionName.push(key);
              }
            });
            partitionData[key] = partitionVal;
            byteVal = this.autoConvertByte(obj,pobj[0].usedBytes).unit;
            const objs = {};
            objs.data = partitionVal;
            objs.name = key;
            if(chartOptions.series.length === 1) {
              objs.color= 'rgb(255,184,64)'
            } else if(chartOptions.series.length  === 2)  {
              objs.color = 'red';
            }
            chartOptions.series.push(objs);
            originValueAry.push({data: originVal});
          });
          _.forEach(data[obj.resourceKey], (iobj) => {
            if(!categoryAry.includes(_.replace(iobj.generateTime, 'T',' '))) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
            }
          });

          _.forEach(categoryAry, (dobj,dkey) => {
            const arrays= [];
            arrays.push(_.replace(dobj, 'T', ' '));
            _.forEach(partitionData, (robj,rkey) => {
              arrays.push(partitionData[rkey][dkey]+byteVal);
            })
            seriesDataAry.push(arrays);
          })

          _.forEach(mathAdd, (mobj,mkey) => {
            const array = [];
            array.push(mobj);
            _.forEach(chartOptions.series , (cobj,ckey ) => {
              if(mkey === 0) {
                array.push(Math.max(...cobj.data)+byteVal)
              } else if(mkey === 1) {
                array.push(Math.min(...cobj.data)+byteVal)
              } else if(mkey === 2) {
                const avg =  cobj.data.reduce((a,b) => a+b, 0) / cobj.data.length;
                array.push(avg.toFixed(0)+byteVal)
              } 
            })
            seriesDataAry.push(array);
          })
          
          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;

          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = data[obj.resourceKey][0].deviceName;
          chartObj.byteType = true;
          chartObj.byteVal = byteVal;
          chartObj.originValueAry = originValueAry;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.key = "chart_"+key+'_'+dkey
          chartObj.partition = partitionName;
          chartObj.gridPartition = seriesDataAry[0];
          chartObj.gridData = partitionData;
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } else if(obj.resourceName === 'Disk I/O (%)') {
          let diskPartitionAry = _.groupBy(data[obj.resourceKey], 'partitionLabel');
          chartOptions.series = [];
          seriesDataAry.push(pdfPartitionName)
          
          _.forEach(diskPartitionAry, (pobj, key) => {
            let partitionVal = [];
            _.forEach(pobj, (disk) => {
              if(disk.deviceId === dobj.id) {
                partitionVal.push(disk.ioTimePercentage); 
              }
              if(!partitionName.includes(key)) {
                partitionName.push(key);
                pdfPartitionName.push(key);
              }
            });
            partitionData[key] = partitionVal;
            const obj = {};
            obj.data = partitionVal;
            obj.name = key;
            if(chartOptions.series.length === 1) {
              obj.color= 'rgb(255,184,64)'
            } else if(chartOptions.series.length  === 2)  {
              obj.color = 'red';
            }
            chartOptions.series.push(obj);
          });

          _.forEach(data[obj.resourceKey], (iobj) => {
            if(!categoryAry.includes(_.replace(iobj.generateTime, 'T',' '))) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
            }
          });
          _.forEach(categoryAry, (dobj,dkey) => {
            const arrays= [];
            arrays.push(_.replace(dobj, 'T', ' '));
            _.forEach(partitionData, (robj,rkey) => {
              arrays.push(partitionData[rkey][dkey]+"%");
            })
            seriesDataAry.push(arrays);
          })
          _.forEach(mathAdd, (mobj,mkey) => {
            const array = [];
            array.push(mobj);
            _.forEach(chartOptions.series , (cobj,ckey ) => {
              if(mkey === 0) {
                array.push(Math.max(...cobj.data)+"%")
              } else if(mkey === 1) {
                array.push(Math.min(...cobj.data)+"%")
              } else if(mkey === 2) {
                const avg =  cobj.data.reduce((a,b) => a+b, 0) / cobj.data.length;
                array.push(avg.toFixed(0)+"%")
              } 
            })
            seriesDataAry.push(array);
          })
          
          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;
          chartOptions.yAxis = {max:100, tickInterval:20 }

          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = data[obj.resourceKey][0].deviceName;
          chartObj.percentMaxType = true;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.partition = partitionName;
          chartObj.gridPartition = seriesDataAry[0];
          chartObj.gridData = partitionData;
          chartObj.key = "chart_"+key+'_'+dkey
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } else if(obj.resourceName === 'Disk I/O Count') {
          let diskPartitionAry = _.groupBy(data[obj.resourceKey], 'partitionLabel');

          chartOptions.series = [];
          seriesDataAry.push(pdfPartitionName)
          
          _.forEach(diskPartitionAry, (pobj, key) => {
            let partitionVal = [];
            _.forEach(pobj, (disk) => {
              if(disk.deviceId === dobj.id) {
                partitionVal.push(disk.ioTotalCnt); 
              }
              if(!partitionName.includes(key)) {
                partitionName.push(key);
                pdfPartitionName.push(key);
              }
            });
            partitionData[key] = partitionVal;
            const obj = {};
            obj.data = partitionVal;
            obj.name = key;
            if(chartOptions.series.length === 1) {
              obj.color= 'rgb(255,184,64)'
            } else if(chartOptions.series.length  === 2)  {
              obj.color = 'red';
            }
            chartOptions.series.push(obj);
          });

          _.forEach(data[obj.resourceKey], (iobj) => {
            if(!categoryAry.includes(_.replace(iobj.generateTime, 'T',' '))) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
            }
          });
          _.forEach(categoryAry, (dobj,dkey) => {
            const arrays= [];
            arrays.push(_.replace(dobj, 'T', ' '));
            _.forEach(partitionData, (robj,rkey) => {
              arrays.push(partitionData[rkey][dkey]);
            })
            seriesDataAry.push(arrays);
          })
          _.forEach(mathAdd, (mobj,mkey) => {
            const array = [];
            array.push(mobj);
            _.forEach(chartOptions.series , (cobj,ckey ) => {
              if(mkey === 0) {
                array.push(Math.max(...cobj.data))
              } else if(mkey === 1) {
                array.push(Math.min(...cobj.data))
              } else if(mkey === 2) {
                const avg =  cobj.data.reduce((a,b) => a+b, 0) / cobj.data.length;
                array.push(avg.toFixed(0))
              } 
            })
            seriesDataAry.push(array);
          })
          
          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;

          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = data[obj.resourceKey][0].deviceName;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.partition = partitionName;
          chartObj.gridPartition = seriesDataAry[0];
          chartObj.gridData = partitionData;
          chartObj.key = "chart_"+key+'_'+dkey
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } else if(obj.resourceName === 'Disk I/O Bytes') {
          let byteVal = 'bps';
          let diskPartitionAry = _.groupBy(data[obj.resourceKey], 'partitionLabel');

          chartOptions.series = [];
          originValueAry = [];
          seriesDataAry.push(pdfPartitionName)
          
          _.forEach(diskPartitionAry, (pobj, key) => {
            let partitionVal = [];
            let originVal = [];
            _.forEach(pobj, (disk) => {
              if(disk.deviceId === dobj.id) {
                partitionVal.push(this.autoConvertByte(obj,disk.ioTotalBps).value);
                originVal.push(disk.ioTotalBps);              
              }
              if(!partitionName.includes(key)) {
                partitionName.push(key);
                pdfPartitionName.push(key);
              }
            });
            partitionData[key] = partitionVal;
            byteVal = this.autoConvertByte(obj,pobj[0].ioTotalBps).unit;
            console.log(byteVal);
            const objs = {};
            objs.data = partitionVal;
            objs.name = key;
            if(chartOptions.series.length === 1) {
              objs.color= 'rgb(255,184,64)';
            } else if(chartOptions.series.length  === 2)  {
              objs.color = 'red';
            }
            chartOptions.series.push(objs);
            originValueAry.push({data: originVal});
          });

          _.forEach(data[obj.resourceKey], (iobj) => {
            if(!categoryAry.includes(_.replace(iobj.generateTime, 'T',' '))) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
            }
          });
          _.forEach(categoryAry, (dobj,dkey) => {
            const arrays= [];
            arrays.push(_.replace(dobj, 'T', ' '));
            _.forEach(partitionData, (robj,rkey) => {
              arrays.push(partitionData[rkey][dkey]+byteVal);
            })
            seriesDataAry.push(arrays);
          })
          _.forEach(mathAdd, (mobj,mkey) => {
            const array = [];
            array.push(mobj);
            _.forEach(chartOptions.series , (cobj,ckey ) => {
              if(mkey === 0) {
                array.push(Math.max(...cobj.data)+byteVal)
              } else if(mkey === 1) {
                array.push(Math.min(...cobj.data)+byteVal)
              } else if(mkey === 2) {
                const avg =  cobj.data.reduce((a,b) => a+b, 0) / cobj.data.length;
                array.push(avg.toFixed(0)+byteVal)
              } 
            })
            seriesDataAry.push(array);
          })

          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;

          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = data[obj.resourceKey][0].deviceName;
          chartObj.byteDiskType = true;
          chartObj.byteVal = byteVal;
          chartObj.originValueAry = originValueAry;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.gridPartition = seriesDataAry[0];
          chartObj.partition = partitionName;
          chartObj.gridData = partitionData;
          chartObj.key = "chart_"+key+'_'+dkey
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } else if(obj.resourceName === 'Disk Queue') {
          let diskPartitionAry = _.groupBy(data[obj.resourceKey], 'partitionLabel');
          chartOptions.series = [];
          seriesDataAry.push(pdfPartitionName)

          _.forEach(diskPartitionAry, (pobj, key) => {
            let partitionVal = [];
            
            _.forEach(pobj, (disk) => {
              if(disk.deviceId === dobj.id) {
                partitionVal.push(disk.ioQueueDepth);
              }
              if(!partitionName.includes(key)) {
                partitionName.push(key);
                pdfPartitionName.push(key);
              }
            });
            partitionData[key] = partitionVal;

            const obj = {};
            obj.data = partitionVal;
            obj.name = key;
            if(chartOptions.series.length === 1) { obj.color= 'rgb(255,184,64)' } 
            else if(chartOptions.series.length  === 2)  { obj.color = 'red'; }
            chartOptions.series.push(obj);
          });
         

          _.forEach(data[obj.resourceKey], (iobj) => {
            if(!categoryAry.includes(_.replace(iobj.generateTime, 'T',' '))) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
            }
          });
          _.forEach(categoryAry, (dobj,dkey) => {
            const arrays= [];
            arrays.push(_.replace(dobj, 'T', ' '));
            _.forEach(partitionData, (robj,rkey) => {
              arrays.push(partitionData[rkey][dkey]);
            })
            seriesDataAry.push(arrays);
          })
          _.forEach(mathAdd, (mobj,mkey) => {
            const array = [];
            array.push(mobj);
            _.forEach(chartOptions.series , (cobj,ckey ) => {
              if(mkey === 0) {
                array.push(Math.max(...cobj.data))
              } else if(mkey === 1) {
                array.push(Math.min(...cobj.data))
              } else if(mkey === 2) {
                const avg =  cobj.data.reduce((a,b) => a+b, 0) / cobj.data.length;
                array.push(avg.toFixed(0))
              } 
            })
            seriesDataAry.push(array);
          })
          
          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;

          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = data[obj.resourceKey][0].deviceName;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.partition = partitionName;
          chartObj.gridPartition = seriesDataAry[0];
          chartObj.key = "chart_"+key+'_'+dkey;
          chartObj.gridData = partitionData;
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } else if(obj.resourceName === 'Network Traffic') {
          let byteVal = 'bps';
          chartOptions.series = [];
          originValueAry = [];
          
          _.forEach(data, (pobj, key) => {
            if(key === 'nic') {
              let partitionRx = [];
              let partitionTx = [];
              let originRxVal = [];
              let originTxVal = [];
              let totalVal = [];
              let gridTotal = [];

              _.forEach(pobj, (network) => {
                if(network.deviceId === dobj.id) {
                  partitionRx.push(this.autoConvertByte(obj,network.inBytesPerSec).value);
                  partitionTx.push(this.autoConvertByte(obj,network.outBytesPerSec).value);
                  totalVal.push(Number(parseFloat(this.autoConvertByte(obj,network.inBytesPerSec).value+ this.autoConvertByte(obj,network.outBytesPerSec).value).toFixed(2)));
                  originRxVal.push(network.inBytesPerSec);    
                  originTxVal.push(network.outBytesPerSec);      
                  gridTotal.push(network.inBytesPerSec+network.outBytesPerSec)    
                }
              });
              partitionName.push('RX','TX','Total');
              const netObj = {};
              netObj.RX= partitionRx;
              netObj.TX = partitionTx;
              netObj.Total = totalVal
              partitionData = netObj;
              gridTotalAry.push(partitionRx,partitionTx)
              byteVal = this.autoConvertByte(obj,pobj[0].inBytesPerSec).unit;
              
              chartOptions.series.push({data: partitionRx, name: 'RX' } , {data: partitionTx, name: 'TX' , color: 'rgb(255, 184, 64)'});
              originValueAry.push({data: originRxVal}, {data: originTxVal}, { data: gridTotal});
              }
            });
            seriesDataAry.push(["Time", partitionName[0], partitionName[1], partitionName[2]])
            let total = null;
          _.forEach(data[obj.resourceKey], (iobj,ikey) => {
            if(!categoryAry.includes(_.replace(iobj.generateTime, 'T',' '))) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
              total = partitionData.RX[ikey] + partitionData.TX[ikey];
              seriesDataAry.push([_.replace(iobj.generateTime, 'T', ' '), 
                                  partitionData.RX[ikey]+byteVal , 
                                  partitionData.TX[ikey]+byteVal, 
                                  Number.parseFloat(total).toFixed(2)+byteVal ]);
            }
          });

          const avg1 = partitionData.RX.reduce((a,b) => a+b, 0) / partitionData.RX.length;
          const avg2 = partitionData.TX.reduce((a,b) => a+b, 0) / partitionData.TX.length;
          seriesDataAry.push(['Max', Math.max(...partitionData.RX)+byteVal, Math.max(...partitionData.TX)+byteVal,Number(Math.max(...partitionData.RX)+Math.max(...partitionData.TX)).toFixed(2)+byteVal])
          seriesDataAry.push(['Min', Math.min(...partitionData.RX)+byteVal, Math.min(...partitionData.TX)+byteVal,Number(Math.min(...partitionData.RX)+Math.min(...partitionData.TX)).toFixed(2)+byteVal])
          seriesDataAry.push(['Avg', Number(avg1.toFixed(2))+byteVal,Number(avg2.toFixed(2))+byteVal, Number(avg1+avg2).toFixed(2)+byteVal  ])

          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;

          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = data[obj.resourceKey][0].deviceName;
          chartObj.byteNetworkType = true;
          chartObj.byteVal = byteVal;
          chartObj.originValueAry = originValueAry;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.partition = partitionName;
          chartObj.gridPartition = seriesDataAry[0];
          chartObj.gridData = partitionData;
          chartObj.key = "chart_"+key+'_'+dkey
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } else if(obj.resourceName === 'Network PPS') {
          let byteVal = 'bps';
          chartOptions.series = [];
          originValueAry = [];
        
          _.forEach(data, (pobj, key) => {
            if(key === 'nic') {
              let partitionRx = [];
              let partitionTx = [];
              let originRxVal = [];
              let originTxVal = [];
              let totalVal = [];
              let gridTotal = [];

              _.forEach(pobj, (network) => {
                if(network.deviceId === dobj.id) {
                  partitionRx.push(this.autoConvertByte(obj,network.inPktsPerSec).value);
                  partitionTx.push(this.autoConvertByte(obj,network.outPktsPerSec).value);
                  totalVal.push(Number(parseFloat(this.autoConvertByte(obj,network.inBytesPerSec).value+ this.autoConvertByte(obj,network.outBytesPerSec).value).toFixed(2)));
                  originRxVal.push(network.inPktsPerSec);    
                  originTxVal.push(network.outPktsPerSec);
                  gridTotal.push(network.inPktsPerSec+network.outPktsPerSec)          
                }
              });
              partitionName.push('RX','TX','Total');
              const netObj = {};
              netObj.RX= partitionRx;
              netObj.TX = partitionTx;
              netObj.Total = totalVal;
              partitionData = netObj;
              byteVal = this.autoConvertByte(obj,pobj[0].inPktsPerSec).unit;
            
              chartOptions.series.push({data: partitionRx, name: 'RX' } , {data: partitionTx, name: 'TX' , color: 'rgb(255, 184, 64)'});
              originValueAry.push({data: originRxVal}, {data: originTxVal}, { data: gridTotal});
              }
            });
          
            seriesDataAry.push(["Time", partitionName[0], partitionName[1], partitionName[2]])
            let total = null;
          _.forEach(data[obj.resourceKey], (iobj,ikey) => {
            if(!categoryAry.includes(_.replace(iobj.generateTime, 'T',' '))) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
              total = partitionData.RX[ikey] + partitionData.TX[ikey];
              seriesDataAry.push([_.replace(iobj.generateTime, 'T', ' '), 
                                  partitionData.RX[ikey]+byteVal , 
                                  partitionData.TX[ikey]+byteVal, 
                                  Number.parseFloat(total).toFixed(2)+byteVal ]);
            }
          });
          const avg1 = partitionData.RX.reduce((a,b) => a+b, 0) / partitionData.RX.length;
          const avg2 = partitionData.TX.reduce((a,b) => a+b, 0) / partitionData.TX.length;
          seriesDataAry.push(['Max', Math.max(...partitionData.RX)+byteVal, Math.max(...partitionData.TX)+byteVal,Number(Math.max(...partitionData.RX)+Math.max(...partitionData.TX)).toFixed(2)+byteVal])
          seriesDataAry.push(['Min', Math.min(...partitionData.RX)+byteVal, Math.min(...partitionData.TX)+byteVal,Number(Math.min(...partitionData.RX)+Math.min(...partitionData.TX)).toFixed(2)+byteVal])
          seriesDataAry.push(['Avg', Number(avg1.toFixed(2))+byteVal,Number(avg2.toFixed(2))+byteVal, Number(avg1+avg2).toFixed(2)+byteVal  ])

          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;

          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = data[obj.resourceKey][0].deviceName;
          chartObj.byteNetworkType = true;
          chartObj.byteVal = byteVal;
          chartObj.originValueAry = originValueAry;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.partition = partitionName;
          chartObj.gridPartition = seriesDataAry[0];
          chartObj.gridData = partitionData;
          chartObj.key = "chart_"+key+'_'+dkey
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } else if(obj.resourceName === 'NIC Discards') {
          let byteVal = 'pps';
          chartOptions.series = [];
          originValueAry = [];
        
          _.forEach(data, (pobj, key) => {
            if(key === 'nic') {
              let partitionRx = [];
              let partitionTx = [];
              let originRxVal = [];
              let originTxVal = [];
              let totalVal = [];
              let gridTotal = [];

              _.forEach(pobj, (network) => {
                if(network.deviceId === dobj.id) {
                  partitionRx.push(this.autoConvertByte(obj,network.inPktsPerSec).value);
                  partitionTx.push(this.autoConvertByte(obj,network.outPktsPerSec).value);
                  totalVal.push(Number(parseFloat(this.autoConvertByte(obj,network.inBytesPerSec).value+ this.autoConvertByte(obj,network.outBytesPerSec).value).toFixed(2)));
                  originRxVal.push(network.inPktsPerSec);    
                  originTxVal.push(network.outPktsPerSec);   
                  gridTotal.push(network.inPktsPerSec+network.outPktsPerSec)        
                }
              });
              partitionName.push('RX','TX','Total');
              const netObj = {};
              netObj.RX= partitionRx;
              netObj.TX = partitionTx;
              netObj.Total = totalVal;
              partitionData = netObj;
              byteVal = this.autoConvertByte(obj,pobj[0].inPktsPerSec).unit;
            
              chartOptions.series.push({data: partitionRx, name: 'RX' } , {data: partitionTx, name: 'TX' , color: 'rgb(255, 184, 64)'});
              originValueAry.push({data: originRxVal}, {data: originTxVal}, { data: gridTotal});
              }
            });
          
            seriesDataAry.push(["Time", partitionName[0], partitionName[1], partitionName[2]])
            let total = null;
          _.forEach(data[obj.resourceKey], (iobj,ikey) => {
            if(!categoryAry.includes(_.replace(iobj.generateTime, 'T',' '))) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
              total = partitionData.RX[ikey] + partitionData.TX[ikey];
              seriesDataAry.push([_.replace(iobj.generateTime, 'T', ' '), 
                                  partitionData.RX[ikey]+byteVal , 
                                  partitionData.TX[ikey]+byteVal, 
                                  Number.parseFloat(total).toFixed(2)+byteVal ]);
            }
          });
          const avg1 = partitionData.RX.reduce((a,b) => a+b, 0) / partitionData.RX.length;
          const avg2 = partitionData.TX.reduce((a,b) => a+b, 0) / partitionData.TX.length;
          seriesDataAry.push(['Max', Math.max(...partitionData.RX)+byteVal, Math.max(...partitionData.TX)+byteVal,Number(Math.max(...partitionData.RX)+Math.max(...partitionData.TX)).toFixed(2)+byteVal])
          seriesDataAry.push(['Min', Math.min(...partitionData.RX)+byteVal, Math.min(...partitionData.TX)+byteVal,Number(Math.min(...partitionData.RX)+Math.min(...partitionData.TX)).toFixed(2)+byteVal])
          seriesDataAry.push(['Avg', Number(avg1.toFixed(2))+byteVal,Number(avg2.toFixed(2))+byteVal, Number(avg1+avg2).toFixed(2)+byteVal  ])

          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;

          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = data[obj.resourceKey][0].deviceName;
          chartObj.byteNetworkSecondType = true;
          chartObj.byteVal = byteVal;
          chartObj.originValueAry = originValueAry;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.partition = partitionName;
          chartObj.gridPartition = seriesDataAry[0];
          chartObj.gridData = partitionData;
          chartObj.key = "chart_"+key+'_'+dkey
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } else if(obj.resourceName === 'NIC Errors') {
          let byteVal = 'pps';
          chartOptions.series = [];
          originValueAry = [];
        
          _.forEach(data, (pobj, key) => {
            if(key === 'nic') {
              let partitionRx = [];
              let partitionTx = [];
              let originRxVal = [];
              let originTxVal = [];
              let totalVal = [];
              let gridTotal = [];

              _.forEach(pobj, (network) => {
                if(network.deviceId === dobj.id) {
                  partitionRx.push(this.autoConvertByte(obj,network.inBytesPerSec).value);
                  partitionTx.push(this.autoConvertByte(obj,network.outBytesPerSec).value);
                  totalVal.push(Number(parseFloat(this.autoConvertByte(obj,network.inBytesPerSec).value+ this.autoConvertByte(obj,network.outBytesPerSec).value).toFixed(2)));
                  originRxVal.push(network.inBytesPerSec);    
                  originTxVal.push(network.outBytesPerSec);   
                  gridTotal.push(network.inBytesPerSec+network.outBytesPerSec)       
                }
              });
              partitionName.push('RX','TX','Total');
              const netObj = {};
              netObj.RX= partitionRx;
              netObj.TX = partitionTx;
              netObj.Total = totalVal;
              partitionData = netObj;
              byteVal = this.autoConvertByte(obj,pobj[0].inBytesPerSec).unit;
            
              chartOptions.series.push({data: partitionRx, name: 'RX' } , {data: partitionTx, name: 'TX' , color: 'rgb(255, 184, 64)'});
              originValueAry.push({data: originRxVal}, {data: originTxVal}, { data: gridTotal});
              }
            });
          
            seriesDataAry.push(["Time", partitionName[0], partitionName[1], partitionName[2]])
            let total = null;
          _.forEach(data[obj.resourceKey], (iobj,ikey) => {
            if(!categoryAry.includes(_.replace(iobj.generateTime, 'T',' '))) {
              categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
              total = partitionData.RX[ikey] + partitionData.TX[ikey];
              seriesDataAry.push([_.replace(iobj.generateTime, 'T', ' '), 
                                  partitionData.RX[ikey]+byteVal , 
                                  partitionData.TX[ikey]+byteVal, 
                                  Number.parseFloat(total).toFixed(2)+byteVal ]);
            }
          });
          const avg1 = partitionData.RX.reduce((a,b) => a+b, 0) / partitionData.RX.length;
          const avg2 = partitionData.TX.reduce((a,b) => a+b, 0) / partitionData.TX.length;
          seriesDataAry.push(['Max', Math.max(...partitionData.RX)+byteVal, Math.max(...partitionData.TX)+byteVal,Number(Math.max(...partitionData.RX)+Math.max(...partitionData.TX)).toFixed(2)+byteVal])
          seriesDataAry.push(['Min', Math.min(...partitionData.RX)+byteVal, Math.min(...partitionData.TX)+byteVal,Number(Math.min(...partitionData.RX)+Math.min(...partitionData.TX)).toFixed(2)+byteVal])
          seriesDataAry.push(['Avg', Number(avg1.toFixed(2))+byteVal,Number(avg2.toFixed(2))+byteVal, Number(avg1+avg2).toFixed(2)+byteVal  ])

          chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+dobj.equipment;
          chartOptions.xAxis.categories = categoryAry;

          chartObj.resourceName = obj.resourceName;
          chartObj.deviceName = data[obj.resourceKey][0].deviceName;
          chartObj.byteNetworkSecondType = true;
          chartObj.byteVal = byteVal;
          chartObj.originValueAry = originValueAry;
          chartObj.option = chartOptions;
          chartObj.seriesData = seriesDataAry;
          chartObj.gridPartition = seriesDataAry[0];
          chartObj.partition = partitionName;
          chartObj.gridData = partitionData;
          chartObj.key = "chart_"+key+'_'+dkey
          chartData['chartOptions'+key+'_'+dkey] = chartObj;
        } 
        // 시간 간격 조절 
        let categoryLength = '';
        if(categoryAry.length <= 24) { categoryLength = 2;} 
        else if(categoryAry.length > 24 && categoryAry.length <= 48) { categoryLength = 4; }
        else if(categoryAry.length > 48 && categoryAry.length <= 100) { categoryLength = 8; } 
        else { categoryLength = 100;}
        chartOptions.xAxis.tickInterval = categoryLength;
       })
      }); 
      console.log(chartData);
      // 초기화
      for(var k=0; k< this.state.totalKey.length; k++) {
        seriesGrid.splice(0, 1);
        seriesColumn.splice(0, 1);
      }
      this.setState({
        chartData:chartData,
        totalKey: [],
        totalData:[],
        chartColumnDefs:[],
        loader:false
      })
}

/* line , bar 변경 */
changeChartType = (e, obj, i) => {
  let chartOptions = _.cloneDeep(this.state.chartData);
  chartOptions[i].option.chart.type = e.target.value;

  this.setState({ chartData: chartOptions });
}

/* 최대치 기준 */
maxStandred = (e, obj , i) => {
  let chartOptions = _.cloneDeep(this.state.chartData);
  if(e.target.checked === true) {
    chartOptions[i].option.yAxis.max = Math.max(...chartOptions[i].option.series[0].data);
    chartOptions[i].option.yAxis.tickInterval = null;
  } else {
    chartOptions[i].option.yAxis.max = 100;
    chartOptions[i].option.yAxis.tickInterval = 20;
  }
  this.setState({ chartData: chartOptions });
}
/* 타입 변환 */
changeByteType = (e, obj, i) => {
  const { totalKey } = this.state;
  let chartOptions = _.cloneDeep(this.state.chartData);
  let valueAry = [];
  let valueGridAry = {};

  if(chartOptions[i].resourceName === 'Memory Bytes'       || chartOptions[i].resourceName === 'Memory Buffers Bytes' ||
    chartOptions[i].resourceName === 'Memory Cached Bytes' || chartOptions[i].resourceName === 'Memory Shared Bytes' || 
    chartOptions[i].resourceName === 'Memory Swap Bytes'   || chartOptions[i].resourceName === 'Disk Total Bytes' ||
    chartOptions[i].resourceName === 'Disk Total Used Bytes') {
    _.forEach(chartOptions[i].originValueAry, (val) => {
      valueAry.push(this.changeByteVal(e.target.value, val).value);
    });
    if(totalKey.includes(obj.key)) {
      obj.byteVal = e.target.value;
      obj.option.series[0].data = valueAry;
    } else {
      chartOptions[i].byteVal = e.target.value;
      chartOptions[i].option.series[0].data = valueAry;
    }
    chartOptions[i].seriesData = this.gridDataChage(e, obj, i, valueAry);  
    
  } else if(chartOptions[i].resourceName === 'Disk Used Bytes' || chartOptions[i].resourceName === 'Disk I/O Bytes' || 
            chartOptions[i].resourceName === 'Network Traffic' || chartOptions[i].resourceName === 'Network PPS' || 
            chartOptions[i].resourceName === 'NIC Discards'    || chartOptions[i].resourceName === 'NIC Errors') {
    _.forEach(chartOptions[i].originValueAry, (val, j) => {
      let partitionVal = [];
      _.forEach(val.data, (disk) => {
        partitionVal.push(this.changeByteVal(e.target.value, disk).value);
      });
      valueAry.push({data: partitionVal, name: obj.partition[j]});
      valueGridAry[obj.partition[j]] = partitionVal;
    });

    if(totalKey.includes(obj.key)) {
      obj.byteVal = e.target.value;
      _.forEach(valueAry, (vobj,vkey) => {
        if(vobj.name === 'Total') {
          const totalKey = valueAry.indexOf("Total");
          valueAry.splice(totalKey,1);
        }
      })
      obj.option.series = valueAry;
      obj.gridData = valueGridAry;
    } else {
      chartOptions[i].byteVal = e.target.value;
      chartOptions[i].option.series = valueAry;
    }
    chartOptions[i].seriesData = this.gridDataChage(e, obj, i, valueGridAry);
  }

  
  if(totalKey.includes(obj.key)) {
    this.chartTotalCheckSecond(e,i,obj,valueGridAry);
  } else {
    this.setState({ chartData: chartOptions });
  }
}

/* PDF Grid Data 변화 */
gridDataChage = ( e, obj, i, valueGridAry ) => {
  const gridData = [];
  let chartOptions = _.cloneDeep(this.state.chartData);
  console.log(valueGridAry);

  
  if(chartOptions[i].resourceName === 'Network Traffic'   || chartOptions[i].resourceName === 'Network PPS' ||
     chartOptions[i].resourceName === 'NIC Discards'   || chartOptions[i].resourceName === 'NIC Errors' ) {
      gridData.push(obj.gridPartition);
    _.forEach(obj.option.xAxis.categories, (pobj,pkey) => {
      const array = [];
      array.push(_.replace(pobj, 'T', ' '));
  
      _.forEach(valueGridAry, (vobj,vkey) => {
        array.push(valueGridAry[vkey][pkey]+e.target.value);
      })
      gridData.push(array)
    })
    
  
    const avg1 = valueGridAry.RX.reduce((a,b) => a+b, 0) / valueGridAry.RX.length;
    const avg2 = valueGridAry.TX.reduce((a,b) => a+b, 0) / valueGridAry.TX.length;
    gridData.push(['Max', Math.max(...valueGridAry.RX)+e.target.value, Math.max(...valueGridAry.TX)+e.target.value,Number(Math.max(...valueGridAry.RX)+Math.max(...valueGridAry.TX)).toFixed(2)+e.target.value])
    gridData.push(['Min', Math.min(...valueGridAry.RX)+e.target.value, Math.min(...valueGridAry.TX)+e.target.value,Number(Math.min(...valueGridAry.RX)+Math.min(...valueGridAry.TX)).toFixed(2)+e.target.value])
    gridData.push(['Avg', Number(avg1.toFixed(2))+e.target.value,  Number(avg2.toFixed(2))+e.target.value, Number(avg1+avg2).toFixed(2) +e.target.value  ])
  console.log(Number(avg1+avg2).toFixed(2) +e.target.value);
  } else if(chartOptions[i].resourceName === 'Disk Used Bytes' || chartOptions[i].resourceName === "Disk I/O Bytes") {
    const mathAdd = ['Max' , 'Min' , 'Avg']
    gridData.push(obj.gridPartition);
    _.forEach(obj.option.xAxis.categories, (pobj,pkey) => {
      const array = [];
      array.push(_.replace(pobj, 'T', ' '));
  
      _.forEach(valueGridAry, (vobj,vkey) => {
        array.push(valueGridAry[vkey][pkey]+e.target.value);
      })
      gridData.push(array)
    })

    _.forEach(mathAdd, (mobj,mkey) => {
      const array = [];
      array.push(mobj);
      _.forEach(valueGridAry , (cobj,ckey ) => {
        if(mkey === 0) {
          array.push(Math.max(...valueGridAry[ckey])+e.target.value)
        } else if(mkey === 1) {
          array.push(Math.min(...valueGridAry[ckey])+e.target.value)
        } else if(mkey === 2) {
          const avg =  valueGridAry[ckey].reduce((a,b) => a+b, 0) / valueGridAry[ckey].length;
          array.push(avg.toFixed(0)+e.target.value)
        } 
      })
      gridData.push(array);
    })
    
  } else if(chartOptions[i].resourceName === 'Disk Total Used Bytes'      || chartOptions[i].resourceName === 'Memory Bytes' || 
            chartOptions[i].resourceName === 'Memory Buffers Bytes'       || chartOptions[i].resourceName === 'Memory Cached Bytes' || 
            chartOptions[i].resourceName === 'Memory Shared Bytes'        || chartOptions[i].resourceName === 'Memory Swap Bytes')  {
    gridData.push(['Time', obj.deviceName]);
    
    _.forEach(obj.option.xAxis.categories, (pobj,pkey) => { 
      gridData.push([pobj,Math.sqrt(Math.pow(valueGridAry[pkey],2))+e.target.value])
    })
    gridData.push(['Max', Math.max(...valueGridAry)+e.target.value]);
    gridData.push(['Min', Math.min(...valueGridAry)+e.target.value]);
    const avg =  valueGridAry.reduce((a,b) => a+b, 0) / valueGridAry.length;
    gridData.push(['Avg', avg.toFixed(0)+e.target.value]);
  }

  console.log(gridData);
  obj.seriesData = gridData;
  return gridData;
}

/* 단위 자동 변경 */
autoConvertByte(obj,size, decimals = 2) {
  let result = {};

  if (size === 0) { 
    result.value = 0;
    return result;
  }
  const dm = decimals < 0 ? 0 : decimals;
    if(obj.resourceName === 'NIC Discards' || obj.resourceName === 'NIC Errors') {
      const k = 2048;
      const sizes = ['Kpps', 'Mpps', 'Gpps', 'Tpps', 'Ppps', 'Epps', 'Zpps', 'Ypps'];
      const i = Math.floor(Math.log(size) / Math.log(k));

      result.value = parseFloat((size / Math.pow(k, i)).toFixed(dm));
      result.unit = sizes[i];
    } else if(obj.resourceName === 'Network Traffic' || obj.resourceName === 'Network PPS') {
      const k = 2048;
      const sizes = ['Kbps', 'Mbps', 'Gbps', 'Tbps', 'Pbps', 'Ebps', 'Zbps', 'Ybps'];
      const i = Math.floor(Math.log(size) / Math.log(k));
  
      result.value = parseFloat((size / Math.pow(k, i)).toFixed(dm));
      result.unit = sizes[i];
    } else if(obj.resourceName === 'Disk I/O Bytes') {
      const k = 1024;
      const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s', 'PB/s', 'EB/s', 'ZB/s', 'YB/s'];
      const i = Math.floor(Math.log(size) / Math.log(k));
      result.value = parseFloat((size / Math.pow(k, i)).toFixed(dm));
      result.unit = sizes[i];
    } else {
      const k = 1024;  
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      const i = Math.floor(Math.log(size) / Math.log(k));

      result.value = parseFloat((size / Math.pow(k, i)).toFixed(dm));
      result.unit = sizes[i];
    }
    
  return result;
};

/* bytes 단위 변경 */
changeByteVal(type, size, decimals = 2) {
  let result = {},
  selectFix = 0,
  selectVal = 0;

  const dm = decimals < 0 ? 0 : decimals;

  if (size === 0) return '0'; 
  else {
    if(type == 'bps' || type == 'pps') {
      selectVal = 8;
    } else if(type == 'B' || type == 'B/s') {
      selectVal = 1;
    } else if(type == 'KB' || type == 'KB/s' || type == 'Kbps' || type == 'Kpps') {
      selectVal = 1024;
      selectFix = 3;
    } else if(type == 'MB' || type == 'MB/s' || type == 'Mbps' || type == 'Mpps') {
      selectVal = 1048576;
      selectFix = 6;
    } else if(type == 'GB' || type == 'GB/s' || type == 'Gbps' || type == 'Gpps') {
      selectVal = 1073741824;
      selectFix = 9;
    }

    if(selectVal < 10) {
      size = parseFloat(size * selectVal); 
    } else {
      selectFix = size / selectVal > 1 ? 2 : selectFix;
      size = size / selectVal === 0 ? 0 : parseFloat((size / selectVal)).toFixed(selectFix);
    }
    size = parseFloat(size).toFixed(dm);
    result.value = Number(size);
  }
  return result;
}

/* 차트 통계 */
chartTotalCheck = (e, obj , i) => {
  const { totalKey  } = this.state; 
  let chartOptions = _.cloneDeep(this.state.chartData);
  console.log(obj);

  if(totalKey.length >= 0 && !totalKey.includes(obj.key)) {
  const timeChart = [];
  _.forEach(obj.option.xAxis.categories, (pobj) => {
    timeChart.push(pobj)
  })

  if(!timeChart.includes('Max')) {
    timeChart.push('Max')
    timeChart.push('Min')
    timeChart.push('Avg')
  }

  const data = [];
  const gridDatas = [];
  // 초기화 변수
  let dataLength = 0;
  let gridDataLength = 0;
  if(obj.gridData === undefined) {
    _.forEach(obj.option.series, (dobj) => {
        data.push(dobj.data)
    })
    dataLength = data[0].length
  } else {
    console.log(obj.gridData);
    _.forEach(obj.gridData, (dobj) => {
      gridDatas.push(dobj)
    })
    gridDataLength = gridDatas[0].length
  }
  console.log(gridDatas);
  
  let maxVal = '';
  let minVal = '';
  let maxValAry = {};
  let minValAry = {};
  /* 최대값, 최소값, 평균 */
  if(obj.option.series.length === 1 ) {
    data[0].push(Math.max(...data[0]))
    data[0].push(Math.min(...data[0]))
    const avg = data[0].reduce((a,b) => a+b, 0) / data[0].length;
    data[0].push(Number(avg.toFixed(0)))
    maxVal = Math.max(...data[0])
    minVal = Math.min(...data[0])
  } else {
    for(var w=0; w < obj.partition.length; w++) {
      gridDatas[w].push(Math.max(...gridDatas[w]))
      gridDatas[w].push(Math.min(...gridDatas[w]))
      const avg = gridDatas[w].reduce((a,b) => a+b, 0) / gridDatas[w].length;
      gridDatas[w].push(Number(avg.toFixed(0)))
      maxValAry[obj.partition[w]] = Math.max(...gridDatas[w])
      minValAry[obj.partition[w]] = Math.min(...gridDatas[w])
    }
  }
  console.log(data);
  console.log(gridDatas);
  
  if(chartOptions[i].resourceName === 'CPU Processor (%)'    || chartOptions[i].resourceName === 'CPU Context Switch' || 
    chartOptions[i].resourceName === 'CPU Run Queue'         || chartOptions[i].resourceName === 'Load Avg'           || 
    chartOptions[i].resourceName === 'Disk Total Used Bytes' || chartOptions[i].resourceName === 'Disk Total Used (%)' || 
    chartOptions[i].resourceName === 'Memory Used (%)'       || chartOptions[i].resourceName === 'Memory Bytes' ||
    chartOptions[i].resourceName === 'Memory Buffers (%)'    || chartOptions[i].resourceName === 'Memory Buffers Bytes' ||
    chartOptions[i].resourceName === 'Memory Cached (%)'     || chartOptions[i].resourceName === 'Memory Cached Bytes' ||
    chartOptions[i].resourceName === 'Memory Shared (%)'     || chartOptions[i].resourceName === 'Memory Shared Bytes' ||
    chartOptions[i].resourceName === 'Memory Swap (%)'       || chartOptions[i].resourceName === 'Memory Swap Bytes' || 
    chartOptions[i].resourceName === 'Memory Pagefault') {
    const array = [];
    _.forEach(obj.option.series, (sobj) => {
      _.forEach(sobj.data , (tobj, tkey) => {
        const obj = {};
        obj.time = timeChart[tkey];
        obj.value = tobj
        array.push(obj);
      })
    })
    seriesGrid.push(array)
    console.log(array);
    // chartOptions[i].seriesData=array;

    const columnDefs = [
      {headerName:'시간' ,field:'time',maxWidth:180, cellStyle: { textAlign: 'center' } },
      {headerName: obj.deviceName ,type: 'rightAligned', headerClass: "grid-cell-left", 
      cellStyle: params => this.chartRowColor(params,maxVal,minVal), 
      valueFormatter: params =>  {
        if(obj.option.yAxis.max !== undefined) {
          return params.data.value+' '+'%' 
        } else if(obj.byteVal !== undefined) {
          return params.data.value+' '+obj.byteVal
        } else {
          return params.data.value
        }
      }}
    ]
    seriesColumn.push(columnDefs)
    
  } else if(chartOptions[i].resourceName === 'Disk Used (%)'   || chartOptions[i].resourceName === 'Disk Used Bytes'  ||
            chartOptions[i].resourceName === 'Disk I/O (%)'    || chartOptions[i].resourceName === 'Disk I/O Count' ||
            chartOptions[i].resourceName === 'Disk I/O Bytes'  || chartOptions[i].resourceName === 'Disk Queue' || 
            chartOptions[i].resourceName === 'CPU Used (%)'    || chartOptions[i].resourceName === 'Network Traffic' || 
            chartOptions[i].resourceName === 'Network PPS'     || chartOptions[i].resourceName === 'NIC Discards'      || 
            chartOptions[i].resourceName === 'NIC Errors' ) {
    const array = [];
    _.forEach(timeChart, (tobj,tkey) => {
      const gridObj = {};
      gridObj.time= tobj
      _.forEach(obj.gridData, (dobj,dkey) => {
        gridObj[dkey] = dobj[tkey];
      })
      array.push(gridObj);
    })
    seriesGrid.push(array)

    const columnDefs=[]
    columnDefs.push({headerName:'시간' ,field:'time',maxWidth:180, cellStyle: { textAlign: 'center' }})
    _.forEach(obj.partition , (pobj,pkey) => {
      columnDefs.push({
        headerName:pobj,
        cellStyle: params => this.chartRowColor(params,maxVal,minVal,pobj,maxValAry,minValAry), 
        valueFormatter: params => {
        if(obj.byteVal !== undefined) {
          return  params.data[pobj]+' '+obj.byteVal
        } else if(obj.option.yAxis.max !== undefined) {
          return params.data[pobj]+' '+'%'
        } else {
          return params.data[pobj]
        }
      },
        type: 'rightAligned', 
        headerClass: "grid-cell-left" 
      })
    })
    seriesColumn.push(columnDefs)
  } 
  
  
  this.setState({ 
    totalKey : totalKey.concat(obj.key), 
    totalData: seriesGrid,
    chartColumnDefs: seriesColumn,
    chartData: chartOptions
  })
  /* 데이터 초기화 */
  if(dataLength > 0) {
    for(var u=0; u< data.length; u++) {
      data[u].length=dataLength
    }
  }
  if(gridDataLength > 0) {
    for(var k=0; k < gridDatas.length; k++) {
      gridDatas[k].length= gridDataLength;
    }
  }
} 
  
  else {
    const countKey = totalKey.indexOf(obj.key)
    this.setState({
      totalKey : totalKey.filter(totalKey => totalKey !== obj.key),
    })
    seriesGrid.splice(countKey, 1)
    seriesColumn.splice(countKey, 1)
  }
 }

/* 단위 변환 시 통계 수치 */
chartTotalCheckSecond = (e,i,obj,valueAry) => {
  console.log(obj);
  const { totalKey  } = this.state; 
  let chartOptions = _.cloneDeep(this.state.chartData);
 

  if(totalKey.length >= 0 && totalKey.includes(obj.key)) {
    const countKey = totalKey.indexOf(obj.key)
    _.forEach(obj.partition, (iobj,ikey) => {
      console.log(iobj);
      if(iobj === "Time") {
        const timeKey = obj.partition.indexOf("Time");
        obj.partition.splice(timeKey,1);
      }
    })
    
  const timeChart = [];
  _.forEach(obj.option.xAxis.categories, (pobj) => {
    timeChart.push(pobj)
  })

  if(!timeChart.includes('Max')) {
    timeChart.push('Max')
    timeChart.push('Min')
    timeChart.push('Avg')
  }
  const data = [];
  const gridDatas = [];
  // 초기화 변수
  let dataLength = 0;
  let gridDataLength = 0;

  if(obj.gridData === undefined) {
    _.forEach(obj.option.series, (dobj) => {
        data.push(dobj.data)
    })
    dataLength = data[0].length
  } else {
    _.forEach(obj.gridData, (dobj) => {
      gridDatas.push(dobj)
    })
    gridDataLength = gridDatas[0].length
  }
  
  
  let maxVal = '';
  let minVal = '';
  let maxValAry = {};
  let minValAry = {};
  /* 최대값, 최소값, 평균 */
  if(obj.option.series.length === 1 ) {
    data[0].push(Math.max(...data[0]))
    data[0].push(Math.min(...data[0]))
    const avg = data[0].reduce((a,b) => a+b, 0) / data[0].length;
    data[0].push(Number(avg.toFixed(0)))
    maxVal = Math.max(...data[0])
    minVal = Math.min(...data[0])
  } else {
    for(var w=0; w < obj.partition.length; w++) {
      gridDatas[w].push(Math.max(...gridDatas[w]))
      gridDatas[w].push(Math.min(...gridDatas[w]))
      const avg = gridDatas[w].reduce((a,b) => a+b, 0) / gridDatas[w].length;
      gridDatas[w].push(Number(avg.toFixed(0)))
      maxValAry[obj.partition[w]] = Math.max(...gridDatas[w])
      minValAry[obj.partition[w]] = Math.min(...gridDatas[w])
    }
  }
  
  
  if(chartOptions[i].resourceName === 'CPU Processor (%)'     || chartOptions[i].resourceName === 'CPU Context Switch' || 
    chartOptions[i].resourceName  === 'CPU Run Queue'         || chartOptions[i].resourceName === 'Load Avg'           || 
    chartOptions[i].resourceName  === 'Disk Total Used Bytes' || chartOptions[i].resourceName === 'Disk Total Used (%)' || 
    chartOptions[i].resourceName  === 'Memory Used (%)'       || chartOptions[i].resourceName === 'Memory Bytes' ||
    chartOptions[i].resourceName  === 'Memory Buffers (%)'    || chartOptions[i].resourceName === 'Memory Buffers Bytes' ||
    chartOptions[i].resourceName  === 'Memory Cached (%)'     || chartOptions[i].resourceName === 'Memory Cached Bytes' ||
    chartOptions[i].resourceName  === 'Memory Shared (%)'     || chartOptions[i].resourceName === 'Memory Shared Bytes' ||
    chartOptions[i].resourceName  === 'Memory Swap (%)'       || chartOptions[i].resourceName === 'Memory Swap Bytes' || 
    chartOptions[i].resourceName  === 'Memory Pagefault') {
    const array = [];
    _.forEach(obj.option.series, (sobj) => {
      _.forEach(sobj.data , (tobj, tkey) => {
        const obj = {};
        obj.time = timeChart[tkey];
        obj.value = tobj;
        array.push(obj);
      })
    })
    seriesGrid.splice(countKey,1,array);
    const columnDefs = [
      {headerName:'시간' ,field:'time',maxWidth:180, cellStyle: { textAlign: 'center' },},
      {headerName: obj.deviceName ,type: 'rightAligned', headerClass: "grid-cell-left", 
      cellStyle: params => this.chartRowColor(params,maxVal,minVal), 
      valueFormatter: params =>  {
        if(obj.option.yAxis.max !== undefined) {
          return params.data.value+' '+'%' 
        } else if(obj.byteVal !== undefined) {
          return params.data.value+' '+obj.byteVal
        } else {
          return params.data.value
        }
      },
     }
    ]
    seriesColumn.splice(countKey,1,columnDefs);
    
  } else if(chartOptions[i].resourceName === 'Disk Used (%)'   || chartOptions[i].resourceName === 'Disk Used Bytes'  ||
            chartOptions[i].resourceName === 'Disk I/O (%)'    || chartOptions[i].resourceName === 'Disk I/O Count' ||
            chartOptions[i].resourceName === 'Disk I/O Bytes'  || chartOptions[i].resourceName === 'Disk Queue' || 
            chartOptions[i].resourceName === 'CPU Used (%)'    || chartOptions[i].resourceName === 'Network Traffic' || 
            chartOptions[i].resourceName === 'Network PPS'     || chartOptions[i].resourceName === 'NIC Discards'      || 
            chartOptions[i].resourceName === 'NIC Errors') {
    const array = [];
    _.forEach(timeChart, (tobj,tkey) => {
      const gridObj = {};
      gridObj.time= tobj
      _.forEach(obj.gridData, (dobj,dkey) => {
        gridObj[dkey] = dobj[tkey];
      })
      array.push(gridObj);
    })
    seriesGrid.splice(countKey,1,array);

    const columnDefs=[]
    columnDefs.push({headerName:'시간' ,field:'time',maxWidth:180, cellStyle: { textAlign: 'center' }})
    _.forEach(obj.partition , (pobj,pkey) => {
      columnDefs.push({
        headerName:pobj,
        cellStyle: params => this.chartRowColor(params,maxVal,minVal,pobj,maxValAry,minValAry), 
        valueFormatter: params => {
        if(obj.byteVal !== undefined) {
          return  params.data[pobj]+' '+obj.byteVal
        } else if(obj.option.yAxis.max !== undefined) {
          return params.data[pobj]+' '+'%'
        } else {
          return params.data[pobj]
        }
      },
        type: 'rightAligned', 
        headerClass: "grid-cell-left" 
      })
    })
    seriesColumn.splice(countKey,1,columnDefs);
  } 
  
  chartOptions[i].byteVal = e.target.value;
  chartOptions[i].option.series.data = data;
  
  console.log(seriesGrid);
  
  this.setState({ 
    totalData: seriesGrid,
    chartColumnDefs: seriesColumn,
    chartData: chartOptions
  })
  /* 데이터 초기화 */
  if(dataLength > 0) {
    for(var u=0; u< data.length; u++) {
      data[u].length=dataLength
    }
  }
  if(gridDataLength > 0) {
    for(var k=0; k < gridDatas.length; k++) {
      gridDatas[k].length= gridDataLength;
    }
  }
 }
} 
/* 차트 색깔 */
chartRowColor = (params,maxVal,minVal,pobj,maxValAry,minValAry) => {
  // line 1개 
  if(params.data.time === 'Max') {
    return {  background: '#FFE5E5' }
  } else if(params.data.time === 'Min') {
    return {  background: '#E7F8FF' }
  } else if(params.data.time === 'Avg') {
    return {  background: '#EDFFEF' }
  } else if(params.data.value === maxVal) {
    return {  background: '#FFE5E5' }
  } else if(params.data.value === minVal) {
    return {  background: '#E7F8FF' }
  } 

  // line 2개 이상 
  if(maxValAry !== undefined ) {
    if(params.data[pobj] === maxValAry[pobj]) {
      return {  background: '#FFE5E5' }
    } else if(params.data[pobj] === minValAry[pobj]) {
      return {  background: '#E7F8FF' }
    }
  } 
}
/* 초기화 */
reload = () => {
  for(var k=0; k< this.state.totalKey.length; k++) {
    seriesGrid.splice(0, 1);
    seriesColumn.splice(0, 1);
  }
    this.setState({
      graphCheck:false,
      chartData:[],
      totalKey: [],
      totalData:[],
      chartColumnDefs:[],
      selectedResourceName:[],
      selectedDeviceName:[],
      // firstDateFormat:Moment(oneMonth, "YYYY.MM.DD").format("YYYYMMDD"), 
      // secondDateFormat:Moment(oneMonth, "YYYY.MM.DD").format("YYYYMMDD"), 
      calendarCheckFirst:false,
      calendarCheckSecond:false,
    })
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

 downloadPDF = () => {
  const { firstDateFormat, secondDateFormat, firstTimeFormat, secondTimeFormat, selectedDeviceName } = this.state;

  const startDate=firstDateFormat+firstTimeFormat+'0000';
  const endDate= secondDateFormat+secondTimeFormat+'5959';
  const currentUser = AuthService.getCurrentUser();
  const deviceName =[];
  _.forEach(selectedDeviceName, (v) => {
    deviceName.push(v.value)
  })
  const deviceNames=deviceName.join('|');

  let chartOptions = _.cloneDeep(this.state.chartData);

  let chartAry = [];
  _.forEach(chartOptions , (c,i) => {
    console.log(c);
    chartAry.push(c);
  })
  let chartDatas = {
    chart: chartAry,
    user:currentUser.username,
    startDate:startDate,
    endDate:endDate,
    device:deviceNames,
  }

  ReportService.getReportDownloadPdf(chartDatas, window.location.pathname) 
    .then((res) => {
      console.log(res);
      const blob =new Blob([res.data],{type: 'application/pdf'});
      console.log(blob);
      saveAs(blob,"AiWACS.Report.pdf")
    })
 }

 clickFilter = () => {
  const { filterCheck } = this.state;
  if(filterCheck) {
    this.setState({filterCheck:false})
  } else {
    this.setState({filterCheck:true})
  }
}


  render() {
    const { loader, chartData, isResourceModal, isDeviceModal, selectedResourceName, selectedDeviceName, deviceData, calendarCheckFirst, calendarCheckSecond, 
            date, totalKey, totalData, chartColumnDefs, firstDateFormat, secondDateFormat,firstTimeFormat,secondTimeFormat, filterCheck} = this.state;
           
    const firstDateFormatInput = Moment(firstDateFormat, "YYYY.MM.DD").format("YYYY-MM-DD");
    const secondDateFormatInput = Moment(secondDateFormat, "YYYY.MM.DD").format("YYYY-MM-DD");

      console.log(chartData);
      console.log(seriesGrid);
      // console.log(totalKey);
      console.log(totalData);
      // console.log(chartColumnDefs);

    return (
      <>
        <div className="reportResourceContainer">
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
                    <button className="reportFilterSearch" onClick={() => this.selectResourceModal()}>선택<img src={Search} style={{ width: 20, padding: 1 }} /></button>
                    <div className="reportFilterScroll">
                      <Select className="reportFilterSelect" isDisabled={true} isMulti name="colors" styles={customStyles} placeholder="검색"
                        value={selectedResourceName}
                        components={{
                          DropdownIndicator: () => null,
                          IndicatorSeparator: () => null,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {isResourceModal && (
                <>
                  <Modal show={isResourceModal} onHide={() => this.setState({ isResourceModal: false })} dialogClassName="userModel" className="reportModelHw">
                    <Modal.Header className="header-Area">
                      <Modal.Title id="contained-modal-title-vcenter" className="header_Text">자원</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="ag-theme-alpine" style={{ width: "43vw", height: "60vh" }}>
                        <AgGridReact
                          headerHeight="30"
                          floatingFiltersHeight="27"
                          rowHeight="30"
                          rowSelection="multiple"
                          rowData={resourceData}
                          columnDefs={modalOptions.resourceColumnDefs}
                          defaultColDef={modalOptions.resourceDefaultColDef}
                          autoGroupColumnDef={modalOptions.autoGroupColumnDef}
                          groupSelectsChildren={true}
                          onGridReady={params => {
                            this.resourceGridApi = params.api; 
                            this.resourceGridApi.forEachLeafNode((node) => {
                              selectedResourceName.forEach(s => {
                              if (node.data.id === s.id) {
                                node.setSelected(true);
                            }})
                           });}
                          } 
                        />
                      </div>
                    </Modal.Body>
                    <Form.Group className="reportHwFooter">
                      <Button onClick={() => this.applyResourceModal()} className="reportActiveBtn">적용</Button>
                      <Button onClick={() => this.setState({ isResourceModal: false })} className="reporthideBtn">닫기</Button>
                    </Form.Group>
                  </Modal>
                </>
              )}
              <div className="reportFilterFirstDiv">
                <div className="reportFilterLeftBox">
                  <label className="reportFilterLeftText">장비</label>
                </div>
                <div className="reportFilterRightBox">
                  <div className="reportFilterRightBoxSecond">
                    {
                      selectedResourceName.length === 0 ? (
                        <button disabled className="reportFilterSearchSecond" onClick={() => this.selectDeviceModal()}>선택<img src={Search} style={{ width: 20, padding: 1 }} /></button>
                      ) : ( 
                        <button className="reportFilterSearch" onClick={() => this.selectDeviceModal()}>선택<img src={Search} style={{ width: 20, padding: 1 }} /></button>
                      )
                     }
                    <div className="reportFilterScroll">
                      <Select className="reportFilterSelect" isDisabled={true} isMulti name="colors" styles={customStyles} placeholder="검색"
                        value={selectedDeviceName}
                        components={{
                          DropdownIndicator: () => null,
                          IndicatorSeparator: () => null,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {isDeviceModal && (
                <>
                  <Modal show={isDeviceModal} onHide={() => this.setState({ isDeviceModal: false })} dialogClassName="userModel" className="reportModelHw">
                    <Modal.Header className="header-Area">
                      <Modal.Title id="contained-modal-title-vcenter" className="header_Text">장비</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="ag-theme-alpine" style={{ width: "43vw", height: "40vh" }}>
                        <AgGridReact
                          headerHeight="30"
                          floatingFiltersHeight="27"
                          rowHeight="30"
                          rowSelection="multiple"
                          rowData={deviceData}
                          columnDefs={modalOptions.deviceColumnDefs}
                          defaultColDef={modalOptions.deviceDefaultColDef}
                          onGridReady={params => {
                            this.deviceGridApi = params.api; 
                            this.deviceGridApi.forEachLeafNode((node) => {
                              selectedDeviceName.forEach(s => {
                              if (node.data.id === s.id) {
                                node.setSelected(true);
                            }})
                           });}
                          } 
                        />
                      </div>
                    </Modal.Body>

                    <Form.Group className="reportDeviceFooter">
                      <Button onClick={() => this.applyDeviceModal()} className="reportActiveBtn">적용</Button>
                      <Button onClick={() => this.setState({ isDeviceModal: false })} className="reporthideBtn">닫기</Button>
                    </Form.Group>
                  </Modal>
                </>
              )}
              <div className="reportFilterFirstDivThird">
                <div className="reportFilterLeftBox">
                  <label className="reportFilterLeftText">날짜</label>
                </div>
                <div className="reportFilterRightBoxThird">
                  <div className="reportCalendarYear">
                    <input className="reportCalendarInput" type="text" value={firstDateFormatInput} disabled readOnly/>
                    <button className="reportCalendarIcon" onClick={(e) => this.calendarFirst(e)}>
                      <FcCalendar className="reportCalendarIconStyle" size="20"/>
                    </button>
                    {calendarCheckFirst && (
                      <DatePicker locale={ko} selected={date} dateFormat="yyyy-mm-dd" onChange={(date) => this.calenderFirstChange(date)} inline closeOnScroll={true}
                        dayClassName={(date) => getDayName(createDate(date)) === "토"? "saturday" : getDayName(createDate(date)) === "일"? "sunday": undefined}/>
                    )}
                  </div>
                  
                  <select className="reportCalendarTimeArea" placeholder="년월일 입력" value={firstTimeFormat} onChange={(e) => this.setState({ firstTimeFormat: e.target.value })}>
                    {time.map((t, i) => (
                      <option key={i} value={t.value} selected={t.value}>{t.value}</option>
                    ))}
                  </select>
                  <p className="reportCalendarDateMiddle">~</p>
                  <div className="reportCalendarYear">
                    <input className="reportCalendarInput" type="text" value={secondDateFormatInput} disabled readOnly/>
                    <button className="reportCalendarIcon" onClick={(e) => this.calendarSecond(e)}>
                      <FcCalendar className="reportCalendarIconStyle" size="20"/>
                    </button>
                    {calendarCheckSecond && (
                      <DatePicker locale={ko} selected={date} dateFormat="yyyy-mm-dd" onChange={(date) => this.calenderSecondChange(date)} inline closeOnScroll={true}
                        dayClassName={(date) => getDayName(createDate(date)) === "토"? "saturday" : getDayName(createDate(date)) === "일"? "sunday": undefined} />
                    )}
                  </div>

                  <select className="reportCalendarTimeArea" placeholder="년월일 입력" value={secondTimeFormat} onChange={(e) => this.setState({ secondTimeFormat: e.target.value })}>
                    {time.map((t, i) => (
                      <option key={i} value={t.value} selected={t.value}>{t.value}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="reportFilterSelectBox">
                <Button className="reportFilterSelectBtn" onClick={() => this.getReportData()}>통계하기</Button>
                <Button className="reportFilterReloadBtn" onClick={()=> this.reload()} >초기화</Button>
              </div>
            </div>
          </div>
            ) : ( null )
          }
          
          <div className="reportFilterButtonBox">
            <button type="button" className="input-group-addon reportFilterButtonBtn" onClick={()=> this.clickFilter()}>
              <label className="reportFilterLabel">
              ▲ Filter
              </label>
            </button>
          </div>

          {
             Object.keys(chartData).length !== 0 && (
              // <CreatePdf option={chartData} />
              <Button className="reportFilterReloadBtnPDF" onClick={()=> this.downloadPDF()} >PDF</Button>
            )
          }
          {
            _.map(chartData, (obj, i) => (
              <div className="reportChartParent" key={i}>
                <div className="reportChartArea">
                  <div className="reportChartBox">
                    <ChartComponent option={obj.option} />
                    <div className="reportChartMaxSelect">
                      <select name="changeType" className="reportChartSelect" onChange={(e) => this.changeChartType(e, obj, i)}>
                        <option value="line">Line</option>
                        <option value="column">Bar</option>
                      </select>
                      {obj.percentMaxType && (
                        <>
                          <label className="reportChartLabel">
                            최대치 기준
                          </label>
                          <input type="checkbox" name="percentMax" onChange={(e) => this.maxStandred(e, obj , i)} className="reportChartInput" />
                        </>
                      )}
                     {obj.byteType && (
                        <>
                           <select name="changeByte" className="reportChartSelect" value={obj.byteVal} onChange={(e) => this.changeByteType(e, obj, i)}>
                              <option value="bps">bps</option>
                              <option value="B">B</option>
                              <option value="KB">KB</option>
                              <option value="MB">MB</option>
                              <option value="GB">GB</option>
                            </select>
                        </>
                      )}
                      {obj.byteDiskType && (
                        <>
                           <select name="changeDiskByte" className="reportChartSelect" value={obj.byteVal} onChange={(e) => this.changeByteType(e, obj, i)}>
                              <option value="bps">bps</option>
                              <option value="B/s">B/s</option>
                              <option value="KB/s">KB/s</option>
                              <option value="MB/s">MB/s</option>
                              <option value="GB/s">GB/s</option>
                            </select>
                        </>
                      )}
                      {obj.byteNetworkType && (
                        <>
                           <select name="changeNetworkByte" className="reportChartSelect" value={obj.byteVal} onChange={(e) => this.changeByteType(e, obj, i)}>
                              <option value="bps">bps</option>
                              <option value="Kbps">Kbps</option>
                              <option value="Mbps">Mbps</option>
                              <option value="Gbps">Gbps</option>
                            </select>
                        </>
                      )}
                      {obj.byteNetworkSecondType && (
                        <>
                           <select name="changeNetworkSecondByte" className="reportChartSelect" value={obj.byteVal} onChange={(e) => this.changeByteType(e, obj, i)}>
                              <option value="pps">pps</option>
                              <option value="Kpps">Kpps</option>
                              <option value="Mpps">Mpps</option>
                              <option value="Gpps">Gpps</option>
                            </select>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="reportChartTotalArea">
                    <button className="reportChartTotalBox" onClick={(e) => this.chartTotalCheck(e, obj , i)}>
                      <label className="reportChartTotalText" name="chartStatisticsLabel">▼ 차트 통계</label>
                    </button>
                    {
                      totalKey.map((t,a) => 
                        ( 
                          obj.key === t  && ( 
                            <div className="reportChartTotalGrid" key={t}  >
                              <div className="ag-theme-alpine" style={{ width:'93vw', height:'40vh',marginLeft:'0.5vw'}}>
                                <AgGridReact
                                  headerHeight='30'
                                  floatingFiltersHeight='23'
                                  rowHeight='25'
                                  columnDefs={chartColumnDefs[a]}  
                                  rowData={totalData[a]}
                                  defaultColDef={modalOptions.chartDefaultColDef}
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
        </div>
        
        { loader && <Loader /> }
      </>
    );
  }
}

export default ReportResoruce;
