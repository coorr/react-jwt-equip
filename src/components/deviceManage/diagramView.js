import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import {  AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import "ag-grid-enterprise";
import styles from '../../css/diagramEquipment.module.css';


const modalOptions = {
  diagramColumnDefs: [
    { headerName: '그룹 명',  headerCheckboxSelection: true, checkboxSelection:true },
    { headerName: '설명' },
    { headerName: '등록 일자' },
    { headerName: '최초 등록자', },
    { headerName: '수정 일자', },
    { headerName: '마지막 수정자', },
    { headerName: '구성도 구성', },
    { headerName: '구성도 조회', },
  ],
  diagramDefaultColDef: {
    sortable:true,  
    resizable:true,  
    floatingFilter: true,
    filter:'agTextColumnFilter', 
    flex:1,
  },
};

class diagramView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterCheck: true,
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

  render() {
    const { filterCheck } = this.state; 
    return (
      <>
        <div className={styles.diagram_container}>
          {
            filterCheck ? (
            <div className={styles.diagram_searchArea}>
              <div className={styles.diagram_searchTitleBox}>
                <div className={styles.diagram_searchTitleLeft}>
                    <label className={styles.diagram_searchTitleLeftFont}>이름</label>
                </div>
                <div className={styles.diagram_searchTitleRightArea}>
                  <input className={styles.diagram_searchTitleRightInput} />
                </div>
              </div>

              <div className={styles.diagram_selectArea}>
                <Button className={styles.diagram_selectBtn}>조회하기</Button>
              </div>
            </div>
            ) : null
          }
          

          <div className="reportFilterButtonBox">
            <button type="button" className="input-group-addon reportFilterButtonBtn" onClick={()=> this.clickFilter()}>
              <label className="reportFilterLabel">
              ▲ Filter
              </label>
            </button>
          </div>

          <div className={styles.diagram_gridArea}>
            <div className={styles.diagram_gridBtnBox}>
                <Button className="SaveBtn" onClick={this.modelOpenButtonTrue}>등록</Button>
                <Button className="SaveBtnRemove" onClick={this.onRemoveClick}>삭제</Button>
            </div>

            <div className="ag-theme-alpine" style={{ width:'96vw', height:'55vh',marginLeft:'0.5vw'}}>
              <AgGridReact
              headerHeight='30'
              floatingFiltersHeight='23'
              rowHeight='25'
              columnDefs={modalOptions.diagramColumnDefs}  
              defaultColDef={modalOptions.diagramDefaultColDef}
              rowModelType={'infinite'} 
              cacheBlockSize='30'
              onGridReady={params => { this.diagram = params.api;}}
            
             />         
            </div>
          <div>

            </div>
          </div>
        </div>
      </>
    );
  }
}

export default diagramView;