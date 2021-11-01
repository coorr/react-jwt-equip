import React, { Component } from 'react';
import {  AgGridReact } from 'ag-grid-react';
import HistoryRecord from '../../services/historyRecord.service'
import Select from "react-select";

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import "ag-grid-enterprise";
import {Button, Navbar, Nav, NavDropdown,LinkContainer,NavItem,Logout } from "react-bootstrap";

import '../../css/historyRecord.css'



export default class historyRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [],
      test : [
        { title:'aaa'}
      ],
      columnDefs : [
        { headerName: '사용자', field:'userName' },   // rowGroup:true, width:200
        { headerName: '작업 구분', field:'actionType' },
        { headerName: '메뉴 1', field:'menuDepth1' },
        { headerName: '메뉴 2', field:'menuDepth2' } ,
        { headerName: '매뉴 3', field:'menuDepth3' },
        { headerName: '메뉴 4' , field:'menuDepth4'  },
        { headerName: '작업 대상', field:'targetName'  },
        { headerName: '사용자 IP', field:'settingIp' },
        { headerName: '작업 URL', field:'pageURL' },
        { headerName: '작업 일자', field:'workDate' },
      ],
      defaultColDef: {
        sortable:true,  // 열 마우스 선택 정렬
        resizable:true,  // 사이즈 조절 (width, max, min)
        floatingFilter: true,
        flex:1,
        maxWidth:210,
      }
    }
  }

  componentDidMount() {
    
    HistoryRecord.getHistoryRecord() 
      .then(res => {
        console.log(res.data);
        this.setState({history:res.data})
      })
  }

  render() {
   const { columnDefs,test, defaultColDef,history } = this.state;

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
                          <button className="historyFilterSearch" >선택</button>
                          <Select  />
                        </div>
                      </div>
                  </div>

                  <div className="historyFilterBoxLeftSecond">
                      <div className="historyFilterTitle">
                        <p className="historyFilterTextSecond" >작업 구분</p>
                      </div>
                      <div className="historyFilterSearchArea">
                        {/* <button className="historyFilterSearch" >선택</button>
                        <div></div> */}
                      </div>
                  </div>

                  <div className="historyFilterBoxLeftThird">
                      <div className="historyFilterTitle">
                        <p className="historyFilterTextThird" >작업 날짜</p>
                      </div>
                      <div className="historyFilterSearchArea">
                        {/* <button className="historyFilterSearch" >선택</button>
                        <div></div> */}
                      </div>
                  </div>
              </div>

              <div className="historyMiddleSelectBtnSpace">
                  <Button className="historyMiddleSelectBtn">조회하기</Button>
                  <Button className="historyMiddleReloadBtn" >초기화</Button>
              </div>
            </div>
            {/* 중간*/}
            <div className="historyMiddleContainer"> 
              
            </div>
            {/* 하단 */}
            <div className="historyAggridContainer">
              <div className="histroyExcelArea">
                <Button className="historyExcelText">내보내기</Button>
              </div>
                <div className="ag-theme-alpine" style={{ width:'96vw', height:'48vh',marginLeft:'0.5vw'}}>
                
                  <AgGridReact
                  headerHeight='30'
                  floatingFiltersHeight='23'
                  rowHeight='25'
                  columnDefs={columnDefs}  
                  defaultColDef={defaultColDef}

                  rowData={history}
                //  autoGroupColumnDef={this.state.autoGroupColumnDef }  
                  />
                    
                 
                   
                           
               </div>
            </div>
          </div>


         

        
    );
   
  }
}