import React, { Component } from 'react';
import {  AgGridReact } from 'ag-grid-react';
import HistoryRecord from '../../services/historyRecord.service'
import AuthService from '../../services/auth.service'
import Select from "react-select";
import Search from '../../images/search.png'
import Loader from '../loader';
import {Button, Modal,Form, Container, Row } from "react-bootstrap";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from 'date-fns/esm/locale'
import { FcCalendar } from "react-icons/fc"
import Moment from 'moment';
import { saveAs } from 'file-saver';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import "ag-grid-enterprise";


import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/historyRecord.css'

const customStyles = {
  control: base => ({
    ...base,
    height: 28,
    minHeight: 28
  })
};
// 요일 반환
const getDayName = (date) => { return date.toLocaleDateString('ko-KR', { weekday: 'long', }).substr(0, 1); }
// 날짜 비교시 년 월 일까지만 비교하게끔
const createDate = (date) => { return new Date(new Date(date.getFullYear() , date.getMonth() , date.getDate() , 0 , 0 , 0)); }

const time = [{value:'00'},{value:'01'},{value:'02'},{value:'03'},{value:'04'},{value:'05'},{value:'06'},{value:'07'},{value:'08'},{value:'09'},{value:'10'},{value:'11'},{value:'12'}
,{value:'13'},{value:'14'},{value:'15'},{value:'16'},{value:'17'},{value:'18'},{value:'19'},{value:'20'},{value:'21'},{value:'22'},{value:'23'}]
const minute = [{value:'00'},{value:'01'},{value:'02'},{value:'03'},{value:'04'},{value:'05'},{value:'06'},{value:'07'},{value:'08'},{value:'09'},{value:'10'},{value:'11'},{value:'12'},{value:'13'},{value:'14'}
,{value:'15'},{value:'16'},{value:'17'},{value:'18'},{value:'19'},{value:'20'},{value:'21'},{value:'22'},{value:'23'},{value:'24'},{value:'25'},{value:'26'},{value:'27'},{value:'28'},{value:'29'},
{value:'30'},{value:'31'},{value:'32'},{value:'33'},{value:'34'},{value:'35'},{value:'36'},{value:'37'},{value:'38'},{value:'39'},{value:'40'},{value:'41'},{value:'42'},{value:'43'},{value:'44'},
{value:'45'},{value:'46'},{value:'47'},{value:'48'},{value:'49'},{value:'50'},{value:'51'},{value:'52'},{value:'53'},{value:'54'},{value:'55'},{value:'56'},{value:'57'},{value:'58'},{value:'59'}]

const firstDate = new Date(new Date().getTime() - 86400000);

export default class historyRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonActive:false,
      limitSize:30,
      inputDisable:true,
      /** 시간  */
      firstDateFormat: Moment(firstDate, "YYYY.MM.DD").format("YYYYMMDD"),
      firstTimeFormat: Moment(new Date(), "HH").format("HH"),
      firstMinuteFormat: Moment(new Date(), "mm").format("mm"),
      firstSecondFormat: Moment(new Date(), "ss").format("ss"),
      secondDateFormat: Moment(new Date(), "YYYY.MM.DD").format("YYYYMMDD"),
      secondTimeFormat: Moment(new Date(), "HH").format("HH"), 
      secondMinuteFormat: Moment(new Date(), "mm").format("mm"),
      secondSecondFormat: Moment(new Date(), "ss").format("ss"),
      calendarCheckSecond:false,
      calendarCheckFirst:false,
      date: new Date(),
      userDataCheck: false,
      historyModel: false,
      history: [],
      user:[],
      /** 감사 이력 model */
      columnDefs : [
        { headerName: '사용자', field:'userName' },   // rowGroup:true, width:200
        { headerName: '작업 구분', field:'actionType' },
        { headerName: '메뉴 1', field:'menuDepth1' },
        { headerName: '메뉴 2', field:'menuDepth2' } ,
        { headerName: '매뉴 3', field:'menuDepth3' },
        { headerName: '메뉴 4' , field:'menuDepth4'  },
        { headerName: '작업 대상', field:'targetName'  },
        { headerName: '사용자 IP', field:'settingIp' },
        { headerName: '작업 URL', field:'pageUrl' },
        { headerName: '작업 일자', field:'workDate' },
      ],
      defaultColDef: {
        sortable:true,  
        resizable:true,  
        floatingFilter: true,
        filter:'agTextColumnFilter', 
        flex:1,
        maxWidth:210,
        cellStyle: {fontSize: '12px'}
      },
      /** user model **/
      userColumnDefs: [ 
        { headerName: '로그인 ID', field:'username', headerCheckboxSelection: true, checkboxSelection:true },
        { headerName: '메일', field:'email'},
        { headerName: '권한', field:'role'},
        { headerName: '로그인 제한',  field:'roles', valueFormatter:this.loginFormatter},
      ],
      userDefaultColDef: {
        sortable:true, 
        resizable:true,  
        floatingFilter: true,
        filter:'agTextColumnFilter', 
        flex:1,
        maxWidth:210,
      },
      searchName:[],
      /** 작업 구분(체크박스) */
      historyActiveArray:[],  
      historyActiveData:['LOGIN','LOGOUT','CREATE','UPDATE','DELETE','ACTIVE','INACTIVE','RESTART','DOWNLOAD'],
      historyActiveList:[],
      loding:false,
    }
  }

  componentDidMount() {
    const activeData = [{id: 1,value:'LOGIN'},{id: 2,value:'LOGOUT'},{id: 3,value:'CREATE'},{id: 4,value:'UPDATE'},{id: 5,value:'DELETE'}
    ,{id: 6,value:'ACTIVE'},{id: 7,value:'INACTIVE'},{id: 8,value:'RESTART'},{id: 9,value:'DOWNLOAD'}];

    this.setState({
      historyActiveArray:activeData,
      historyActiveList:new Array(activeData.length).fill(true),
    })

    HistoryRecord.getHistoryRecord() 
      .then(res => {
        // console.log(res.data);
        res.data.map(h => {
          h.workDate= h.workDate.replace("T"," ");
        })
        this.setState({history:res.data,loding:true})
        this.infiniteData(res.data);
      })

    HistoryRecord.getHistoryUser()
      .then(res => {
        const data = [];
        res.data.forEach(u=> {
          const obj = {};
          obj.value = u.username;
          obj.label = u.username;
          data.push(obj);
        })
        this.setState({searchName: data})
    })
  }

  loginFormatter = (params) => { return params.data.roles ? 'X':'O' }
  /** 유저 모델 조회 */
  historySelect = () => {
    if(this.state.user.length === 0) {
      HistoryRecord.getHistoryUser()
      .then(res => {
        console.log(res.data);
        const data = res.data;
        data.forEach(u => {
          u.roles.forEach(r=> {
            u.role= r.name;
          })
        })
        this.setState({user:res.data})
      })
    }
    this.setState({historyModel:true })
    
    
  }
  /** user 적용  **/
  historyApply = () => {
    const applyData = this.gridApi.getSelectedRows();
    console.log(this.gridApi.getSelectedNodes());
    console.log(applyData);
    const applyUsername= [];
    applyData.forEach(a => {
        const obj = {};
        obj.id = a.id;
        obj.value = a.username;
        obj.label = a.username;
        applyUsername.push(obj);
    })
    this.setState({searchName: applyUsername, historyModel:false,userDataCheck:true})
  }

  /** 작업 구분 전체  **/
  activeAll = (e) => {
    const {historyActiveList} = this.state;
    const newArray=['LOGIN','LOGOUT','CREATE','UPDATE','DELETE','ACTIVE','INACTIVE','RESTART','DOWNLOAD'];
    const tmpArr=historyActiveList.map((item) => {
      item = e.target.checked ? true:false;
      return item;
    })
    this.setState({
      historyActiveData: e.target.checked ? newArray: [], 
      historyActiveList:tmpArr,
      inputDisable: e.target.checked ? true : false
    })
  }

  /* 작업 구분 개별 */
  activeEach = (item) => {
    const {historyActiveList,historyActiveData} = this.state;
    var newArray = [...historyActiveData, item.value]
    const changeCheck = historyActiveList.map((check,idx) => {
    if(idx === item.id - 1) check = !check;
    return check;
  });
  
  if(historyActiveData.includes(item.value)) {
    newArray = newArray.filter(o => o !== item.value);
  }
  this.setState({historyActiveList:changeCheck})
  this.setState({historyActiveData:newArray})
 }
 /** 조회하기 */
 historySelectEvent = () => {
   const { searchName,historyActiveData,firstDateFormat,firstTimeFormat,firstMinuteFormat,
    firstSecondFormat,secondDateFormat,secondTimeFormat,secondMinuteFormat,secondSecondFormat,limitSize  } = this.state;
   const firstDate = firstDateFormat+firstTimeFormat+firstMinuteFormat+firstSecondFormat;
   const secondDate = secondDateFormat+secondTimeFormat+secondMinuteFormat+secondSecondFormat;
   const searchData = [];
   searchName.forEach(s=> {
    searchData.push(s.value);
   })
   const searchDatas = searchData.join(',');
   const historyActiveDatas = historyActiveData.join(',');
   
   console.log(searchDatas);
   console.log(historyActiveDatas);
   console.log(firstDate);
   console.log(secondDate);
   console.log(limitSize);

   HistoryRecord.getSelectHistory(limitSize,searchDatas,historyActiveDatas,firstDate,secondDate)
    .then(res=> {
     console.log(res.data);
        res.data.map(h => {
          h.workDate= h.workDate.replace("T"," ");
        })
        this.infiniteData(res.data);
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
 /** 시간(12시) */
 timeEachEvent = () => {
  const newDate= new Date();
  const newTime = new Date(newDate.getTime() - 43200000);
   this.setState({ 
     firstTimeFormat: Moment(newTime, "HH").format("HH"),
     firstDateFormat: Moment(newTime, "YYYY.MM.DD").format("YYYYMMDD"),
     firstMinuteFormat: Moment(newDate, "mm").format("mm"),
     firstSecondFormat: Moment(newDate, "ss").format("ss"),
     secondDateFormat: Moment(newDate, "YYYY.MM.DD").format("YYYYMMDD"),
     secondTimeFormat: Moment(newDate, "HH").format("HH"), 
     secondMinuteFormat: Moment(newDate, "mm").format("mm"),
     secondSecondFormat: Moment(newDate, "ss").format("ss"),
    })
 }
 /** 시간(24시) */
 timeEachEventSecond =() => {
  const newDate= new Date();
  const newTime = new Date(newDate.getTime() - 86400000);
  this.setState({ 
    firstTimeFormat: Moment(newTime, "HH").format("HH"),
    firstDateFormat: Moment(newTime, "YYYY.MM.DD").format("YYYYMMDD"),
    firstMinuteFormat: Moment(newDate, "mm").format("mm"),
    firstSecondFormat: Moment(newDate, "ss").format("ss"),
    secondDateFormat: Moment(newDate, "YYYY.MM.DD").format("YYYYMMDD"),
    secondTimeFormat: Moment(newDate, "HH").format("HH"), 
    secondMinuteFormat: Moment(newDate, "mm").format("mm"),
    secondSecondFormat: Moment(newDate, "ss").format("ss"),
   })
 }
/** 시간(7일) */
 timeEachEventThird = () => {
  const newDate= new Date();
  const newTime = new Date(newDate.getTime() - 604800000);
  this.setState({ 
    firstTimeFormat: Moment(newTime, "HH").format("HH"),
    firstDateFormat: Moment(newTime, "YYYY.MM.DD").format("YYYYMMDD"),
    firstMinuteFormat: Moment(newDate, "mm").format("mm"),
    firstSecondFormat: Moment(newDate, "ss").format("ss"),
    secondDateFormat: Moment(newDate, "YYYY.MM.DD").format("YYYYMMDD"),
    secondTimeFormat: Moment(newDate, "HH").format("HH"), 
    secondMinuteFormat: Moment(newDate, "mm").format("mm"),
    secondSecondFormat: Moment(newDate, "ss").format("ss"),
   })
 }
 /** 시간(30일) */
 timeEachEventFourth = () => {
  const newDate= new Date();
  const newTime = new Date(newDate.getTime() - 2592000000);
  this.setState({ 
    firstTimeFormat: Moment(newTime, "HH").format("HH"),
    firstDateFormat: Moment(newTime, "YYYY.MM.DD").format("YYYYMMDD"),
    firstMinuteFormat: Moment(newDate, "mm").format("mm"),
    firstSecondFormat: Moment(newDate, "ss").format("ss"),
    secondDateFormat: Moment(newDate, "YYYY.MM.DD").format("YYYYMMDD"),
    secondTimeFormat: Moment(newDate, "HH").format("HH"), 
    secondMinuteFormat: Moment(newDate, "mm").format("mm"),
    secondSecondFormat: Moment(newDate, "ss").format("ss"),
   })
 }
 /** 초기화 */
 reload = () => {
  const newTime = new Date(new Date() - 86400000);
  HistoryRecord.getHistoryRecord() 
  .then(res => {
    res.data.map(h => {
      h.workDate= h.workDate.replace("T"," ");
    })
    this.setState({history:res.data})
    this.infiniteData(res.data)
  })
  const activeData = [{id: 1,value:'LOGIN'},{id: 2,value:'LOGOUT'},{id: 3,value:'CREATE'},{id: 4,value:'UPDATE'},{id: 5,value:'DELETE'}
    ,{id: 6,value:'ACTIVE'},{id: 7,value:'INACTIVE'},{id: 8,value:'RESTART'},{id: 9,value:'DOWNLOAD'}];

  this.setState({ 
    firstDateFormat: Moment(newTime, "YYYY.MM.DD").format("YYYYMMDD"),
    firstTimeFormat: time[0].value,
    firstMinuteFormat:time[0].value,
    firstSecondFormat:time[0].value,
    secondDateFormat: Moment(new Date(), "YYYY.MM.DD").format("YYYYMMDD"),
    secondTimeFormat: time[0].value,
    secondMinuteFormat: time[0].value,
    secondSecondFormat: time[0].value,
    userDataCheck:false,
    historyActiveArray:activeData,
    historyActiveData:['LOGIN','LOGOUT','CREATE','UPDATE','DELETE','ACTIVE','INACTIVE','RESTART','DOWNLOAD'],
    historyActiveList:new Array(activeData.length).fill(true),
    inputDisable:true,
   })
   
 }
/** 감사이력 엑셀 */
 historyDownloadExcel = () => {
  const { firstDateFormat,firstTimeFormat,firstMinuteFormat,firstSecondFormat,secondDateFormat,secondTimeFormat,secondMinuteFormat,secondSecondFormat  } = this.state;
  const firstDate = firstDateFormat+" "+firstTimeFormat+":"+firstMinuteFormat+":"+firstSecondFormat+"~"+secondDateFormat+" "+secondTimeFormat+":"+secondMinuteFormat+":"+secondSecondFormat;
  const user = AuthService.getCurrentUser().username;
  const outDate= Moment(new Date(), "YYYY.MM.DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
  const requestURL= window.location.pathname;

  HistoryRecord.historyDownloadExcel(user,firstDate,outDate,requestURL)
  .then((res) => {
    const mimeType = { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };
    const blob =new Blob([res.data],mimeType);
    saveAs(blob,"감사이력리스트.xls")
  })
}
/** 무한 스크롤 */
infiniteData = (data) => {
  const { searchName,historyActiveData,firstDateFormat,firstTimeFormat,firstMinuteFormat,
    firstSecondFormat,secondDateFormat,secondTimeFormat,secondMinuteFormat,secondSecondFormat,limitSize  } = this.state;
   const firstDate = firstDateFormat+firstTimeFormat+firstMinuteFormat+firstSecondFormat;
   const secondDate = secondDateFormat+secondTimeFormat+secondMinuteFormat+secondSecondFormat;
   const searchData = [];
   searchName.forEach(s=> {
    searchData.push(s.value);
   })
   const searchDatas = searchData.join(',');
   const historyActiveDatas = historyActiveData.join(',');
   
    var dataSource = {
      getRows: function (params) {
         HistoryRecord.getSelectHistory(params.endRow,searchDatas,historyActiveDatas,firstDate,secondDate)
          .then(res=> {
              res.data.map(h => {
                h.workDate= h.workDate.replace("T"," ");
              })
          })
        setTimeout(function () {
          var rowsThisPage = data.slice(params.startRow, params.endRow);
          var lastRow = -1;
          if (data.length <= params.endRow) {
            lastRow = data.length;
          }
          params.successCallback(rowsThisPage, lastRow);
        }, 500);
      },
    };
    this.gridApis.setDatasource(dataSource);
  };



  

  render() {
   const { columnDefs,test, defaultColDef,history,user,historyModel,userColumnDefs,userDefaultColDef,searchName, historyActiveArray,historyActiveData,historyActiveList
    ,userDataCheck,date,calendarCheckFirst,firstDateFormat,firstTimeFormat,firstMinuteFormat,firstSecondFormat,calendarCheckSecond, secondDateFormat,
    secondTimeFormat, secondMinuteFormat, secondSecondFormat,inputDisable, buttonActive } = this.state;


    const firstDateFormatInput = Moment(firstDateFormat, "YYYY.MM.DD").format("YYYY-MM-DD");
    const secondDateFormatInput = Moment(secondDateFormat, "YYYY.MM.DD").format("YYYY-MM-DD");


    // console.log(date);
    // console.log(firstDate);
    // console.log(current);
    // console.log(firstDateFormat)
    // console.log(firstTimeFormat);
    // console.log(firstMinuteFormat);
    // console.log(firstSecondFormat);

    return (
          <div className="historyContainer">
            {/* 상단 */}
            <div className="historyFilterContainer">
              <div className="historyFilterBoxArea">
                  <div className="historyFilterBoxLeft">
                      <div className="historyFilterTitle">
                        <p className="historyFilterText" >사용자</p>
                      </div>
                      <div className="historyFilterSearchArea">
                        <div className="historyFilterSearchBox">
                          <button className="historyFilterSearch" onClick={()=> this.historySelect()} >
                            선택
                            <img src={Search} style={{width:20, padding:1}} />
                          </button>
                          {
                             this.state.historyModel && (
                            <>
                            <Modal show={historyModel} onHide={()=>this.setState({historyModel:false})} dialogClassName="userModel"   >

                            <Modal.Header  className="header-Area">
                                
                            <Modal.Title id="contained-modal-title-vcenter" className="header_Text">
                              유저 목록
                            </Modal.Title>

                            </Modal.Header>
                                <Modal.Body>
                                      <div className="ag-theme-alpine" style={{ width:'43vw', height:'45vh'}}>
                                          <AgGridReact
                                            headerHeight='30'
                                            floatingFiltersHeight='27'
                                            rowHeight='30'
                                            rowData={user} 
                                            columnDefs={userColumnDefs} 
                                            defaultColDef={userDefaultColDef}
                                            rowSelection='multiple'
                                            onGridReady={params => {this.gridApi = params.api; 
                                              this.gridApi.forEachLeafNode( (node) => {
                                              searchName.forEach(s => {
                                                if (node.data.id === s.id) {
                                                  node.setSelected(true);
                                              }
                                              })
                                           });}
                                          } 
                                          />        
                                      </div>
                              </Modal.Body>

                              <Form.Group className="historyFooter">
                                  <Button onClick={()=> this.historyApply()} className="historyActiveBtn"  >적용</Button>
                                  <Button onClick={()=> this.setState({historyModel:false})} className="historyhideBtn"  >닫기</Button>
                              </Form.Group>
                              </Modal>
                              </>
                             ) 
                          }
                         
                          <Select 
                          value={userDataCheck ? searchName : null }
                          className="historyUserSelect" 
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

                  <div className="historyFilterBoxLeftSecond">
                      <div className="historyFilterTitle">
                        <p className="historyFilterTextSecond" >작업 구분</p>
                      </div>
                      <div className="historyFilterSearchArea">
                        <div className="historyFilterInput">
                          <input type="checkbox" checked={historyActiveList.length===historyActiveData.length ? true:false} onChange={(e)=> this.activeAll(e)} />
                          <span className="filterSpan">ALL </span>
                            {
                              historyActiveArray.map((o,i) => (
                                <>
                                <input disabled={inputDisable ? true : false} type="checkbox" checked={historyActiveList[o.id -1]} onChange={(e)=> this.activeEach(o,e.target.checked,e.target.value)} />
                                <span className="filterSpan">{o.value}</span>
                              </>
                              ))
                            }
                        </div>
                      </div>
                  </div>

                  <div className="historyFilterBoxLeftThird">
                      <div className="historyFilterTitle">
                        <p className="historyFilterTextThird" >작업 날짜</p>
                      </div>
                      <div className="historyFilterSearchArea">
                        <div className="calendarAreaYear">
                          <input className="calendarInput" type="text" value={firstDateFormatInput} disabled readonly />
                            <button className="calendarIcon" onClick={(e)=> this.calendarFirst(e)} >
                              <FcCalendar className="calendarIconStyle"  size="20" value={date} />
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
                        
                        <select className="calendarTimeArea" placeholder="년월일 입력" defaultValue={firstTimeFormat} value={firstTimeFormat} onChange={e => this.setState({firstTimeFormat:e.target.value})}  >
                          {time.map(t => 
                            <option value={t.value} selected={t.value} >{t.value}</option>
                            ) }
                        </select>
                        <select className="calendarTimeArea" defaultValue={firstMinuteFormat} value={firstMinuteFormat} onChange={e => this.setState({firstMinuteFormat:e.target.value})}  >
                          {minute.map(t => 
                            <option value={t.value} selected={t.value}>{t.value}</option>
                            ) }
                        </select>
                        <select className="calendarTimeArea" defaultValue={firstSecondFormat} value={firstSecondFormat} onChange={e => this.setState({firstSecondFormat:e.target.value})}  >
                          {minute.map(t => 
                            <option value={t.value} selected={t.value}>{t.value}</option>
                            ) }
                        </select>

                        <p className="DateMiddle">~</p>

                        <div className="calendarAreaYear">
                            <input className="calendarInput" type="text" value={secondDateFormatInput} disabled readonly />
                            <button className="calendarIcon" onClick={(e)=> this.calendarSecond(e)} >
                              <FcCalendar className="calendarIconStyle"  size="20" value={date} />
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
                        
                        <select className="calendarTimeArea" defaultValue={secondTimeFormat} value={secondTimeFormat} onChange={e => this.setState({secondTimeFormat:e.target.value})} >
                          {time.map(t => 
                            <option value={t.value} selected={t.value}>{t.value}</option>
                            ) }
                        </select>
                        <select className="calendarTimeArea" defaultValue={secondMinuteFormat} value={secondMinuteFormat} onChange={e => this.setState({secondMinuteFormat:e.target.value})}  >
                          {minute.map(t => 
                            <option value={t.value} selected={t.value}>{t.value}</option>
                            ) }
                        </select>
                        <select className="calendarTimeArea" defaultValue={secondSecondFormat} value={secondSecondFormat} onChange={e => this.setState({secondSecondFormat:e.target.value})}  >
                          {minute.map(t => 
                            <option value={t.value} selected={t.value}>{t.value}</option>
                            ) }
                        </select>

                        <button className="timeEachBtn" onClick={()=> {this.timeEachEvent()}} >12h</button>
                        <button className="timeEachBtn" onClick={()=> {this.timeEachEventSecond()}}>24h</button>
                        <button className="timeEachBtn" onClick={()=> {this.timeEachEventThird()}} >7d</button>
                        <button className="timeEachBtn" onClick={()=> {this.timeEachEventFourth()}}>30d</button>
                      </div>
                  </div>
              </div>
         
              <div className="historyMiddleSelectBtnSpace">
                  <Button className="historyMiddleSelectBtn" onClick={()=> this.historySelectEvent()}>조회하기</Button>
                  <Button className="historyMiddleReloadBtn" onClick={()=> this.reload()}>초기화</Button>
              </div>
            </div>
            {/* 중간*/}
            <div className="historyMiddleContainer"> 
              
            </div>
            {/* 하단 */}
            <div className="historyAggridContainer">
              <div className="histroyExcelArea">
                <Button className="historyExcelText" onClick={this.historyDownloadExcel}>내보내기</Button>
              </div>
                <div className="ag-theme-alpine" style={{ width:'96vw', height:'55vh',marginLeft:'0.5vw'}}>
                  
                {
                  !this.state.loding && (
                    <Loader />
                  )
                }  
                
                    <AgGridReact
                    headerHeight='30'
                    floatingFiltersHeight='23'
                    rowHeight='25'
                    columnDefs={columnDefs}  
                    defaultColDef={defaultColDef}
                    rowModelType={'infinite'} 
                    cacheBlockSize='30'
                    onGridReady={params => { this.gridApis = params.api;}}
                 
                  />
                  
                  
                    
                
                  
                  
                    
                 
                   
                           
               </div>
            </div>
          </div>


         

        
    );
   
  }
}