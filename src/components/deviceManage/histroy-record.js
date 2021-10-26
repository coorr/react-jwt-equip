import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import {  AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import "ag-grid-enterprise";
import { Navbar, Nav, NavDropdown,LinkContainer,NavItem,Logout } from "react-bootstrap";



export default class historyRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  render() {
   
    return (
          <>
          
          </>


          // <div className="agGridArea">
          //   <div className="agGridBox">
          //   <div className="ag-theme-alpine" style={{ width:'95vw', height:'48vh'}}>
             
          
          //         <AgGridReact
          //         headerHeight='30'
          //         floatingFiltersHeight='23'
          //         rowHeight='25'
          //         // rowData={this.recursion(groups)}
          //         rowData={this.recursion(groups)}
          //         rowSelection='multiple'
          //         onGridReady={params => {this.gridApi = params.api;}} 
          //         groupSelectsChildren={true} // 자식노드까지 체크 ( 지원 안됨 )
          //         enableRangeSelection={true} 
          //         defaultColDef={defaultColDef}
          //         columnDefs={columnDefs}  
          //         autoGroupColumnDef={this.state.autoGroupColumnDef }  
          //         treeData={true}
          //         getDataPath= {data => {
          //           return data.hierarchy;
          //         }}
          //         onSelectionChanged={this.onSelectionChanged}
          //         />
                 
              
                
                        
          //   </div>
          //   </div>
          // </div>

         

        
    );
   
  }
}