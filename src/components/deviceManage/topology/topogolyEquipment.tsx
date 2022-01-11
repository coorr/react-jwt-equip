import React, { Component} from 'react';
import * as go from 'gojs';
import { DiagramWrapper } from './diagramWrapper';
import { ReactDiagram } from 'gojs-react';
import EquipmentLogo from '../../../images/equipment.png';
import styles from '../../../css/diagramEquipment.module.css';
import AiwacsService from '../../../services/equipment.service'
import DiagramViewService from '../../../services/diagramView.service';

import {Button, Modal, Form } from "react-bootstrap";
import {  AgGridReact } from 'ag-grid-react';

import "ag-grid-enterprise";
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import diagramViewService from '../../../services/diagramView.service';


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
  selectedKey: Array<Number>;
  skipsDiagramUpdate: boolean;
  isDeviceModal: boolean;
  isDeviceData: Array<object>;
  nodeEvent: object;
}

export class TopogolyEquipment extends Component<{}, AppState> {
  private diagramRef: React.RefObject<ReactDiagram>;
  deviceGridApi: any;
  constructor(props: object) {
    super(props);
    this.state = {
      // nodeDataArray: [
      //   { id: 1, equipment: 'Alpha', settingIp: 'white', loc: '-1780 52' },
      //   { id: 2, equipment: 'Beta', settingIp: 'white', loc: '-1620 36' },
      //   { id: 3, equipment: 'Gamma', settingIp: 'white', loc: '-1943 270' },
      //   { id: 4, equipment: 'Delta', settingIp: 'white', loc: '-1792 303' }
      // ],
      nodeDataArray: [],
      linkDataArray: [
        { id: -1, froms: 1, tos: 2 , borderColor:1},
        { id: -2, froms: 1, tos: 3 , borderColor:1},
        { id: -3, froms: 2, tos: 2 , borderColor:1},
        { id: -4, froms: 3, tos: 4 , borderColor:1},
        { id: -5, froms: 4, tos: 1 , borderColor:5}
      ],
      modelData: {
        canRelink: true
      },
      selectedKey: [],
      skipsDiagramUpdate: false,
      isDeviceModal:false,
      isDeviceData : [], 
      nodeEvent: null,
    };
    
  }

  public componentDidMount(): void {
    
    DiagramViewService.getTopologyNode()
      .then(res => {   
        this.setState({nodeDataArray:res.data})
        
      })
      // this.reinitModel();
  }



  public handleDiagramEvent = (e: go.DiagramEvent)  => {
    console.log(e);
    const name = e.name;
    const keys = [];
    switch (name) {
      case 'ChangedSelection': {
        // const sel = e.subject.first();
        
        // if (!this.state.selectedKey.includes(sel.key)) {
        //   keys.push(sel.key);
        //   console.log(sel.key)
        //   this.setState({ selectedKey: this.state.selectedKey.concat(sel.key)});
        // } else {
        //   this.setState({ selectedKey: this.state.selectedKey.filter((v) => v !== sel.key)});
        // }
        break;
      }
      default: break;
    }
  }

  public handleModelChange = (obj: go.IncrementalData)  => {
    
    const insertedNodeKeys = obj.insertedNodeKeys;  // 삽입된 노드키
    const modifiedNodeData = obj.modifiedNodeData;  // loc 변화
    const removedNodeKeys = obj.removedNodeKeys;      // 삭제된 노드키
    const insertedLinkKeys = obj.insertedLinkKeys;   // 삽입된 링크키
    const modifiedLinkData = obj.modifiedLinkData;    // 수정된 링크키
    const removedLinkKeys = obj.removedLinkKeys;      // 삭제된 링크키
    const modifiedModelData = obj.modelData;      // 모델 데이터

    console.log(obj)
    console.log(modifiedNodeData);
    console.log(modifiedModelData);
    console.log(obj.modifiedNodeData);
    

    const { selectedKey, nodeDataArray, skipsDiagramUpdate } = this.state;
    this.setState({ nodeEvent: obj})

    this.setState({skipsDiagramUpdate: true})
    
    if(obj.modifiedNodeData !== undefined && skipsDiagramUpdate ) {
      const key:Array<Number> = [];
      modifiedNodeData.forEach((v) => {
        key.push(v.id)
      })
      const keyDelete = nodeDataArray.filter((x,i) => {
        return x.id != key[i]
        }
      );
      const keyInsert = keyDelete.concat(modifiedNodeData);
      this.setState({ nodeDataArray : keyInsert})
    }
  }

  public reinitModel() {
    console.log("reinitModel");
    
    this.diagramRef.current.clear();
    this.setState({
      nodeDataArray: [],
      linkDataArray: [],
      skipsDiagramUpdate: false
    });
  }

  public handleRelinkChange = (e: any) => {
    const target = e.target;
    const value = target.checked;
    this.setState({ modelData: { canRelink: value }, skipsDiagramUpdate: false });
  }

  public addNodeBtn = () => {
    AiwacsService.getEquipmentSnmp() 
      .then(res => {
        this.setState({isDeviceData:res.data, isDeviceModal: true})
      })
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
        obj.equipment= v.data.equipment
        obj.settingIp=v.data.settingIp
        obj.loc=xAxis+' '+"30"
        selectedDeviceName.push(obj);
        console.log(selectedDeviceName);
        
      });
      this.setState({ isDeviceModal:false, nodeDataArray: this.state.nodeDataArray.concat(selectedDeviceName)  });
    }
  }

  public saveBtn = () => {
    const { nodeDataArray } = this.state;
    // console.log(selectedDeviceName);
    const data = {
      nodeDataArray: nodeDataArray
    }
    const ddata = [{ equipment : "아아아" }]
    DiagramViewService.insertTopologyNode(data) 
      .then(() => {
         console.log("data")
        })
      .catch((err) => console.log(err))
      
    
  }

  public render = () => {

  const { nodeDataArray,selectedKey, isDeviceModal, isDeviceData,skipsDiagramUpdate } = this.state;
  console.log(nodeDataArray);
  console.log(selectedKey);
  console.log(isDeviceData);
  console.log(skipsDiagramUpdate);
  
  
  
  
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