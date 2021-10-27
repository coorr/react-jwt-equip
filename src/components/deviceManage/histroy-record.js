import React, { Component } from 'react';
import {  AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import "ag-grid-enterprise";
import {Button, Navbar, Nav, NavDropdown,LinkContainer,NavItem,Logout } from "react-bootstrap";

import '../../css/historyRecord.css'



export default class historyRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      test : [
        { title:'aaa'}
      ],
      columnDefs : [
        { headerName: '사용자', },   // rowGroup:true, width:200
        { headerName: '작업 구분',  },
        { headerName: '메뉴 1',  },
        { headerName: '메뉴 2',  } ,
        { headerName: '매뉴 3',  },
        { headerName: '메뉴 4' ,   },
        { headerName: '작업 대상',   },
        { headerName: '사용자 IP',  },
        { headerName: '작업 URL',  },
        { headerName: '작업 일자',  },
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

  render() {
   const { columnDefs,test, defaultColDef } = this.state;

    return (
          <div className="historyContainer">
            {/* 상단 */}
            <div className="historyFilterContainer"></div>
            {/* 중간*/}
            <div className="historyMiddleContainer"> </div>
            {/* 하단 */}
            <div className="historyAggridContainer">
              <div className="histroyExcelArea">
                <Button className="historyExcelText">내보내기</Button>
              </div>
                <div className="ag-theme-alpine" style={{ width:'97vw', height:'48vh'}}>
                
                  <AgGridReact
                  headerHeight='30'
                  floatingFiltersHeight='23'
                  rowHeight='25'
                  columnDefs={columnDefs}  
                  defaultColDef={defaultColDef}

                  rowData={test}
                //  autoGroupColumnDef={this.state.autoGroupColumnDef }  
                  />
                    
                 
                   
                           
               </div>
            </div>
          </div>


         

        
    );
   
  }
}