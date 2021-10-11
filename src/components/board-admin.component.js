import React, { Component } from 'react';
// import { render } from 'react-dom';
import UserService from '../services/user.service';
import EventBus from '../common/EventBus';
import Modals from '../modals/modal.component';
import Modify from '../modals/modify.component';
import Upload from '../modals/upload.component';
import { Button } from 'react-bootstrap';
import {  AgGridReact } from 'ag-grid-react';
import AiwacsService from '../services/aiwacs.service';
import ReactTooltip from 'react-tooltip';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import "ag-grid-enterprise";
import "../css/equipmentGroupManage.css"
import Select from 'react-select'
import { findDOMNode } from 'react-dom';
import { RowNode } from 'ag-grid-community';
import * as ExcelJs from 'exceljs';
import { saveAs } from 'file-saver';


const initialValue = {
          id:'',equipment: '',nickname: '',settingType: '',settingTemplate: '',settingIp: '',settingCatagory: '',settingOs: '',
          settingPerson: '',settingProxy: '',settingActive: '', hwCpu:'',hwDisk:'',hwNic:'',hwSensor:'',}
const HardwareNumber = 
[{label:'5', value:'5'},{label:'10', value:'10'},{label:'15', value:'15'},{label:'20', value:'20'},{label:'30', value:'30'},{label:'60', value:'60'}
,{label:'120', value:'120'},{label:'150', value:'150'},{label:'180', value:'180'},{label:'240', value:'240'},{label:'300', value:'300'},{label:'600', value:'600'} ];

export default class BoardAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: initialValue,
      modelOpen: false,
      modifyOpen: false,
      uploadModal: false,
      equipCheck:true,
      equipment:[],
      rowData: [],
      /* Search Filter */
      typeArray:[],
      typeData:['SNMP','ICMP'],
      typecheckList:[],
      catagoryArray:[],
      catagoryData:['Server','Network','L2 Switch','L3 Switch','L4 Switch','L7 Switch','Firewall','Security','Air Conditioner','UPS'],
      CatagoryCheckList:[],
      filterData: [],
      /* ag-grid */
      autoGroupColumnDef: {
        headerName: '그룹 명/별칭',
        field: 'title',
        resizable:true,
      },
      columnDefs: [
        { headerName: '장비명', field: 'equipment'
        ,checkboxSelection:true 
         ,onCellClicked: this.onUpdateClick},   // rowGroup:true, width:200
        { headerName: 'Public Ip', field: 'settingIp',onCellClicked: this.onUpdateClick ,checkboxSelection:false , },
        { headerName: 'OS', field: 'settingOs', onCellClicked: this.onUpdateClick },
        { headerName: '제조사', field: 'settingPerson', onCellClicked: this.onUpdateClick } ,
        { headerName: '템플릿 그룹', field: 'settingTemplate', onCellClicked: this.onUpdateClick },
        { headerName: 'HW 자원 수집주기' ,   maxWidth: 130, cellRendererFramework: this.cellTooltipBtn, },
        { headerName: '상태',  field:'settingActive', valueFormatter: this.activeFormatter ,onCellClicked: this.onUpdateClick, cellStyle: this.ActiveColor, },
        { headerName: '프록시', field: 'settingProxy',onCellClicked: this.onUpdateClick },
        { headerName: '사용자', field: '',onCellClicked: this.onUpdateClick },
      ],
      defaultColDef:   {   // 열 정의
          sortable:true,  // 열 마우스 선택 정렬
          filter:'agTextColumnFilter',  // 열 도구 
          resizable:true,  // 사이즈 조절 (width, max, min)
          floatingFilter: true,
          flex:1,
        },
      /* Tooltip Hw */
      hwid: '',
      hwCpu: {label: '' , value:'' },
      hwDisk: {label: '' , value:'' },
      hwNic: {label: '' , value:'' },
      hwSensor: {label: '' , value:'' },
      hwNumber: {label: '' , value:'' },
      hwnull: ' ' ,
      hwDefault: {label: '60' , value:'60' },
      testCheck: true,
    };       
  }
   /* 모달 창 여부 */
  cellTooltipBtn = (params) => {
      if(params.data.settingType === 'ICMP') return 'N/A' 
      else {
        return  <button className="hwTooltipBtn" onMouseOver={()=> ReactTooltip.rebuild()} onClick={()=>this.hwDataAll(params)}  data-tip data-for='hw' >변경</button>
      }
  }
   /* 활성/비활성 스타일 */
  ActiveColor = (params) => {
    if(params.data.settingActive === true) { return { color:'#7AC244'}}
    else { return {color:'#E00001'}}
  }
  /* 하드웨어 수집 데이터 */
  hwDataAll = (params) => {
    const {hwCpu,testCheck,hwNic,hwDisk,hwSensor,equipment} = this.state;

    const hwid=params.data.id;
    console.log("equipId:"+hwid);
    AiwacsService.getTooltipByNo(hwid) 
      .then((res)=> {
        const hwData=res.data;
        hwData.map(o=> this.setState({
          hwid: o.id,
          hwCpu:{label:o.hwCpu,value:o.hwCpu},
          hwNic:{label:o.hwNic,value:o.hwNic},
          hwSensor:{label:o.hwSensor,value:o.hwSensor},
          hwDisk:{label:o.hwDisk,value:o.hwDisk},
          hwNumber: {label:o.hwCpu,value:o.hwCpu},
        }))
      })
      
  }
 /* 모달 창 여부 */
  modelOpenButton = () => {this.setState({ modelOpen: false });};
  modelOpenButtonTrue = () => { this.setState({ modelOpen: true }); };
  modifyOpenButton = () => { this.setState({modifyOpen: false})}
  modifyOpenButtonTrue = () => { this.setState({modifyOpen: true})}
  uploadOpenButton = () => { this.setState({uploadModal: false})}
  uploadOpenButtonTrue = () => { this.setState({uploadModal: true})}

  componentDidUpdate() {
    ReactTooltip.rebuild();
  }
 
  componentDidMount() {
    const typeDatas = [{id: 1,value:'SNMP'},{id: 2,value:'ICMP'}];
    const catagoryDatas = [{id: 1,value:'Server'},{id: 2,value:'Network'},{id: 3,value:'L2 Switch'},{id: 4,value:'L3 Switch'},{id: 5,value:'L4 Switch'}
                      ,{id: 6,value:'L7 Switch'},{id: 7,value:'Firewall'},{id: 8,value:'Security'},{id: 9,value:'Air Conditioner'},{id: 10,value:'UPS'}];
    this.setState({typeArray:typeDatas})
    this.setState({typecheckList:new Array(typeDatas.length).fill(true)})
    this.setState({catagoryArray:catagoryDatas})
    this.setState({CatagoryCheckList:new Array(catagoryDatas.length).fill(true)})
    
    /* 관리자 권환 */
    UserService.getAdminBoard()
    .then(response => {
        this.setState({
          content: response.data,
        });
      },
      error => {
        this.setState({
          content: (error.response && error.response.data && error.response.data.message) || error.message || error.toString(),
        });

        if (error.response && error.response.status === 401) {
          EventBus.dispatch('logout');
        }
      },
    );
    /* 장비 조회 */
    AiwacsService.getEquipment().then((res) => {
      this.setState({equipment:res.data})
    });
  }

 
/* 활성/비활성 문자열  */
  activeFormatter = (params) => { return params.value ? '활성':'비활성'; } 
/* params  */
  onGridReady = (params) => {this.setState({GridApi:params})}
/* 수정  */
  onUpdateClick = (params) => {
    console.log( params.data);
    console.log("formData : " + JSON.stringify(this.state.formData))
    this.setState({formData:params.data})
    console.log("formData After: "+ JSON.stringify(this.state.formData));
    this.setState({modifyOpen: true})
  };
/* 삭제  */
  onRemoveClick = () => {
    const checkNodes = this.gridApi.getSelectedNodes();
    const checkData = checkNodes.map(c => c.data.id);
    const equipId = checkData.join('|');

    console.log(equipId);
    console.log(JSON.stringify(equipId));
    console.log("equipId : "+Object.keys(checkData).length);

    if(Object.keys(checkData).length > 0)  {
      AiwacsService.deleteEquipment(equipId)
        .then((res) => {
            console.log("삭제 이벤트")
            alert("삭제 되었습니다.")
            window.location.reload();
          })
        } 
        else { alert("삭제할 데이터가 없습니다.")}
  };
/* 활성  */
  onActiveButton = () => {
    const activeNodes = this.gridApi.getSelectedNodes();
    const equipIds = activeNodes.map(c => c.data.id);
    const equipId = equipIds.join('|');
    console.log("onActive : " + equipId);
    console.log(equipIds);
    console.log(equipId);
    console.log(JSON.stringify(equipId));
    
    if(Object.keys(equipId).length > 0) {
      AiwacsService.onActiveEquipment(equipId)
        .then((res) => {
          console.log("활성 이벤트");
          alert("활성되었습니다.")
          window.location.reload();
      }) 
    }
    else {alert("선택한 데이터가 없습니다.")}   
      }
/* 비활성  */
  offActiveButton = () => {
    const activeNodes = this.gridApi.getSelectedNodes();
    const equipIds = activeNodes.map(c => c.data.id);
    const equipId = equipIds.join('|');

    if(Object.keys(equipId).length > 0) {
      AiwacsService.offActiveEquipment(equipId)
        .then((res) => {
          console.log("비활성 이벤트");
          alert("비활성되었습니다.")
          window.location.reload();
      }) 
    }
    else {alert("선택한 데이터가 없습니다.")}   
    }
/* 타입 체크 */
  TypeFilter = (item) => {
   const {typecheckList,typeData} = this.state;
   var newArray = [...typeData, item.value]

   const changeCheck = typecheckList.map((check,idx) => {  // 개별 활성-비활성
    if(idx === item.id - 1) check = !check;
    console.log("check:"+ check);
    return check;
  });
   this.setState({typecheckList:changeCheck})

   if(typeData.includes(item.value)) {   // 중복 데이터 제거
     newArray = newArray.filter(o => o !== item.value);
   }
   this.setState({typeData:newArray})

   console.log("typecheckList : " +typecheckList);
   console.log("changeCheck : "+ changeCheck); 
 }
  /* 타입 전체 체크 */
 TypeFilterAll = (e) => {
   console.log("checked+++++++:" + JSON.stringify(e.target.checked)); 
   const {typecheckList,typeData,typeArray} = this.state;
   const newArray=['SNMP','ICMP'];

   const tmpArr=typecheckList.map((item) => {     // checked bool값에 따라 체크리스트 전체 true 이거나 false로 줌.
     item = e.target.checked ? true:false;
     return item;
   })
   console.log("newArray : "+ JSON.stringify(newArray));
   this.setState({typeData: e.target.checked ? newArray: []})   // true 이면 데이터 초기화 - false이면 빈 배열

   console.log("tmpArr:" + tmpArr);
   this.setState({
     typecheckList:tmpArr,
   })
 }
 /* 유형 체크 */
 CatagoryFilter = (item) => {
  const {CatagoryCheckList,catagoryData} = this.state;
  var newArray = [...catagoryData, item.value]
  const changeCheck = CatagoryCheckList.map((check,idx) => {
   if(idx === item.id - 1) check = !check;
   return check;
  });
  
  if(catagoryData.includes(item.value)) {
    newArray = newArray.filter(o => o !== item.value);
  }
  this.setState({CatagoryCheckList:changeCheck})
  this.setState({catagoryData:newArray})
 }
/* 유형 전체 체크 */
CatagoryFilterAll = (e) => {
  const {CatagoryCheckList,catagoryData} = this.state;
  const newArray=['Server','Network','L2 Switch','L3 Switch','L4 Switch','L7 Switch','Firewall','Security','Air Conditioner','UPS'];
  const tmpArr=CatagoryCheckList.map((item) => {
    item = e.target.checked ? true:false;
    return item;
  })
  this.setState({catagoryData: e.target.checked ? newArray: []})
  this.setState({
    CatagoryCheckList:tmpArr,
  })
}
/* 조회하기 버튼 */
filterSelect = () => {
    const {typeData,catagoryData} = this.state;
    const equipType=typeData.join(',');
    const equipCatagory=catagoryData.join(',');
    console.log(equipType,equipCatagory);

    if(equipType !== '' && equipCatagory !== '') {
      AiwacsService.typeFilterEquipment(equipType,equipCatagory)
    .then((res) => {
      this.setState({filterData:res.data,equipCheck:false})
    })
    } 
    else if(equipType === '') { 
      alert("장비 타입을 1개 이상 선택해 주세요.")
    } else {
      alert("장비 유형을 1개 이상 선택해 주세요. ")
    } 
  }

cpuHwChange = (value) => {this.setState({hwCpu:value})}
diskHwChange = (value) => {this.setState({hwDisk:value})}
nicHwChange = (value) => {this.setState({hwNic:value})}
sensorHwChange = (value) => {this.setState({hwSensor:value})}
allHwChange = (value) => { this.setState({ hwNumber:value})}
/* 툴팁 기본값*/
defaultTooltipAggrid = () => {
  const {hwDefault} = this.state;
  this.setState({ 
    hwCpu:hwDefault,
    hwDisk:hwDefault,
    hwNic:hwDefault,
    hwSensor:hwDefault,
    hwNumber:hwDefault,
})}
defaultAgentTooltip = () => {
  this.setState({ 
    hwCpu:{label: '60' , value:'60' },
    hwDisk:{label: '120' , value:'120' },
    hwNic:{label: '60' , value:'60' },
    hwSensor:{label: '60' , value:'60' },
    hwNumber:{label: '60' , value:'60' },
})}
defaultSnmpTooltip = () => {
  this.setState({ 
    hwCpu:{label: '120' , value:'120' },
    hwDisk:{label: '120' , value:'120' },
    hwNic:{label: '180' , value:'180' },
    hwSensor:{label: '120' , value:'120' },
    hwNumber:{label: '120' , value:'120' },
})}

/* 툴팁 POST*/
cpuOnClick = () => {
  // cosnt {equipment} = this.state;
  const {hwCpu,hwid,hwnull,equipment} = this.state;
  AiwacsService.eachTooltipHwUpdateEquipment(hwCpu.value,hwnull,hwnull,hwnull,hwid)
  .then((res)=> {
     alert("변경되었습니다.")
    })
}

diskOnClick = () => {
  const {hwDisk,hwid,hwnull} = this.state;
  AiwacsService.eachTooltipHwUpdateEquipment(hwnull,hwDisk.value,hwnull,hwnull,hwid)  
  .then(()=> {
     alert("변경되었습니다.")
    })
}
nicOnClick = () => {
  const {hwNic,hwid,hwnull} = this.state;
  AiwacsService.eachTooltipHwUpdateEquipment(hwnull,hwnull,hwNic.value,hwnull,hwid) 
  .then(()=> {
     alert("변경되었습니다.")
    })
}
sensorOnClick = () => {
  const {hwSensor,hwid,hwnull} = this.state;
  AiwacsService.eachTooltipHwUpdateEquipment(hwnull,hwnull,hwnull,hwSensor.value,hwid)  
  .then(()=> {
     alert("변경되었습니다.")
    })
}
allHwOnClick = () => {
  const {hwid,hwNumber} = this.state;
  AiwacsService.allTooltipHwUpdateEquipment(hwNumber.value,hwNumber.value,hwNumber.value,hwNumber.value,hwid)
  .then(()=> {
     alert("변경되었습니다.")
    })
}
/* 툴팁 Check POST */
allCheckHwOnClick = () => {
  const checkNodes = this.gridApi.getSelectedNodes();
  const checkData = checkNodes.map(c => c.data.id);
  const equipId = checkData.join(',');
  const {hwCpu,hwDisk,hwNic,hwSensor,hwNumber} = this.state;
  console.log(equipId);
  if(equipId !== '' && hwNumber.value !== '') {
    AiwacsService.allTooltipHwUpdateEquipment(hwCpu.value,hwDisk.value,hwNic.value,hwSensor.value,equipId)
    .then(()=> {

       alert("변경되었습니다.")
      })
  } else if(hwNumber.value === '') {
    alert("주기를 선택해주세요.")
  } else {
    alert("변경할 데이터가 없습니다.")
  }
}
cpuCheckOnClick = () => {
  const checkNodes = this.gridApi.getSelectedNodes();
  const checkData = checkNodes.map(c => c.data.id);
  const equipId = checkData.join(',');
  const {hwCpu,hwnull} = this.state;
  console.log("equipId: "+ equipId);
  if(equipId !== '' && hwCpu.value !== '') {
  AiwacsService.eachTooltipHwUpdateEquipment(hwCpu.value,hwnull,hwnull,hwnull,equipId)
  .then(()=> {
     alert("변경되었습니다.")
    })
  } else if(hwCpu.value === '') {
    alert("주기를 선택해주세요.")
  } else {
    alert("변경할 데이터가 없습니다.")
  } 
}
diskCheckOnClick = () => {
  const checkNodes = this.gridApi.getSelectedNodes();
  const checkData = checkNodes.map(c => c.data.id);
  const equipId = checkData.join(',');
  const {hwDisk,hwnull} = this.state;
  if(equipId !== '' && hwDisk.value !== '') {
  AiwacsService.eachTooltipHwUpdateEquipment(hwnull,hwDisk.value,hwnull,hwnull,equipId)
  .then(()=> {
     alert("변경되었습니다.")
    })
  } else if(hwDisk.value === '') {
    alert("주기를 선택해주세요.")
  } else {
    alert("변경할 데이터가 없습니다.")
  } 
}
nicCheckOnClick = () => {
  const checkNodes = this.gridApi.getSelectedNodes();
  const checkData = checkNodes.map(c => c.data.id);
  const equipId = checkData.join(',');
  const {hwNic,hwnull} = this.state;
  if(equipId !== '' && hwNic.value !== '') {
  AiwacsService.eachTooltipHwUpdateEquipment(hwnull,hwnull,hwNic.value,hwnull,equipId)
  .then(()=> {
     alert("변경되었습니다.")
    })
  } else if(hwNic.value === '') {
    alert("주기를 선택해주세요.")
  } else {
    alert("변경할 데이터가 없습니다.")
  } 
}
sensorCheckOnClick = () => {
  const checkNodes = this.gridApi.getSelectedNodes();
  const checkData = checkNodes.map(c => c.data.id);
  const equipId = checkData.join(',');
  const {hwSensor,hwnull} = this.state;
  if(equipId !== '' && hwSensor.value !== '') {
  AiwacsService.eachTooltipHwUpdateEquipment(hwnull,hwnull,hwnull,hwSensor.value,equipId)
  .then(()=> {
     alert("변경되었습니다.")
    })
  } else if(hwSensor.value === '') {
    alert("주기를 선택해주세요.")
  } else {
    alert("변경할 데이터가 없습니다.")
  } 
}
tooltipValidation = () => {
  const checkNodes = this.gridApi.getSelectedNodes();
  const checkData = checkNodes.map(c => c.data.id);
  const equipId = checkData.join(',');
  if(equipId === '') { 
    alert("변경할 데이터가 없습니다.")
    ReactTooltip.hide();
   }
   this.setState({
    hwid: '',
    hwCpu:{label:'',value:''},
    hwNic:{label:'',value:''},
    hwSensor:{label:'',value:''},
    hwDisk:{label:'',value:''},
    hwNumber: {label:'',value:''},
   })
}
/* excel 다운로드 */
downloadExcel = () => {
  AiwacsService.downloadExcel()
  .then((res) => {
    const mimeType = { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };
    const blob =new Blob([res.data],mimeType);
    saveAs(blob,"tttt2.xls")
    console.log(res.data);
  })
}


  render() {
    const { columnDefs ,defaultColDef,equipment,formData,typeArray,typecheckList,typeData
    ,catagoryArray,CatagoryCheckList,catagoryData,filterData,equipCheck,gridComponents,hwCpu,hwDisk,hwSensor,hwNic,hwid,hwNumber} = this.state;

    return (
      <div className="ContainerAdmin">
        <div className="sideBarArea">
        </div>

       

      <div className="FilterContainer">
       <div className="topFilterArea"> 
          <div className="topFilterBox">
            <div className="selectFilterSpace">
                <div className="selectBox">
                    <p className="selectFont">조회</p>
                </div>
                <div className="selectCheckBox">
                  <div className="filterInput">
                     {/* <input type="radio"/><span className="filterSpan">그룹 </span>
                     <input type="radio"/><span className="filterSpan">전체</span> */}
                  </div>
                </div>
            </div>

            <div className="selectFilterSpace">
                <div className="selectBox">
                    <p className="selectFont">장비 타입</p>
                </div>
                <div className="selectCheckBox">
                  <div className="filterInput">
                  <input type="checkbox"  checked={typecheckList.length===typeData.length ? true:false} onChange={(e)=> this.TypeFilterAll(e)} />
                  <span className="filterSpan">ALL |</span>
                     {
                       typeArray.map((o,i) =>(
                         <>
                           <input type="checkbox" checked={typecheckList[o.id -1]} onChange={(e)=> this.TypeFilter(o,e.target.checked,e.target.value)} />
                           <span className="filterSpan">{o.value}</span>
                         </>
                       ))
                     }
                  </div>
                </div>
            </div>

            <div className="selectFilterSpace">
                  <div className="selectBox">
                      <p className="selectFont">장비 유형</p>
                  </div>
                  <div className="selectCheckBox">
                    <div className="filterInput">
                    <input type="checkbox" checked={CatagoryCheckList.length===catagoryData.length ? true:false} onChange={(e)=> this.CatagoryFilterAll(e)} />
                    <span className="filterSpan">ALL |</span>
                      {
                        catagoryArray.map((o,i) => (
                          <>
                           <input type="checkbox" checked={CatagoryCheckList[o.id -1]} onChange={(e)=> this.CatagoryFilter(o,e.target.checked,e.target.value)} />
                           <span className="filterSpan">{o.value}</span>
                         </>
                        ))
                      }
                    </div>
                  </div>
              </div>

            <div className="selectFilterSpace">
                  <div className="selectBox">
                      <p className="selectFont">장비 정보</p>
                  </div>
                  <div className="selectCheckBox">
                    <div className="filterInput">
                      {/* <input type="checkbox"/><span className="filterSpan">ALL |</span>
                      <input type="checkbox"/><span className="filterSpan">수집 주기</span>
                      <input type="checkbox"/><span className="filterSpan">PING</span> */}
                    </div>
                  </div>
            </div>
          </div>
          <div className="topFilterBottomArea">
                    <Button className="topFilterBottomBtn" onClick={this.filterSelect} >조회하기</Button>
          </div>
       </div> 

       <div className="middleFilterArea">
    
        
       </div>

       <div className="bottomFilterArea">
         <div className="bottomHighArea">  
            <div className="leftTextBox">
                <p className="textFont">조회 장비 수 : 19대  (※ 그룹이 중복된 장비가 존재하는 경우, 카운트가 증가되어 나타납니다.)</p>
                
            </div>
            <div className="rightSaveBox">
              <div className="rightSnmpArea">
                <label className="rightSnmpLabel">SNMP TimeOut</label>
                <Button className="rightSnmpBtn">변경</Button>           
                <label className="rightSnmpLabel">PING 설정</label>
                <Button className="rightSnmpBtn">변경</Button>  
                <label className="rightSnmpLabel">하드웨어 자원 수집 주기</label>
                <Button onClick={()=>this.tooltipValidation()} data-tip data-for="checkHw" className="rightSnmpBtn">변경</Button>  
                <label className="rightSnmpLabel">소프트웨어 자원 수집 주기</label>
                <Button className="rightSnmpBtn">변경</Button>  

                <Button className="SaveBtn" onClick={this.modelOpenButtonTrue}>등록</Button>
                <Button className="SaveBtnRemove" onClick={this.onRemoveClick}>삭제</Button>
                {
                this.state.modelOpen ? <Modals show={this.state.modelOpen}  onHide={this.modelOpenButton} /> : null
                }
              </div>
            </div>
         </div>

          <div className="agGridArea">
            <div className="agGridBox">
            {/* <ReactTooltip /> */}
            <div className="ag-theme-alpine" style={{ width:'95vw', height:'48vh'}}>
                <AgGridReact
                  headerHeight='30'
                  floatingFiltersHeight='27'
                  rowHeight='30'
                  rowData={equipCheck ? equipment : filterData}  // groups / equipment / 
                  rowSelection="multiple"
                  columnDefs={columnDefs}   // columnDefs  / columns
                  onGridReady={params => (this.gridApi = params.api)} // {params => (this.gridApi = params.api)}
                  groupSelectsChildren={true} // 자식노드까지 체크
                  enableRangeSelection={true}  // 다중 선택 가능
                  defaultColDef={defaultColDef}
                  // suppressChangeDetection={false}
                  // suppressModelUpdateAfterUpdateTransaction={true}
                  deltaRowDataMode={false}
                  //// onCellClicked={this.onUpdateClick}
                  // gridOptions={this.gridOptions.setRowData(equipment)}
                  frameworkComponents={gridComponents}
                  // tooltipShowDelay={0}
                  // autoGroupColumnDef={{
                  //   headerName: '그룹 장비',
                  //   minWidth: 300,
                  //   cellRendererParams: { suppressCount: true },
                  // }}
                  // getDataPath={data => { return data.orgHierarchy}}
                  // suppressCellSelection={true}
                  // autoGroupColumnDef={autoGroupColumnDef}  // 자동 열 그룹 지정 - 첫번째열
                  
                />
                {
                 this.state.modifyOpen  ? <Modify show={this.state.modifyOpen}  onHide={this.modifyOpenButton} data={formData}  /> : null
                }         
            </div>
            </div>
          </div>

          <div className="underArea">
            <div className="underLeftArea">
                    <Button className="underBtn">장비 그룹 관리</Button>
                    <Button className="underBtn">프록시 관리</Button>
                    <Button className="underBtn">Agent 관리</Button>
                    <Button className="underBtn whiteBtn" onClick={this.uploadOpenButtonTrue} >장비 일괄 관리</Button>
                    {
                      this.state.uploadModal ? <Upload show={this.state.uploadModal}  onHide={this.uploadOpenButton} /> : null
                    }
                    <Button className="underBtn whiteBtn" onClick={this.downloadExcel} >내보내기</Button>
            </div>
            <div className="underRightArea"> 
                <div className="underRightBox">
                    <Button className="underBtn" onClick={this.onActiveButton} >장비 활성</Button>
                    <Button className="underBtn grayBtn" onClick={this.offActiveButton} >장비 비활성</Button>
                    <Button className="underBtn">PING 활성</Button>
                    <Button className="underBtn grayBtn">PING 비활성</Button> 
               </div>
            </div>
          </div>
       </div>
       
       {/* 툴립 One */}
       <ReactTooltip  event="click"  getContent={()=> equipment} 
       ref= {el => this.tooltipTwo = el} className="extraClass" place="right" type="dark" effect="float" clickable={true}  isCapture={true}   id="hw">
           <div className="tooltipArea">
              <div className="tooltipHigh">
                  <button className="hideHwTooltip" onClick={()=>{this.tooltipTwo.tooltipRef = null; ReactTooltip.hide(); }}><span style={{color:'#267dff',fontWeight:'bold'}}>X</span></button>
              </div>
              <div className="headerArea">
              <div className="headerLeft">
              <label className="headerLeftFont">일괄 적용</label>
              <label className="headerLeftFontTwo">시스템 주기</label>
            </div>
            <div className="headerRight">
              <button className="headerRightFont" onClick={()=> this.defaultTooltipAggrid()}>단위 초(기본 60)</button>

           
              <div className="headerRightAddBtn">
                <Select className="headerRightSelect" options={HardwareNumber} value={hwNumber} onChange={value=> this.allHwChange(value)}  />
                <button className="headerRightBtn" onClick={this.allHwOnClick} >변경</button>
              </div>
            </div>
          </div>
      
          <div className="middleArea">
              <label className="middleRightFont">개별 적용</label>
              <label className="middleRightAddFont">단위 초</label>
          </div>
          <div className="bottomArea">
              <label style={{marginRight: '10px' ,marginTop:'7px'}}>CPU/MEM</label>
              <Select className="middleRightSelectTwo" options={HardwareNumber}  value={hwCpu} onChange={value=> this.cpuHwChange(value)} />
              <button className="headerRightBtn" onClick={this.cpuOnClick} >변경</button>
          </div>
          <div className="bottomAreaDisk">
              <label style={{marginRight: '43px',marginTop:'7px'}}>DISK</label>
              <Select className="middleRightSelectTwo" options={HardwareNumber}  value={hwDisk} onChange={value=> this.diskHwChange(value)} />
              <button className="headerRightBtn" onClick={this.diskOnClick}>변경</button>
          </div>
          <div className="bottomAreaDisk">
              <label style={{marginRight: '48px',marginTop:'7px'}}>NIC</label>
              <Select className="middleRightSelectTwo" options={HardwareNumber} value={hwNic} onChange={value=> this.nicHwChange(value)} />
              <button className="headerRightBtn" onClick={this.nicOnClick}>변경</button>
          </div>
          <div className="bottomAreaDisk">
              <label style={{marginRight: '30px',marginTop:'7px'}}>Sensor</label>
              <Select className="middleRightSelectTwo" options={HardwareNumber}  value={hwSensor} onChange={value=> this.sensorHwChange(value)} />
              <button className="headerRightBtn" onClick={this.sensorOnClick}>변경</button>
          </div> 
        
       </div>  
           </ReactTooltip> 


       {/* 툴립 Two */}
       <ReactTooltip ref= {el => this.tooltip = el}  className="extraClass" place="right" type="dark" effect="float" clickable={true}  isCapture={true} event="click"  id="checkHw">
           <div className="tooltipAreaTwo">
              <div className="tooltipHigh">
                  <button className="hideHwTooltipTwo" onClick={()=>{this.tooltip.tooltipRef = null; ReactTooltip.hide()}}><span style={{color:'#267dff',fontWeight:'bold'}}>X</span></button>
              </div>
            <div className="headerAreaTwo">
              <div className="headerLeftTwo">
                <label className="headerLeftFontTwoReal">일괄 적용</label>
                <button className="headerRightFontTwo" onClick={()=> this.defaultAgentTooltip()}><span>( Agent 기본</span></button>
                  <label className="headerLeftFontTwo">시스템 주기</label>
              </div>

              <div className="headerRightTwo">
                <button className="headerRightFontTwoReal" onClick={()=> this.defaultSnmpTooltip()}><span>단위 초 SNMP 기본 )</span></button>

            
                <div className="headerRightAddBtn">
                  <Select className="headerRightSelect" options={HardwareNumber} value={hwNumber} onChange={value=> this.allHwChange(value)}  />
                  <button className="headerRightBtn" onClick={this.allCheckHwOnClick} >변경</button>
                </div>
            </div>
          </div>
      
           <div className="middleAreaTwo">
              <label className="middleRightFont">개별 적용</label>
              <label className="middleRightAddFont">단위 초</label>
          </div>
          <div className="bottomAreaTwo">
              <label style={{marginRight: '36px' ,marginTop:'7px'}}>CPU/MEM</label>
              <Select className="middleRightSelectTwo" options={HardwareNumber}  value={hwCpu} onChange={value=> this.cpuHwChange(value)} />
              <button className="headerRightBtn" onClick={this.cpuCheckOnClick} >변경</button>
          </div>
          <div className="bottomAreaDiskTwo">
              <label style={{marginRight: '69px',marginTop:'7px'}}>DISK</label>
              <Select className="middleRightSelectTwo" options={HardwareNumber}  value={hwDisk} onChange={value=> this.diskHwChange(value)} />
              <button className="headerRightBtn" onClick={this.diskCheckOnClick}>변경</button>
          </div>
          <div className="bottomAreaDiskTwo">
              <label style={{marginRight: '74px',marginTop:'7px'}}>NIC</label>
              <Select className="middleRightSelectTwo" options={HardwareNumber} value={hwNic} onChange={value=> this.nicHwChange(value)} />
              <button className="headerRightBtn" onClick={this.nicCheckOnClick}>변경</button>
          </div>
          <div className="bottomAreaDiskTwo">
              <label style={{marginRight: '56px',marginTop:'7px'}}>Sensor</label>
              <Select className="middleRightSelectTwo" options={HardwareNumber}  value={hwSensor} onChange={value=> this.sensorHwChange(value)} />
              <button className="headerRightBtn" onClick={this.sensorCheckOnClick}>변경</button>
          </div>  
        
           </div>  
           </ReactTooltip> 
       
     </div>

    </div>

        
    );
  }
}