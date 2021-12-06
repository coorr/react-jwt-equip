import React, { Component } from 'react';
import Select from "react-select";
import _ from "lodash";
import AiwacsService from '../../services/equipment.service';
import ReportService from '../../services/report.service';

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
  {id:17, group:"Memory", memory:"Memory Pagefault (%)", resourceKey: 'sys', resourceName: 'Memory Pagefault (%)'},
  {id:18, group:"Disk", disk:"Disk Total Used (%)", resourceKey: 'diskTot', resourceName: 'Disk Total Used (%)'},
  {id:19, group:"Disk", disk:"Disk Total Used Bytes", resourceKey: 'diskTot', resourceName: 'Disk Total Bytes'},
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
  }
};

const firstDateFormatInput = Moment('2020-10-31', "YYYY-MM-DD").format("YYYY-MM-DD");
const secondDateFormatInput = Moment('2020-10-31', "YYYY-MM-DD").format("YYYY-MM-DD");
const firstTimeFormat = '00';
const secondTimeFormat = '23';

class test extends Component {
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
      chartData: {}
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

    if (selectedResourceNode.length === 0) {
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
      this.setState({ isResourceModal:false, selectedResourceName: selectedResourceName, selecteResource: selectedResource });
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
        obj.value = v.data.equipment;
        obj.label = v.data.equipment;
        selectedDeviceName.push(obj);
        selectedDevice.push(v.data);
      });
      this.setState({ isDeviceModal:false, selectedDeviceName: selectedDeviceName, selectedDevice: selectedDevice });
    }
  }

  getReportData() {
    this.setState({ loader: true });
    let { selecteResource, selectedDevice } = this.state;
    console.log(selecteResource);
    console.log(selectedDevice);
    let startDate = Moment(firstDateFormatInput).format("YYYYMMDD")+"000000";
    let endDate = Moment(secondDateFormatInput).format("YYYYMMDD")+"235959";

    let resourceKey = _.groupBy(selecteResource, 'resourceKey');

    console.log(resourceKey);

    let sys = 0;
    let disk = 0;
    let nic = 0;

    // let => 변수 선언을 해서 다시 값을 넣는 방식
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
    });
  }

  setReportDataFormat(data) {
    let { selecteResource } = this.state;
    let startDate = Moment(firstDateFormatInput).format("YYYY.MM.DD");
    let endDate = Moment(secondDateFormatInput).format("YYYY.MM.DD");
    let chartData = {};
    console.log(data);
    console.log(selecteResource);
    _.forEach(selecteResource, (obj, key) => {
      
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
          tickInterval:2,
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

      if(obj.resourceName === 'CPU Processor (%)') {
        _.forEach(data[obj.resourceKey], (iobj) => {
          categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
          valueAry.push(iobj.cpuProcessor);
          originValueAry.push(iobj.cpuProcessor);
        });
        chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+data[obj.resourceKey][0].deviceName;
        chartOptions.xAxis.categories = categoryAry;
        chartOptions.yAxis = { max:100, tickInterval:20  }
        // chartOptions.series[0].data = valueAry;
        chartOptions.series[0].data = [0, 0, 0,0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 0, 0, 0, 0, 0, 0];
        chartOptions.series[0].name = data[obj.resourceKey][0].deviceName;

        chartObj.resourceName = obj.resourceName;
        chartObj.deviceName = data[obj.resourceKey][0].deviceName;
        chartObj.percentMaxType = true;
        // chartObj.originValueAry = originValueAry;
        chartObj.option = chartOptions;
        chartData['chartOptions'+key] = chartObj;
      } else if(obj.resourceName === 'CPU Used (%)') {
        _.forEach(data[obj.resourceKey], (iobj) => {
          categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
          valueAry.push(iobj.cpuProcessor);
          originValueAry.push(iobj.cpuProcessor);
        });

        chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+data[obj.resourceKey][0].deviceName;
        chartOptions.xAxis.categories = categoryAry;
        chartOptions.yAxis = { max:100, tickInterval:20  }
        chartOptions.series[0].data = valueAry;
        chartOptions.series[0].name = data[obj.resourceKey][0].deviceName;

        chartObj.resourceName = obj.resourceName;
        chartObj.deviceName = data[obj.resourceKey][0].deviceName;
        chartObj.percentMaxType = true;
        chartObj.originValueAry = originValueAry;
        chartObj.option = chartOptions;
        chartData['chartOptions'+key] = chartObj;
      } else if(obj.resourceName === 'CPU Context Switch') {
        _.forEach(data[obj.resourceKey], (iobj) => {
          categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
          valueAry.push(iobj.cpuContextswitch);
          originValueAry.push(iobj.cpuContextswitch);
        });
        
        chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+data[obj.resourceKey][0].deviceName;
        chartOptions.xAxis.categories = categoryAry;
        chartOptions.series[0].data = valueAry;
        chartOptions.series[0].name = data[obj.resourceKey][0].deviceName;

        chartObj.resourceName = obj.resourceName;
        chartObj.deviceName = data[obj.resourceKey][0].deviceName;
        chartObj.originValueAry = originValueAry;
        chartObj.option = chartOptions;
        chartData['chartOptions'+key] = chartObj;
      } else if(obj.resourceName === 'CPU Run Queue') {
        _.forEach(data[obj.resourceKey], (iobj) => {
          categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
          valueAry.push(iobj.cpuIrq);
          originValueAry.push(iobj.cpuIrq);
        });
        
        chartOptions.title.text = '<span style="font-weight: bold; font-size:18px;">'+obj.resourceName+'</span> / '+startDate+'∽'+endDate+', '+data[obj.resourceKey][0].deviceName;
        chartOptions.xAxis.categories = categoryAry;
        chartOptions.series[0].data = valueAry;
        chartOptions.series[0].name = data[obj.resourceKey][0].deviceName;

        chartObj.resourceName = obj.resourceName;
        chartObj.deviceName = data[obj.resourceKey][0].deviceName;
        chartObj.originValueAry = originValueAry;
        chartObj.option = chartOptions;
        chartData['chartOptions'+key] = chartObj;
      } else if(obj.resourceName === 'Disk Total Bytes') {
        let byteVal = 'bps';
        _.forEach(data[obj.resourceKey], (iobj) => {
          categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
          valueAry.push(this.autoConvertByte(iobj.usedBytes).value);
          originValueAry.push(iobj.usedBytes);
        });

        byteVal = this.autoConvertByte(data[obj.resourceKey][0].usedBytes).unit;

        chartOptions.title.text = obj.resourceName;
        chartOptions.xAxis.categories = categoryAry;
        chartOptions.series[0].data = valueAry;
        chartOptions.series[0].name = data[obj.resourceKey][0].deviceName;

        chartObj.resourceName = obj.resourceName;
        chartObj.deviceName = data[obj.resourceKey][0].deviceName;
        chartObj.byteType = true;
        chartObj.byteVal = byteVal;
        chartObj.originValueAry = originValueAry;
        chartObj.option = chartOptions;
        chartData['chartOptions'+key] = chartObj;
      } else if(obj.resourceName === 'Disk Used Bytes') {
        let byteVal = 'bps';
        let diskPartitionAry = _.groupBy(data[obj.resourceKey], 'partitionLabel');

        console.log(diskPartitionAry);

        chartOptions.series = [];
        originValueAry = [];
        
        _.forEach(diskPartitionAry, (dobj, key) => {
          let partitionVal = [];
          let originVal = [];
          _.forEach(dobj, (disk) => {
            partitionVal.push(this.autoConvertByte(disk.usedBytes).value);
            originVal.push(disk.usedBytes);
          });
          byteVal = this.autoConvertByte(dobj[0].usedBytes).unit;
          chartOptions.series.push({data: partitionVal, name: key});
          originValueAry.push({data: originVal});
        });

        _.forEach(data[obj.resourceKey], (iobj) => {
          categoryAry.push(_.replace(iobj.generateTime, 'T', ' '));
        });
        
        chartOptions.title.text = obj.resourceName;
        chartOptions.xAxis.categories = categoryAry;

        chartObj.resourceName = obj.resourceName;
        chartObj.deviceName = data[obj.resourceKey][0].deviceName;
        chartObj.byteType = true;
        chartObj.byteVal = byteVal;
        chartObj.originValueAry = originValueAry;
        chartObj.option = chartOptions;
        chartData['chartOptions'+key] = chartObj;
      }
      console.log(valueAry);
    }); 
    
    this.setState({ loader: false, chartData: chartData });
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

  changeByteType = (e, obj, i) => {
    let chartOptions = _.cloneDeep(this.state.chartData);
    let valueAry = [];

    console.log(this.state);
    console.log(i);

    if(chartOptions[i].resourceName === 'Disk Total Bytes') {
      _.forEach(chartOptions[i].originValueAry, (val) => {
        valueAry.push(this.changeByteVal(e.target.value, val).value);
      });
  
      chartOptions[i].byteVal = e.target.value;
      chartOptions[i].option.series[0].data = valueAry;
    } else if(chartOptions[i].resourceName === 'Disk Used Bytes') {
      _.forEach(chartOptions[i].originValueAry, (val, j) => {
        let partitionVal = [];
        _.forEach(val.data, (disk) => {
          partitionVal.push(this.changeByteVal(e.target.value, disk).value);
        });
        
        valueAry.push({data: partitionVal, name: chartOptions[i].option.series[j].name});
        
      });
      chartOptions[i].byteVal = e.target.value;
      chartOptions[i].option.series = valueAry;
    }

    this.setState({ chartData: chartOptions });
  }

  autoConvertByte(size, decimals = 2) {
    let result = {};

    if (size === 0) return '0';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(size) / Math.log(k));

    result.value = parseFloat((size / Math.pow(k, i)).toFixed(dm));
    result.unit = sizes[i];
    return result;
  };

  changeByteVal(type, size, decimals = 2){
		let result = {},
        selectFix = 0,
        selectVal = 0;

    const dm = decimals < 0 ? 0 : decimals;

    if (size === 0) return '0'; 
    else {
      if(type == 'bps') {
        selectVal = 8;
      } else if(type == 'B') {
        selectVal = 1;
      } else if(type == 'KB') {
        selectVal = 1024;
        selectFix = 3;
      } else if(type == 'MB') {
        selectVal = 1048576;
        selectFix = 6;
      } else if(type == 'GB') {
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

  render() {
    const { loader, chartData, isResourceModal, isDeviceModal, selectedResourceName, selectedDeviceName, deviceData,
            calendarCheckFirst, calendarCheckSecond, date } = this.state;

      console.log("aa");

    return (
      <>
        <div className="reportResourceContainer">
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
                          onGridReady={(params) => {
                            this.resourceGridApi = params.api;
                          }}
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
                    <button className="reportFilterSearch" onClick={() => this.selectDeviceModal()}>선택<img src={Search} style={{ width: 20, padding: 1 }} /></button>
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
                          onGridReady={(params) => {
                            this.deviceGridApi = params.api;
                          }}
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
                <Button className="reportFilterReloadBtn" >초기화</Button>
              </div>
            </div>
          </div>
          {
            _.map(chartData, (obj, i) => (
              <div className="reportChartParent">
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
                    </div>
                  </div>
                  <div className="reportChartTotalArea">
                    <button className="reportChartTotalBox" onClick={(e) => this.chartTotalCheck()}>
                      <label className="reportChartTotalText" name="chartStatisticsLabel">▼ 차트 통계</label>
                    </button>
              
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

export default test;
