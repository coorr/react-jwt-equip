import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Select from "react-select";
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
// Drilldown(Highcharts);


import '../../css/reportResource.css'
const time = [{value:'00'},{value:'01'},{value:'02'},{value:'03'},{value:'04'},{value:'05'},{value:'06'},{value:'07'},{value:'08'},{value:'09'},{value:'10'},{value:'11'},{value:'12'}
,{value:'13'},{value:'14'},{value:'15'},{value:'16'},{value:'17'},{value:'18'},{value:'19'},{value:'20'},{value:'21'},{value:'22'},{value:'23'}]

// calendar 사이즈 조절
const customStyles = { control: base => ({ ...base, height: 26, minHeight: 26 }) };
// 요일 반환
const getDayName = (date) => { return date.toLocaleDateString('ko-KR', { weekday: 'long', }).substr(0, 1); }
// 날짜 비교시 년 월 일까지만 비교하게끔
const createDate = (date) => { return new Date(new Date(date.getFullYear() , date.getMonth() , date.getDate() , 0 , 0 , 0)); }

const config = { 
  chart: { type: 'line', height:300, width:1500 },   
  title: { text: '<span style="font-weight: bold; font-size:18px; margin-top:3px">CPU Processor (%) </span> / 2021-11-10~2021-11-10, DESKTOP-26LI6N0(10.10.80.106)', 
            align:'left',style:{'fontSize':'12','fontWeight':'bold'}, margin:40}, 
  xAxis: { type: 'category',}, 
  yAxis: { title: { text: '' },min:0 ,max:100, tickInterval:20  }, 
  legend: { enabled: false }, 
  // plotOptions: { series: { color:'#FF0000', borderWidth: 1, dataLabels: { enabled: true, format: '{point.y:.1f}%' } } }, 

  // tooltip: { headerFormat: '<span style="font-size:11px">{series.name}</span><br>', 
  //           pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>' }, 

  series: [{ 
     data: [{ name: '2021-11-10 00:00', y: 99.33, drilldown: '2021-11-10 00:00' }, 
            { name: '2021-11-10 01:00', y: 24.03, drilldown: '2021-11-10 01:00' }, 
            { name: '2021-11-10 02:00', y: 10.38, drilldown: '2021-11-10 02:00' }, 
            { name: '2021-11-10 03:00', y: 4.77,  drilldown: '2021-11-10 03:00' }, 
            { name: '2021-11-10 04:00', y: 0.91, drilldown: '2021-11-10 04:00' }, 
            { name: '2021-11-10 05 :00', y: 0.2, drilldown: '2021-11-10 05:00' }, 
            { name: '2021-11-10 06 :00', y: 64.2, drilldown: '2021-11-10 06:00' }, 
            { name: '2021-11-10 07 :00', y: 23.2, drilldown: '2021-11-10 07:00' }, 
            { name: '2021-11-10 08 :00', y: 64.2, drilldown: '2021-11-10 08:00' }, 
            { name: '2021-11-10 13 :00', y: 99.2, drilldown: '2021-11-10 13:00' }, 
            { name: '2021-11-10 15 :00', y: 1.2, drilldown: '2021-11-10 15:00' }, 
            { name: '2021-11-10 20 :00', y: 2.2, drilldown: '2021-11-10 20:00' }, 

          ]}], 
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

class ReportResoruce extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterCheck:true,
      clickedId:0,
      buttonIdsArray: ['보고서', '통계 엑셀 다운로드'],
      calendarCheckSecond:false,
      calendarCheckFirst:false,
      date: new Date(),
      firstDateFormat: Moment(new Date(), "YYYY.MM.DD").format("YYYYMMDD"),
      firstTimeFormat: time[0],
      secondDateFormat: Moment(new Date(), "YYYY.MM.DD").format("YYYYMMDD"),
      secondTimeFormat: time[23],
    }
  }
  componentDidMount() {

  }

  labelChange = (id) => {
    this.setState({ clickedId : id})
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

test = () => {
  const { filterCheck } = this.state;
  if(filterCheck) {
    this.setState({filterCheck:false})
  } else {
    this.setState({filterCheck:true})
  }
  
}

  render() {
    const { active,buttonIdsArray,clickedId,calendarCheckFirst,calendarCheckSecond,date,firstDateFormat,secondDateFormat,firstTimeFormat,secondTimeFormat,filterCheck
     } =this.state;
    console.log(firstTimeFormat);

    const firstDateFormatInput = Moment(firstDateFormat, "YYYY.MM.DD").format("YYYY-MM-DD");
    const secondDateFormatInput = Moment(secondDateFormat, "YYYY.MM.DD").format("YYYY-MM-DD");

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
                      <button className="reportFilterSearch" onClick={()=> this.historySelect()} >
                        선택
                        <img src={Search} style={{width:20, padding:1}} />
                      </button>
                      <Select 
                        // value={userDataCheck ? searchName : null }
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
                <div className="reportFilterFirstDiv">
                  <div className="reportFilterLeftBox">
                    <label className="reportFilterLeftText">장비</label>
                  </div>
                  <div className="reportFilterRightBox">
                    <div className="reportFilterRightBoxSecond">
                      <button className="reportFilterSearch" onClick={()=> this.historySelect()} >
                        선택
                        <img src={Search} style={{width:20, padding:1}} />
                      </button>
                      <Select 
                        // value={userDataCheck ? searchName : null }
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
                      defaultValue={firstTimeFormat.value} 
                      value={firstTimeFormat.value} 
                      onChange={e => this.setState({firstTimeFormat:e.target.value})}  
                    >
                      {time.map(t => 
                        <option value={t.value} selected={t.value} >{t.value}</option>
                        ) }
                    </select>
                    <p className="reportCalendarDateMiddle">~</p>
                    <div className="reportCalendarYear">
                       <input className="reportCalendarInput" type="text" value={secondDateFormatInput} disabled readonly />
                       <button className="reportCalendarIcon"  onClick={(e)=> this.calendarFirst(e)} >
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
                      defaultValue={secondTimeFormat.value} 
                      value={secondTimeFormat.value} 
                      onChange={e => this.setState({firstTimeFormat:e.target.value})}  
                    >
                      {time.map(t => 
                        <option value={t.value} selected={t.value} >{t.value}</option>
                        ) }
                    </select>
                  </div>
                </div>
    
                <div className="reportFilterSelectBox">
                  <Button className="reportFilterSelectBtn" onClick={()=> this.historySelectEvent()}>통계하기</Button>
                  <Button className="reportFilterReloadBtn" onClick={()=> this.reload()}>초기화</Button>
                </div>
            </div>
           </div>
          ) : (
            null
          )
        }
      

       <div className="reportFilterButtonBox">
          <button type="button" className="input-group-addon reportFilterButtonBtn" onClick={()=> this.test()}>
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

        <div className="reportChartArea">
          <div className="reportChartBox">
              <ReactHighcharts config={config} />
          </div>
        </div>

         <div className="reportChartArea">
          <div className="reportChartBox">
              <ReactHighcharts config={config} />
          </div>
        </div>

        

{/*
        <div className="reportChartArea">
          <div className="reportChartBox">
              <ReactHighcharts config={config} />
          </div>
        </div>

        <div className="reportChartArea">
          <div className="reportChartBox">
              <ReactHighcharts config={config} />
          </div>
        </div> */}
      </div>

      
      </>
    );
  }
}



export default ReportResoruce;