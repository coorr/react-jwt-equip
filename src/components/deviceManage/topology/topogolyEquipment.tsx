import React, { Component} from 'react';
import * as go from 'gojs';
import { DiagramWrapper } from './diagramWrapper';
import EquipmentLogo from '../../../images/equipment.png';
import styles from '../../../css/diagramEquipment.module.css';
import AiwacsService from '../../../services/equipment.service'
import DiagramViewService from '../../../services/diagramView.service';

import {Button, Modal, Form } from "react-bootstrap";
import {  AgGridReact } from 'ag-grid-react';

import "ag-grid-enterprise";
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';


const modalOptions = {
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
}

interface AppState {
  nodeDataArray: Array<go.ObjectData>;
  linkDataArray: Array<go.ObjectData>;
  modelData: go.ObjectData;
  selectedKey: number | null;
  skipsDiagramUpdate: boolean;
  isDeviceModal: boolean;
  isDeviceData: Array<object>;
}

export class TopogolyEquipment extends Component<{}, AppState> {
  deviceGridApi: any;
  constructor(props: object) {
    super(props);
    this.state = {
      nodeDataArray: [],
      linkDataArray: [
        { id: -1, from: 1, to: 2 , borderColor:1},
        { id: -2, from: 1, to: 3 , borderColor:1},
        { id: -3, from: 2, to: 2 , borderColor:1},
        { id: -4, from: 3, to: 4 , borderColor:1},
        { id: -5, from: 4, to: 1 , borderColor:5}
      ],
      modelData: {
        canRelink: true
      },
      selectedKey: null,
      skipsDiagramUpdate: false,
      isDeviceModal:false,
      isDeviceData : [], 

    };
    
  }

  public componentDidMount(): void {
      
    DiagramViewService.getTopologyNode()
      .then(res => {
        console.log(res.data);
        this.setState({nodeDataArray:res.data})
      })
  }

  public handleDiagramEvent = (e: go.DiagramEvent)  => {
    console.log(e);
    const name = e.name;
    switch (name) {
      case 'ChangedSelection': {
        const sel = e.subject.first();
        if (sel) {
          this.setState({ selectedKey: sel.key });
        } else {
          this.setState({ selectedKey: null });
        }
        break;
      }
      default: break;
    }
  }

  public handleModelChange = (obj: go.IncrementalData)  => {
    const insertedNodeKeys = obj.insertedNodeKeys;  // 삽입된 노드키
    const modifiedNodeData = obj.modifiedNodeData;  // 수정된 노드키
    const removedNodeKeys = obj.removedNodeKeys;      // 삭제된 노드키
    const insertedLinkKeys = obj.insertedLinkKeys;   // 삽입된 링크키
    const modifiedLinkData = obj.modifiedLinkData;    // 수정된 링크키
    const removedLinkKeys = obj.removedLinkKeys;      // 삭제된 링크키
    const modifiedModelData = obj.modelData;      // 모델 데이터

    console.log(obj)
    
  }

  public handleRelinkChange = (e: any) => {
    console.log(e);
    
    const target = e.target;
    const value = target.checked;
    this.setState({ modelData: { canRelink: value }, skipsDiagramUpdate: false });
  }

  public addNodeBtn = () => {
    AiwacsService.getEquipmentSnmp() 
      .then(res => {
        this.setState({isDeviceData:res.data, isDeviceModal: true})
      })
    // this.setState({isDeviceModal:true})
    // const user = { id: 7, name: 'Alphasssssssss',  loc: '-700 30' ,  ip:'10.10.10.80'}
    // this.setState({ nodeDataArray: this.state.nodeDataArray.concat(user)})
  }

  public applyDeviceModal = () => {
    let selectedDeviceNode = this.deviceGridApi.getSelectedNodes();
    let selectedDeviceName:Array<object> = [];

    if(selectedDeviceNode.length === 0) {
      alert("장비를 선택해 주세요.");
      return;
    } else {
      selectedDeviceNode.forEach((v: any, i:any) => {
        i = i*80;
        let obj:any = {};
        let xAxis:any = -700+i;
        obj.id = v.data.id
        obj.name= v.data.equipment
        obj.ip=v.data.settingIp
        obj.loc=xAxis+' '+"30"
        selectedDeviceName.push(obj);
      });
      this.setState({ isDeviceModal:false, nodeDataArray: this.state.nodeDataArray.concat(selectedDeviceName)  });
    }
  }

  public saveBtn = () => {
    const { nodeDataArray } = this.state;
    // console.log(selectedDeviceName);
    
  }

  public render = () => {
    let selKey;
    if (this.state.selectedKey !== null) {
      selKey = <p>Selected key: {this.state.selectedKey}</p>;
    }
  const { nodeDataArray,selectedKey, isDeviceModal, isDeviceData } = this.state;
  console.log(nodeDataArray);
  console.log(selectedKey);
  console.log(isDeviceData);
  
  
  
    return (
      <div className={styles.topogoly_container}>
        <div className={styles.topogoly_topMenu}>
          <Button onClick={this.addNodeBtn}>장비 추가</Button>
          <Button onClick={this.saveBtn}>저장</Button>
          { isDeviceModal && 
             <>
             <Modal show={isDeviceModal} onHide={() => this.setState({ isDeviceModal: false })} dialogClassName="userModel" className="reportModelHw">
               <Modal.Header className="header-Area">
                 <Modal.Title id="contained-modal-title-vcenter" className="header_Text">장비</Modal.Title>
               </Modal.Header>
               <Modal.Body>
                 <div className="ag-theme-alpine" style={{ width: "43vw", height: "40vh" }}>
                   <AgGridReact
                     headerHeight={30}
                     floatingFiltersHeight={27}
                     rowHeight={30}
                     rowSelection="multiple"
                     rowData={isDeviceData}
                     columnDefs={modalOptions.deviceColumnDefs}
                     defaultColDef={modalOptions.deviceDefaultColDef}
                     onGridReady={params => {
                       this.deviceGridApi = params.api; }
                     } 
                   />
                 </div>
               </Modal.Body>

               <Form.Group className="reportDeviceFooter">
                 <Button onClick={() => this.applyDeviceModal()} className="reportActiveBtn">적용</Button>
                 <Button onClick={() => this.setState({ isDeviceModal: false })} className="reporthideBtn">닫기</Button>
               </Form.Group>
             </Modal>
           </>
          }
        </div>
        <DiagramWrapper
          nodeDataArray={this.state.nodeDataArray}
          linkDataArray={this.state.linkDataArray}
          modelData={this.state.modelData}
          skipsDiagramUpdate={this.state.skipsDiagramUpdate}
          onDiagramEvent={this.handleDiagramEvent}
          onModelChange={this.handleModelChange}
        />

      </div>
    );
  }
}