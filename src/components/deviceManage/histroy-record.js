import React, { Component } from 'react';
import {  AgGridReact } from 'ag-grid-react';
import HistoryRecord from '../../services/historyRecord.service'
import Select from "react-select";
import Search from '../../images/search.png'

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import "ag-grid-enterprise";
import {Button, Modal,Form, Container, Row } from "react-bootstrap";

import 'bootstrap/dist/css/bootstrap.min.css';

import '../../css/historyRecord.css'

const customStyles = {
  control: base => ({
    ...base,
    height: 28,
    minHeight: 28
  })
};

export default class historyRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      historyModel: false,
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
        sortable:true,  
        resizable:true,  
        floatingFilter: true,
        filter:'agTextColumnFilter', 
        flex:1,
        maxWidth:210,
      },
      /** user model **/
      userColumnDefs: [ 
        { headerName: '로그인 ID', field:'username', headerCheckboxSelection: true, checkboxSelection:true },
        { headerName: '메일', field:'email'},
        { headerName: '권한', field:'username'},
        { headerName: '로그인 제한', field:'X'},
      ],
      userDefaultColDef: {
        sortable:true, 
        resizable:true,  
        floatingFilter: true,
        filter:'agTextColumnFilter', 
        flex:1,
        maxWidth:210,
      },
      user: [
        { value:"아아ㄴㅁㅇㄴㅁㅇ",label: "Blue"}
      ],
      searchName:[],
      historyActiveArray:[],  
      historyActiveData:['LOGIN','LOGOUT','CREATE','UPDATE','DELETE','ACTIVE','INACTIVE','RESTART','DOWNLOAD'],
      historyActiveList:[],
    }
  }

  componentDidMount() {
    const {historyActiveList,} = this.state;
    const activeData = [{id: 1,value:'LOGIN'},{id: 2,value:'LOGOUT'},{id: 3,value:'CREATE'},{id: 4,value:'UPDATE'},{id: 5,value:'DELETE'}
    ,{id: 6,value:'ACTIVE'},{id: 7,value:'INACTIVE'},{id: 8,value:'RESTART'},{id: 9,value:'DOWNLOAD'}];

    this.setState({
      historyActiveArray:activeData,
      historyActiveList:new Array(activeData.length).fill(true),
    })


    HistoryRecord.getHistoryRecord() 
      .then(res => {
        console.log(res.data);
        this.setState({history:res.data})
      })
  }

  historySelect = () => {
    HistoryRecord.getUserHistory()
      .then(res => {
        console.log(res.data);
        const userData = [];
        const data = res.data;
        data.forEach(u => {
          u.roles.forEach(r=> {
            u.role= r.name;
          })
        })
        console.log(data);
        this.setState({user:res.data,historyModel:true})
      })
    // this.setState({historyModel:true})
  }
  /** user 적용  **/
  historyApply = () => {
    const applyData = this.gridApi.getSelectedRows();
    console.log(applyData);
    const applyUsername= [];
    applyData.forEach(a => {
        console.log(a.username);
        const obj = {};
        obj.value = a.username;
        obj.label = a.username;
        applyUsername.push(obj);
        // applyUsername.push(a.username);
    })
    this.setState({searchName: applyUsername, historyModel:false})
  }

  /** 작업 구분 전체  **/
  activeAll = (e) => {
    const {historyActiveList} = this.state;
    const newArray=['LOGIN','LOGOUT','CREATE','UPDATE','DELETE','ACTIVE','INACTIVE','RESTART','DOWNLOAD'];
    const tmpArr=historyActiveList.map((item) => {
      item = e.target.checked ? true:false;
      return item;
    })
    this.setState({historyActiveData: e.target.checked ? newArray: []})
    this.setState({
      historyActiveList:tmpArr,
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

  

  render() {
   const { columnDefs,test, defaultColDef,history,user,historyModel,userColumnDefs,userDefaultColDef,searchName, historyActiveArray,historyActiveData,historyActiveList } = this.state;

    console.log(searchName);

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
                            {/* <Modal show={historyModel} onHide={()=>this.setState({historyModel:false})} size='xl'   > */}
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
                                                onGridReady={params => {this.gridApi = params.api;}} 
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
                          value={searchName}
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
                                <input type="checkbox" checked={historyActiveList[o.id -1]} onChange={(e)=> this.activeEach(o,e.target.checked,e.target.value)} />
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