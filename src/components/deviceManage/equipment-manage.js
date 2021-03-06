import React, { Component } from 'react';
import UserService from '../../services/user.service';
import EventBus from '../../common/user/EventBus';
import Modals from '../../modals/modal.component';
import Modify from '../../modals/modify.component';
import Upload from '../../modals/upload.component';
import { Button } from 'react-bootstrap';
import {  AgGridReact } from 'ag-grid-react';
import AiwacsService from '../../services/equipment.service';
import ReactTooltip from 'react-tooltip';
import AuthService from '../../services/auth.service';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import "ag-grid-enterprise";
import "../../css/equipmentManage.css"
import Select from 'react-select'
import { saveAs } from 'file-saver';
import GroupEquipmentService from '../../services/groupEquipment.service';
import Equipment from '../../images/equipment.png'



const initialValue = {
          id:'',equipment: '',nickname: '',settingType: '',settingTemplate: '',settingIp: '',settingCatagory: '',settingOs: '',
          settingPerson: '',settingProxy: '',settingActive: '', hwCpu:'',hwDisk:'',hwNic:'',hwSensor:'',}
const HardwareNumber = 
[{label:'5', value:'5'},{label:'10', value:'10'},{label:'15', value:'15'},{label:'20', value:'20'},{label:'30', value:'30'},{label:'60', value:'60'}
,{label:'120', value:'120'},{label:'150', value:'150'},{label:'180', value:'180'},{label:'240', value:'240'},{label:'300', value:'300'},{label:'600', value:'600'} ];

const CustomIcon = () => {
  return <img style={{width:15,padding:1}} src={Equipment} alt="Custom Icon" />
}

export default class EquipmentManage extends Component {
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
      isAuthorized: null,
      /* Search Filter */
      typeArray:[],
      typeData:['SNMP','ICMP'],
      typecheckList:[],
      catagoryArray:[],
      catagoryData:['Server','Network','L2 Switch','L3 Switch','L4 Switch','L7 Switch','Firewall','Security','Air Conditioner','UPS'],
      CatagoryCheckList:[],
      filterData: [],
      /* ag-grid */
      autoGroupColumnDef:  {
        leafGroup:true,
        headerName: '?????? ???/??????',
        minWidth: 150,
        sortable: true,
        pivotMode:true,
        // hide: true,
        // rowGroup: true,
        valueGetter: (params) => {
          if(params.data.equipment!== null  && params.data.isLeaf === undefined && params.data.settingCatagory !== undefined) {
            return params.data.nickname;
          }
           else return params.data.title;
       },
        cellRendererParams: {
          suppressCount: true,
          innerRenderer: this.groupCountRenderer,
          checkbox:true,
          pivot: true,
       },
      },
      groups:[],
      columnDefs: [
        { headerName: '?????????', cellRendererFramework: this.equipmentTitle, onCellClicked: this.onUpdateClick, hide: true },   // rowGroup:true, width:200
        { headerName: '??????', field: 'nickname',onCellClicked: this.onUpdateClick  },  
        { headerName: 'Public Ip', field: 'settingIp',onCellClicked: this.onUpdateClick  },
        { headerName: 'OS', field: 'settingOs', onCellClicked: this.onUpdateClick },
        { headerName: '?????????', field: 'settingPerson', onCellClicked: this.onUpdateClick } ,
        { headerName: '????????? ??????', field: 'settingTemplate', onCellClicked: this.onUpdateClick },
        { headerName: 'HW ?????? ????????????' ,   maxWidth: 130, cellRendererFramework: this.cellTooltipBtn, },
        { headerName: '??????',  field:'settingActive', valueFormatter: this.activeFormatterGroup ,onCellClicked: this.onUpdateClick, cellStyle: this.ActiveColor, },
        { headerName: '?????????', field: 'settingProxy',onCellClicked: this.onUpdateClick },
        { headerName: '?????????', field: '',onCellClicked: this.onUpdateClick },
      ],
      columnDefsSecond: [
        { headerName: '?????????',  field: 'equipment', onCellClicked: this.onUpdateClick, headerCheckboxSelection: true, checkboxSelection:true }, 
        { headerName: '??????', field: 'nickname',onCellClicked: this.onUpdateClick  },  
        { headerName: 'Public Ip', field: 'settingIp',onCellClicked: this.onUpdateClick },
        { headerName: 'OS', field: 'settingOs', onCellClicked: this.onUpdateClick },
        { headerName: '?????????', field: 'settingPerson', onCellClicked: this.onUpdateClick} ,
        { headerName: '????????? ??????', field: 'settingTemplate', onCellClicked: this.onUpdateClick },
        { headerName: 'HW ?????? ????????????' ,   maxWidth: 130, cellRendererFramework: this.cellTooltipBtn, },
        { headerName: '??????',  field:'settingActive', valueFormatter: this.activeFormatter ,onCellClicked: this.onUpdateClick, cellStyle: this.ActiveColor, },
        { headerName: '?????????', field: 'settingProxy',onCellClicked: this.onUpdateClick },
        { headerName: '?????????', field: '',onCellClicked: this.onUpdateClick }
      ],
      defaultColDef:   {   // ??? ??????
          sortable:true,  // ??? ????????? ?????? ??????
          filter:'agTextColumnFilter',  // ??? ?????? 
          resizable:true,  // ????????? ?????? (width, max, min)
          floatingFilter: true,
          flex:1,
          maxWidth:210,
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
      selectTypeList: '??????',
     
    };       
  }

  innerCellRenderer = params => {
    console.log(params);
    return (
      params.data.title
    )
  }

  eventChange = () => {
    GroupEquipmentService.getGroupEquipment()
          .then((res) => {
          console.log(res.data);
          this.setState({groups: res.data })
          })

    AiwacsService.getEquipment().then((res) => {
      this.setState({filterData:res.data})
    });
  }

  componentDidUpdate(prevProps,prevState) {
    ReactTooltip.rebuild();
    
  }
  
  equipmentTitle = (params) => {
    if(params.data.equipment!== null  && params.data.isLeaf === undefined && params.data.settingCatagory !== undefined) {
      return params.data.equipment;
    } else if(params.data.isLeaf === undefined) {
      return params.data.title;
    } 
      else return ""
      
    
  }

  groupCountRenderer = (params) => {
    if (params.data.isLeaf === false ) {
      var label = params.value ? params.value : '-';
      var length = params.data.children;
      const ipLeagth = [];
      length.map((e) => {
        if(e.settingIp !== undefined) {
          ipLeagth.push(e.settingIp)
        } else {
          e.children.map((c) => {
            if(c.settingIp !== undefined) {
              ipLeagth.push(e.settingIp)
            }
            })
        }
      })
      // '<span class="spanCheckbox"><input class="inputCheckbox" type="checkbox"/></span>'+ 
      return label + ' (' + ipLeagth.length  + ')'
  } else if(params.data.equipment!== null  && params.data.isLeaf === undefined && params.data.settingCatagory !== undefined) {
    return params.data.nickname;
  } else if(params.data.isLeaf === undefined) {
    return params.data.nickname;
  } else return ""
  }
   /* ?????? ??? ?????? */
  cellTooltipBtn = (params) => {
      if(params.data.settingType === 'ICMP') { return 'N/A' } 
      else if(params.data.isLeaf === undefined) {
        return ( <button className="hwTooltipBtn" onMouseOver={()=> ReactTooltip.rebuild()} onClick={()=>this.hwDataAll(params)}  data-tip data-for='hw' >??????</button> )
      } else return " "
  }
   /* ??????/????????? ????????? */
  ActiveColor = (params) => {
    if(params.data.settingActive === true) { return { color:'#7AC244'}}
    else { return {color:'#E00001'}}
  }
  /* ???????????? ?????? ????????? */
  hwDataAll = (params) => {
    const {hwCpu,testCheck,hwNic,hwDisk,hwSensor,equipment} = this.state;
    console.log(params);
    const hwid = [];
    if(params.data.id === undefined) {
      hwid.push(params.data.key);
    } else {
      hwid.push(params.data.id);
    }
    console.log("equipId:"+hwid);
    AiwacsService.getTooltipByNo(hwid,window.location.pathname) 
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
 /* ?????? ??? ?????? */
  modelOpenButton = () => {this.setState({ modelOpen: false });};
  modelOpenButtonTrue = () => { this.setState({ modelOpen: true }); };
  modifyOpenButton = () => { this.setState({modifyOpen: false})}
  modifyOpenButtonTrue = () => { this.setState({modifyOpen: true})}
  uploadOpenButton = () => { this.setState({uploadModal: false})}
  uploadOpenButtonTrue = () => { this.setState({uploadModal: true})}


 
  componentDidMount() {
    const {typeData,catagoryData, selectTypeList} = this.state;
    const equipType=typeData.join(',');
    const equipCatagory=catagoryData.join(',');
    console.log(equipType,equipCatagory);
    console.log(selectTypeList);
    const typeDatas = [{id: 1,value:'SNMP'},{id: 2,value:'ICMP'}];
    const catagoryDatas = [{id: 1,value:'Server'},{id: 2,value:'Network'},{id: 3,value:'L2 Switch'},{id: 4,value:'L3 Switch'},{id: 5,value:'L4 Switch'}
                      ,{id: 6,value:'L7 Switch'},{id: 7,value:'Firewall'},{id: 8,value:'Security'},{id: 9,value:'Air Conditioner'},{id: 10,value:'UPS'}];
    const isAuthorized = AuthService.getCurrentUser();
    this.setState({
      typeArray:typeDatas,
      typecheckList:new Array(typeDatas.length).fill(true),
      catagoryArray:catagoryDatas,
      CatagoryCheckList:new Array(catagoryDatas.length).fill(true),
      isAuthorized: isAuthorized
    })

    /* ????????? ?????? */
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
   
    GroupEquipmentService.searchFilterGroup(equipType,equipCatagory)
          .then((res) => {
          const resDatas=res.data;
          this.setState({groups: resDatas })
          })   
  }

 
/* ??????/????????? ?????????  */
  activeFormatterGroup = (params) => {
    if(params.data.isLeaf === undefined) {
      return params.data.settingActive ? '??????':'?????????'
    }
  }
  activeFormatter = (params) => { return params.value ? '??????':'?????????' } 
/* params  */
  onGridReady = (params) => {this.setState({GridApi:params})}
/* ??????  */
  onUpdateClick = (params) => {
    if(params.data.isLeaf === undefined) {
      console.log( params.data);
      this.setState({formData:params.data})
      this.setState({modifyOpen: true})
    }
    
  };
/* ??????  */
  onRemoveClick = () => {
    const { equipCheck } = this.state;
    const activeNodes = this.gridApi.getSelectedRows();
    const parentIds = [];
    const equipIds = [];
      activeNodes.map(c => {
      if(c.isLeaf === undefined && equipCheck === true) {
        if(c.id === undefined) {
          equipIds.push(c.key)
        } else {
          equipIds.push(c.id)
        }
      } else if (c.isLeaf === undefined && equipCheck === false ){
        equipIds.push(c.id)
      } else {
        parentIds.push(c.key);
      }
    });
    const equipId = equipIds.join('|');
    console.log("Remove : " + equipId); 
    console.log(JSON.stringify(equipId));
    
    if(Object.keys(equipId).length > 0 && equipCheck === false) {
      GroupEquipmentService.deleteGroupEquipByNo(equipId,window.location.pathname)
      AiwacsService.deleteEquipment(equipId,window.location.pathname)
        .then((res) => {
            console.log("?????? ?????? ?????????")
            alert("?????? ???????????????.")
            this.eventChange();
          })
    }
    else if(Object.keys(equipId).length > 0 && equipCheck === true ) {
      GroupEquipmentService.deleteGroupEquipByNo(equipId,window.location.pathname)
      AiwacsService.deleteEquipment(equipId,window.location.pathname)
        .then((res) => {
            console.log("?????? ?????? ?????????")
            alert("?????? ???????????????.")
            this.eventChange();
          }) 
    }
    else if(parentIds !== null ) {
      alert("????????? ??????????????????.")
    } else { alert("????????? ???????????? ????????????.")} 
  };
/* ??????  */
  onActiveButton = () => {
    const { equipCheck } = this.state;
    const activeNodes = this.gridApi.getSelectedRows();
    console.log(activeNodes);
    const parentIds = [];
    const equipIds = [];
      activeNodes.map(c => {
        console.log(c.isLeaf);
        console.log(equipCheck);
        console.log(c.settingIp);
      if(c.isLeaf === undefined && equipCheck === true) {
        if(c.id === undefined) {
          equipIds.push(c.key)
        } else {
          equipIds.push(c.id)
        }
      } else if (c.isLeaf === undefined && equipCheck === false ){
        equipIds.push(c.id)
      } else {
        console.log("bb");
        parentIds.push(c.key);
      }
    });
    const equipId = equipIds.join('|');
    console.log("onActive : " + equipId); 
    console.log(JSON.stringify(equipId));
    
    if(Object.keys(equipId).length > 0 && equipCheck === false) {
      AiwacsService.onActiveEquipment(equipId,window.location.pathname)
        .then((res) => {
          console.log("?????? ?????? ?????????");
          alert("?????????????????????.")
          this.eventChange();
      }) 
    }
    else if(Object.keys(equipId).length > 0 && equipCheck === true ) {
      AiwacsService.onActiveEquipment(equipId,window.location.pathname)
      .then((res) => {
        console.log("?????? ?????? ?????????");
        alert("?????????????????????.")
        this.eventChange();
        // window.location.reload();
    }) 
    }
    else if(parentIds !== null ) {
      alert("????????? ??????????????????.")
    } else {alert("????????? ???????????? ????????????.") }  
    
   }
/* ?????????  */
  offActiveButton = () => {
    const { equipCheck } = this.state;
    const activeNodes = this.gridApi.getSelectedRows();
    const parentIds = [];
    const equipIds = [];
      activeNodes.map(c => {
      if(c.isLeaf === undefined && equipCheck === true) {
        if(c.id === undefined) {
          equipIds.push(c.key)
        } else {
          equipIds.push(c.id)
        }
      } else if (c.isLeaf === undefined && equipCheck === false ){
        equipIds.push(c.id)
      } else {
        parentIds.push(c.key);
      }
    });
    const equipId = equipIds.join('|');
    console.log("onActive : " + equipId); 
    console.log(JSON.stringify(equipId));
    
    if(Object.keys(equipId).length > 0 && equipCheck === false) {
      AiwacsService.offActiveEquipment(equipId,window.location.pathname)
        .then((res) => {
          console.log("?????? ????????? ?????????");
          alert("????????????????????????.")
          this.eventChange();
      }) 
    }
    else if(Object.keys(equipId).length > 0 && equipCheck === true ) {
      AiwacsService.offActiveEquipment(equipId,window.location.pathname)
      .then((res) => {
        console.log("?????? ????????? ?????????");
        alert("????????????????????????.")
        this.eventChange();
        // window.location.reload();
    }) 
    }
    else if(parentIds !== null ) {
      alert("????????? ??????????????????.")
    } else {alert("????????? ???????????? ????????????.") }  
  }
/* ?????? ?????? */
  TypeFilter = (item) => {
   const {typecheckList,typeData} = this.state;
   var newArray = [...typeData, item.value]

   const changeCheck = typecheckList.map((check,idx) => {  // ?????? ??????-?????????
    if(idx === item.id - 1) check = !check;
    console.log("check:"+ check);
    return check;
  });
   this.setState({typecheckList:changeCheck})

   if(typeData.includes(item.value)) {   // ?????? ????????? ??????
     newArray = newArray.filter(o => o !== item.value);
   }
   this.setState({typeData:newArray})

   console.log("typecheckList : " +typecheckList);
   console.log("changeCheck : "+ changeCheck); 
 }
  /* ?????? ?????? ?????? */
 TypeFilterAll = (e) => {
   console.log("checked+++++++:" + JSON.stringify(e.target.checked)); 
   const {typecheckList,typeData,typeArray} = this.state;
   const newArray=['SNMP','ICMP'];

   const tmpArr=typecheckList.map((item) => {     // checked bool?????? ?????? ??????????????? ?????? true ????????? false??? ???.
     item = e.target.checked ? true:false;
     return item;
   })
   console.log("newArray : "+ JSON.stringify(newArray));
   this.setState({typeData: e.target.checked ? newArray: []})   // true ?????? ????????? ????????? - false?????? ??? ??????

   console.log("tmpArr:" + tmpArr);
   this.setState({
     typecheckList:tmpArr,
   })
 }
 /* ?????? ?????? */
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
/* ?????? ?????? ?????? */
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
/* ???????????? ?????? */
filterSelect = () => {
    const {typeData,catagoryData, selectTypeList} = this.state;
    const equipType=typeData.join(',');
    const equipCatagory=catagoryData.join(',');
    console.log(equipType,equipCatagory);
    console.log(selectTypeList);

    if(selectTypeList === '??????' && equipType !== '' && equipCatagory !== '') {
      // this.gridApi.setRowData(false);
      AiwacsService.searchFilterEquipment(equipType,equipCatagory,window.location.pathname)
      .then((res) => {
        this.setState({filterData:res.data,equipCheck:false, })
      })
    } else if(selectTypeList === '??????' && equipType !== '' && equipCatagory !== '' ) {
      GroupEquipmentService.searchFilterGroup(equipType,equipCatagory)
      .then((res) => {
        console.log(res.data)
        this.setState({groups:res.data, equipCheck:true,})
      })
      
      
    }
    else if(equipType === '') { 
      alert("?????? ????????? 1??? ?????? ????????? ?????????.")
    } else {
      alert("?????? ????????? 1??? ?????? ????????? ?????????. ")
    } 
  }

cpuHwChange = (value) => {this.setState({hwCpu:value})}
diskHwChange = (value) => {this.setState({hwDisk:value})}
nicHwChange = (value) => {this.setState({hwNic:value})}
sensorHwChange = (value) => {this.setState({hwSensor:value})}
allHwChange = (value) => { this.setState({ hwNumber:value})}
allCheckHwChange = (value) => {
  this.setState({
    hwNumber:value,
    hwCpu:value,
    hwDisk:value,
    hwNic:value,
    hwSensor:value
  })
}
/* ?????? ?????????*/
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

/* ?????? POST*/
cpuOnClick = () => {
  // cosnt {equipment} = this.state;
  const {hwCpu,hwid,hwnull,equipment} = this.state;
  AiwacsService.eachTooltipHwUpdateEquipment(hwCpu.value,hwnull,hwnull,hwnull,hwid,window.location.pathname)
  .then((res)=> {
     alert("?????????????????????.")
    })
}

diskOnClick = () => {
  const {hwDisk,hwid,hwnull} = this.state;
  AiwacsService.eachTooltipHwUpdateEquipment(hwnull,hwDisk.value,hwnull,hwnull,hwid,window.location.pathname)  
  .then(()=> {
     alert("?????????????????????.")
    })
}
nicOnClick = () => {
  const {hwNic,hwid,hwnull} = this.state;
  AiwacsService.eachTooltipHwUpdateEquipment(hwnull,hwnull,hwNic.value,hwnull,hwid,window.location.pathname) 
  .then(()=> {
     alert("?????????????????????.")
    })
}
sensorOnClick = () => {
  const {hwSensor,hwid,hwnull} = this.state;
  AiwacsService.eachTooltipHwUpdateEquipment(hwnull,hwnull,hwnull,hwSensor.value,hwid,window.location.pathname)  
  .then(()=> {
     alert("?????????????????????.")
    })
}
allHwOnClick = () => {
  const {hwid,hwNumber} = this.state;
  AiwacsService.allTooltipHwUpdateEquipment(hwNumber.value,hwNumber.value,hwNumber.value,hwNumber.value,hwid,window.location.pathname)
  .then(()=> {
     alert("?????????????????????.")
    })
}
/* ?????? Check POST */
allCheckHwOnClick = () => {
  const {hwCpu,hwDisk,hwNic,hwSensor,hwNumber} = this.state;
  console.log(hwCpu,hwDisk,hwNic,hwSensor,hwNumber);
  const checkNodes = this.gridApi.getSelectedNodes();
  const hwid = [];
  checkNodes.map(c => {
    console.log(c);
    if(c.data.id === undefined && c.data.isLeaf === undefined) {
      console.log("bb");
      hwid.push(c.data.key);
    } else if(c.data.id !== undefined && c.data.isLeaf === undefined) {
      console.log("aa");
      hwid.push(c.data.id);
    }
  });
  const equipId = hwid.join(',');
  console.log("equipId: "+ equipId);

  if(equipId !== '' && hwNumber.value !== '') {
    AiwacsService.allTooltipHwUpdateEquipment(hwCpu.value,hwDisk.value,hwNic.value,hwSensor.value,equipId,window.location.pathname)
    .then(()=> {

       alert("?????????????????????.")
      })
  } else if(hwNumber.value === '') {
    alert("????????? ??????????????????.")
  } else {
    alert("????????? ???????????? ????????????.")
  }
}
cpuCheckOnClick = () => {
  const {hwCpu,hwnull} = this.state;
  const checkNodes = this.gridApi.getSelectedNodes();
  const hwid = [];
  checkNodes.map(c => {
    if(c.data.id === undefined) {
      hwid.push(c.data.key);
    } else {
      hwid.push(c.data.id);
    }
  });
  const equipId = hwid.join(',');
  console.log("equipId: "+ equipId);

  if(equipId !== '' && hwCpu.value !== '') {
  AiwacsService.eachTooltipHwUpdateEquipment(hwCpu.value,hwnull,hwnull,hwnull,equipId,window.location.pathname)
  .then(()=> {
     alert("?????????????????????.")
    })
  } else if(hwCpu.value === '') {
    alert("????????? ??????????????????.")
  } else {
    alert("????????? ???????????? ????????????.")
  } 
}
diskCheckOnClick = () => {
  const {hwDisk,hwnull} = this.state;
  const checkNodes = this.gridApi.getSelectedNodes();
  const hwid = [];
  checkNodes.map(c => {
    if(c.data.id === undefined) {
      hwid.push(c.data.key);
    } else {
      hwid.push(c.data.id);
    }
  });
  const equipId = hwid.join(',');
  
  if(equipId !== '' && hwDisk.value !== '') {
  AiwacsService.eachTooltipHwUpdateEquipment(hwnull,hwDisk.value,hwnull,hwnull,equipId,window.location.pathname)
  .then(()=> {
     alert("?????????????????????.")
    })
  } else if(hwDisk.value === '') {
    alert("????????? ??????????????????.")
  } else {
    alert("????????? ???????????? ????????????.")
  } 
}
nicCheckOnClick = () => {
  const {hwNic,hwnull} = this.state;
  const checkNodes = this.gridApi.getSelectedNodes();
  const hwid = [];
  checkNodes.map(c => {
    if(c.data.id === undefined) {
      hwid.push(c.data.key);
    } else {
      hwid.push(c.data.id);
    }
  });
  const equipId = hwid.join(',');
  
  if(equipId !== '' && hwNic.value !== '') {
  AiwacsService.eachTooltipHwUpdateEquipment(hwnull,hwnull,hwNic.value,hwnull,equipId,window.location.pathname)
  .then(()=> {
     alert("?????????????????????.")
    })
  } else if(hwNic.value === '') {
    alert("????????? ??????????????????.")
  } else {
    alert("????????? ???????????? ????????????.")
  } 
}
sensorCheckOnClick = () => {
  const {hwSensor,hwnull} = this.state;
  const checkNodes = this.gridApi.getSelectedNodes();
  const hwid = [];
  checkNodes.map(c => {
    if(c.data.id === undefined) {
      hwid.push(c.data.key);
    } else {
      hwid.push(c.data.id);
    }
  });
  const equipId = hwid.join(',');
  
  if(equipId !== '' && hwSensor.value !== '') {
  AiwacsService.eachTooltipHwUpdateEquipment(hwnull,hwnull,hwnull,hwSensor.value,equipId,window.location.pathname)
  .then(()=> {
     alert("?????????????????????.")
    })
  } else if(hwSensor.value === '') {
    alert("????????? ??????????????????.")
  } else {
    alert("????????? ???????????? ????????????.")
  } 
}
tooltipValidation = () => {
  const checkNodes = this.gridApi.getSelectedNodes();
  console.log(checkNodes);
  const hwid = [];
  checkNodes.map(c => {
    if(c.data.id === undefined) {
      hwid.push(c.data.key);
    } else {
      hwid.push(c.data.id);
    }
  });
  const equipId = hwid.join(',');
  console.log(equipId);
  if(equipId === '') { 
    alert("????????? ???????????? ????????????.")
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
/* excel ???????????? */
downloadExcel = () => {
  AiwacsService.downloadExcel(window.location.pathname)
  .then((res) => {
    console.log(res);
    const mimeType = { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };
    const blob =new Blob([res.data],mimeType);
    saveAs(blob,"Devices.xls")
    console.log(res.data);
  })
}

recursion = (data, parent, childHierachy) => {
  var newData =[];
  if(data) {
    data.forEach((d,i) => {
      
    var parentHierachy = [];     
    d.hierarchy =parentHierachy;
    
    if(parent) {
      d.parent= parent;
      parentHierachy = [...childHierachy];
      d.hierarchy = parentHierachy;
    }
    parentHierachy.push(i);
    newData.push(d);

  // ????????????
  if(d.children) {
    newData = [
      ...newData,
      ...this.recursion(
        d.children,
        d,
        parentHierachy
      )
    ]
  }
 })
}
  return newData;
}


test = (data,parent) => {
  var newData = [];
  data.forEach((d,i) => {

    if(parent) {
        d.parent=parent;
      }
      newData.push(d);
      
      if(d.children) {
        newData = [
          ...newData,
          ...this.test(
            d.children,
            d,
          )
        ]
      }
    })
  return newData;
}

  render() {
    const { columnDefs ,defaultColDef,equipment,formData,typeArray,typecheckList,typeData,groups,testDb,columnDefsSecond
    ,catagoryArray,CatagoryCheckList,catagoryData,filterData,equipCheck,gridComponents,hwCpu,hwDisk,hwSensor,hwNic,hwid,hwNumber, selectTypeList} = this.state;

    // console.log(equipCheck);
    // console.log(filterData);

    return (
    <>
    <div className="ContainerAdmin">
      <div className="FilterContainer">
       <div className="topFilterArea"> 
          <div className="topFilterBox">
            <div className="selectFilterSpace">
                <div className="selectBox">
                    <p className="selectFont">??????</p>
                </div>
                <div className="selectCheckBox">
                  <div className="filterInput">
                     <input type="radio" value="??????" checked={selectTypeList==='??????'} onChange={(e)=> this.setState({selectTypeList : e.target.value})} /><span className="filterSpan">?????? </span>
                     <input type="radio" value="??????" checked={selectTypeList==='??????'} onChange={(e)=> this.setState({selectTypeList : e.target.value})} /><span className="filterSpan">??????</span>
                  </div>
                </div>
            </div>

            <div className="selectFilterSpace">
                <div className="selectBox">
                    <p className="selectFont">?????? ??????</p>
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
                      <p className="selectFont">?????? ??????</p>
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
          </div>
          <div className="topFilterBottomArea">
                    <Button className="topFilterBottomBtn" onClick={this.filterSelect} >????????????</Button>
          </div>
       </div> 

       <div className="middleFilterArea">
    
        
       </div>

       <div className="bottomFilterArea">
         <div className="bottomHighArea">  
            <div className="leftTextBox">
                <p className="textFont">?????? ?????? ??? : 19???  (??? ????????? ????????? ????????? ???????????? ??????, ???????????? ???????????? ???????????????.)</p>
                
            </div>
            <div className="rightSaveBox">
              <div className="rightSnmpArea">
                <div className="rightFloatArea">
                    {/* <label className="rightSnmpLabel">SNMP TimeOut</label>
                  <Button className="rightSnmpBtn">??????</Button>           
                  <label className="rightSnmpLabel">PING ??????</label>
                  <Button className="rightSnmpBtn">??????</Button>   */}
                  <label className="rightSnmpLabel">???????????? ?????? ?????? ??????</label>
                  <Button onClick={()=>this.tooltipValidation()} data-tip data-for="checkHw" className="rightSnmpBtn">??????</Button>  
                  {/* <label className="rightSnmpLabel">??????????????? ?????? ?????? ??????</label>
                  <Button className="rightSnmpBtn">??????</Button>   */}

                  <Button className="SaveBtn" onClick={this.modelOpenButtonTrue}>??????</Button>
                  <Button className="SaveBtnRemove" onClick={this.onRemoveClick}>??????</Button>
                </div>
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
                {
                  equipCheck ?  
                  <AgGridReact
                  headerHeight='30'
                  floatingFiltersHeight='23'
                  rowHeight='25'
                  // rowData={this.recursion(groups)}
                  rowData={this.recursion(groups)}
                  rowSelection='multiple'
                  onGridReady={params => {this.gridApi = params.api;}} 
                  groupSelectsChildren={true} // ?????????????????? ?????? ( ?????? ?????? )
                  enableRangeSelection={true} 
                  defaultColDef={defaultColDef}
                  columnDefs={columnDefs}  
                  autoGroupColumnDef={this.state.autoGroupColumnDef }  
                  treeData={true}
                  getDataPath= {data => {
                    return data.hierarchy;
                  }}
                  />
                 : null  }

                {
                  equipCheck === false ? 
                <AgGridReact
                  headerHeight='30'
                  floatingFiltersHeight='23'
                  rowHeight='25'
                  rowData={filterData}
                  rowSelection="multiple"
                  onGridReady={params => {this.gridApi = params.api;}} 
                  groupSelectsChildren={true}   // ?????? ?????? ?????? ??????
                  enableRangeSelection={true}  
                  defaultColDef={defaultColDef}
                  columnDefs={columnDefsSecond}   
                /> 
                : null }
                {
                 this.state.modifyOpen  ? <Modify show={this.state.modifyOpen}  onHide={this.modifyOpenButton} data={formData}  /> : null
                }         
            </div>
            </div>
          </div>

          <div className="underArea">
            <div className="underLeftArea">
                    <Button className="underBtn" onClick={()=> {this.props.history.push("/equipmentGroupManage")}}>?????? ?????? ??????</Button>
                    {/* <Button className="underBtn">????????? ??????</Button>
                    <Button className="underBtn">Agent ??????</Button> */}
                    <Button className="underBtn whiteBtn" onClick={this.uploadOpenButtonTrue} >?????? ?????? ??????</Button>
                    {
                      this.state.uploadModal ? <Upload show={this.state.uploadModal}  onHide={this.uploadOpenButton} /> : null
                    }
                    <Button className="underBtn whiteBtn" onClick={this.downloadExcel} >????????????</Button>
            </div>
            <div className="underRightArea"> 
                <div className="underRightBox">
                    <Button className="underBtn" onClick={this.onActiveButton} >?????? ??????</Button>
                    <Button className="underBtn grayBtn" onClick={this.offActiveButton} >?????? ?????????</Button>
                    {/* <Button className="underBtn">PING ??????</Button>
                    <Button className="underBtn grayBtn">PING ?????????</Button>  */}
               </div>
            </div>
          </div>
       </div>
       
       {/* ?????? One */}
       <ReactTooltip  event="click"  getContent={()=> equipment} 
       ref= {el => this.tooltipTwo = el} className="extraClass" place="right" type="dark" effect="float" clickable={true}  isCapture={true}   id="hw">
           <div className="tooltipArea">
              <div className="tooltipHigh">
                  <button className="hideHwTooltip" onClick={()=>{this.tooltipTwo.tooltipRef = null; ReactTooltip.hide(); }}>
                    <span style={{color:'#267dff',fontWeight:'bold'}}>
                      X
                    </span>
                  </button>
              </div>
              <div className="headerArea">
              <div className="headerLeft">
              <label className="headerLeftFont">?????? ??????</label>
              <label className="headerLeftFontTwo">????????? ??????</label>
            </div>
            <div className="headerRight">
              <button className="headerRightFont" onClick={()=> this.defaultTooltipAggrid()}>?????? ???(?????? 60)</button>

           
              <div className="headerRightAddBtn">
                <Select className="headerRightSelect" options={HardwareNumber} value={hwNumber} onChange={value=> this.allHwChange(value)}  />
                <button className="headerRightBtn" onClick={this.allHwOnClick} >??????</button>
              </div>
            </div>
          </div>
      
          <div className="middleArea">
              <label className="middleRightFont">?????? ??????</label>
              <label className="middleRightAddFont">?????? ???</label>
          </div>
          <div className="bottomArea">
              <label style={{marginRight: '10px' ,marginTop:'7px'}}>CPU/MEM</label>
              <Select className="middleRightSelectTwo" options={HardwareNumber}  value={hwCpu} onChange={value=> this.cpuHwChange(value)} />
              <button className="headerRightBtn" onClick={this.cpuOnClick} >??????</button>
          </div>
          <div className="bottomAreaDisk">
              <label style={{marginRight: '43px',marginTop:'7px'}}>DISK</label>
              <Select className="middleRightSelectTwo" options={HardwareNumber}  value={hwDisk} onChange={value=> this.diskHwChange(value)} />
              <button className="headerRightBtn" onClick={this.diskOnClick}>??????</button>
          </div>
          <div className="bottomAreaDisk">
              <label style={{marginRight: '48px',marginTop:'7px'}}>NIC</label>
              <Select className="middleRightSelectTwo" options={HardwareNumber} value={hwNic} onChange={value=> this.nicHwChange(value)} />
              <button className="headerRightBtn" onClick={this.nicOnClick}>??????</button>
          </div>
          <div className="bottomAreaDisk">
              <label style={{marginRight: '30px',marginTop:'7px'}}>Sensor</label>
              <Select className="middleRightSelectTwo" options={HardwareNumber}  value={hwSensor} onChange={value=> this.sensorHwChange(value)} />
              <button className="headerRightBtn" onClick={this.sensorOnClick}>??????</button>
          </div> 
        
       </div>  
           </ReactTooltip> 


       {/* ?????? Two */}
       <ReactTooltip ref= {el => this.tooltip = el}  className="extraClass" place="right" type="dark" effect="float" clickable={true}  isCapture={true} event="click"  id="checkHw">
           <div className="tooltipAreaTwo">
              <div className="tooltipHigh">
                  <button className="hideHwTooltipTwo" onClick={()=>{this.tooltip.tooltipRef = null; ReactTooltip.hide()}}>
                    <span style={{color:'#267dff',fontWeight:'bold'}}>
                    X
                    </span>
                  </button>
              </div>
            <div className="headerAreaTwo">
              <div className="headerLeftTwo">
                <label className="headerLeftFontTwoReal">?????? ??????</label>
                <button className="headerRightFontTwo" onClick={()=> this.defaultAgentTooltip()}><span>( Agent ??????</span></button>
                  <label className="headerLeftFontTwo">????????? ??????</label>
              </div>

              <div className="headerRightTwo">
                <button className="headerRightFontTwoReal" onClick={()=> this.defaultSnmpTooltip()}><span>?????? ??? SNMP ?????? )</span></button>

            
                <div className="headerRightAddBtn">
                  <Select className="headerRightSelect" options={HardwareNumber} value={hwNumber} onChange={value=> this.allCheckHwChange(value)}  />
                  <button className="headerRightBtn" onClick={this.allCheckHwOnClick} >??????</button>
                </div>
            </div>
          </div>
      
           <div className="middleAreaTwo">
              <label className="middleRightFont">?????? ??????</label>
              <label className="middleRightAddFont">?????? ???</label>
          </div>
          <div className="bottomAreaTwo">
              <label style={{marginRight: '36px' ,marginTop:'7px'}}>CPU/MEM</label>
              <Select className="middleRightSelectTwo" options={HardwareNumber}  value={hwCpu} onChange={value=> this.cpuHwChange(value)} />
              <button className="headerRightBtn" onClick={this.cpuCheckOnClick} >??????</button>
          </div>
          <div className="bottomAreaDiskTwo">
              <label style={{marginRight: '69px',marginTop:'7px'}}>DISK</label>
              <Select className="middleRightSelectTwo" options={HardwareNumber}  value={hwDisk} onChange={value=> this.diskHwChange(value)} />
              <button className="headerRightBtn" onClick={this.diskCheckOnClick}>??????</button>
          </div>
          <div className="bottomAreaDiskTwo">
              <label style={{marginRight: '74px',marginTop:'7px'}}>NIC</label>
              <Select className="middleRightSelectTwo" options={HardwareNumber} value={hwNic} onChange={value=> this.nicHwChange(value)} />
              <button className="headerRightBtn" onClick={this.nicCheckOnClick}>??????</button>
          </div>
          <div className="bottomAreaDiskTwo">
              <label style={{marginRight: '56px',marginTop:'7px'}}>Sensor</label>
              <Select className="middleRightSelectTwo" options={HardwareNumber}  value={hwSensor} onChange={value=> this.sensorHwChange(value)} />
              <button className="headerRightBtn" onClick={this.sensorCheckOnClick}>??????</button>
          </div>  
        
           </div>  
           </ReactTooltip> 
       
     </div>

    </div>
    </>
    );
  }
}