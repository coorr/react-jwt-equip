import React, { Component} from 'react';
import * as go from 'gojs';
import { DiagramWrapper } from './diagramWrapper';
import { ReactDiagram } from 'gojs-react';
import Moment from 'moment';

import EquipmentLogo from '../../../images/equipment.png';
import styles from '../../../css/diagramEquipment.module.css';
import AiwacsService from '../../../services/equipment.service'
import DiagramViewService from '../../../services/diagramView.service';

import {Button, Modal, Form, Row, Container } from "react-bootstrap";
import {  AgGridReact } from 'ag-grid-react';

import "ag-grid-enterprise";
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import diagramViewService from '../../../services/diagramView.service';
import { IoIosAddCircleOutline, IoMdArrowRoundBack } from "react-icons/io"
import { BsSave2 } from "react-icons/bs"


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
  isImageAddModel:boolean;
  nodeEvent: object;
  changeDiagramUpdate: boolean;
  diagramId: Number;
  imagePreviewUrl: any;
  file: any;
}

export interface Props {
  match: {
    params: {
      no: Number
    }
  },
  history: {
    push: any;
  }
}

export class TopogolyEquipment extends Component<Props , AppState> {
  // private diagramRef: React.RefObject<ReactDiagram>;

  deviceGridApi: any;
  constructor(props: Props) {
    super(props);
    this.state = {
      nodeDataArray: [],
      linkDataArray:[],
      modelData: { canRelink: true },
      file: null,
      
      selectedKey: [],
      skipsDiagramUpdate: false,
      changeDiagramUpdate: false,
      isDeviceModal:false,
      isDeviceData : [], 
      isImageAddModel: false,
      nodeEvent: null,
      diagramId:this.props.match.params.no,
      imagePreviewUrl: null,
    };
    
  }

  public componentDidMount(): void {
    const { diagramId } = this.state; 
    DiagramViewService.getTopologyNode(diagramId)
      .then(res => {   
        this.setState({
          nodeDataArray:res.data.nodeDataArray, 
          linkDataArray: res.data.linkDataArray, 
        })
      })
      console.log("componentDidMount");
      
  }



  public handleDiagramEvent = (e: go.DiagramEvent)  => {
    console.log(e);
    // const name = e.name;
    // const keys = [];
    // switch (name) {
    //   case 'ChangedSelection': {
    //     // const sel = e.subject.first();
        
    //     // if (!this.state.selectedKey.includes(sel.key)) {
    //     //   keys.push(sel.key);
    //     //   console.log(sel.key)
    //     //   this.setState({ selectedKey: this.state.selectedKey.concat(sel.key)});
    //     // } else {
    //     //   this.setState({ selectedKey: this.state.selectedKey.filter((v) => v !== sel.key)});
    //     // }
    //     break;
    //   }
    //   default: break;
    // }
  }

  public handleModelChange= (obj: go.IncrementalData) => {
    const insertedNodeKeys = obj.insertedNodeKeys;  // 삽입된 노드키
    const modifiedNodeData = obj.modifiedNodeData;  // loc 변화
    const removedNodeKeys = obj.removedNodeKeys;      // 삭제된 노드키
    const insertedLinkKeys = obj.insertedLinkKeys;   // 삽입된 링크키
    const modifiedLinkData = obj.modifiedLinkData;    // 수정된 링크키
    const removedLinkKeys = obj.removedLinkKeys;      // 삭제된 링크키
    const modifiedModelData = obj.modelData;      // 모델 데이터

    console.log(obj)
    
    this.setState({skipsDiagramUpdate: true})
    console.log(this.state.skipsDiagramUpdate);
    
    const { selectedKey, nodeDataArray, linkDataArray, changeDiagramUpdate, skipsDiagramUpdate } = this.state;
    

    if(obj.modifiedNodeData !== undefined &&  skipsDiagramUpdate) {
      console.log("노드 이동");
      
      const key:Array<Number> = [];
      modifiedNodeData.forEach((v) => {
        key.push(v.id)
      })
      const keyDelete = nodeDataArray.filter((x,i) => {
        return !key.includes(x.id);
        }
      );
      console.log("keyDelete" , keyDelete);
      
      const keyInsert = keyDelete.concat(modifiedNodeData);
      console.log("keyInsert", keyInsert);
      
      this.setState({ nodeDataArray: keyInsert })
    } 

    if(obj.removedNodeKeys !== undefined && skipsDiagramUpdate ) {
      console.log("노드 삭제");
      const key:Array<Number> = [];
      removedNodeKeys.forEach((v:any) => {
        key.push(v);
      })

      const keyDelete = nodeDataArray.filter((x,i) => {
        return !key.includes(x.id);
        }
      );
      console.log(keyDelete);
      
      this.setState({ nodeDataArray: keyDelete })
    }

    if(obj.modifiedLinkData !== undefined && skipsDiagramUpdate ) {
      console.log("링크 추가");
      
      this.setState({linkDataArray: linkDataArray.concat(modifiedLinkData) })
     }

     if(obj.removedLinkKeys !== undefined && skipsDiagramUpdate ) {
      console.log("링크 삭제");
      const key:Array<Number> = [];
      removedLinkKeys.forEach((v:any) => {
        key.push(v);
      })

      const keyDelete = linkDataArray.filter((x,i) => {
        return !key.includes(x.id);
        }
      );
      console.log(keyDelete);
      this.setState({ linkDataArray: keyDelete })
   }

  }


  public handleRelinkChange = (e: any) => {
    const target = e.target;
    const value = target.checked;
    this.setState({ modelData: { canRelink: value }, skipsDiagramUpdate: false });
  }

  public addNodeBtn = () => {
    const { nodeDataArray } = this.state;
    AiwacsService.getEquipmentSnmp() 
      .then(res => {
        const nodeKey:Array<Number> = [];
        nodeDataArray.forEach((n) => {
          nodeKey.push(n.id);
        })
        const deviceData = res.data.filter((v:any) => {
          return !nodeKey.includes(v.id)
        })
        
        console.log(deviceData);
        
        this.setState({isDeviceData:deviceData, isDeviceModal: true})
      })
  }

  public applyDeviceModal = () => {
    const { diagramId } = this.state;
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
        obj.id = v.data.id+"_"+diagramId
        obj.equipment= v.data.equipment
        obj.settingIp=v.data.settingIp
        obj.loc=xAxis+' '+"30"
        selectedDeviceName.push(obj);
        
      });
      this.setState({ isDeviceModal:false, nodeDataArray: this.state.nodeDataArray.concat(selectedDeviceName), skipsDiagramUpdate:false  });
    }
  }

  public removeLinkAll = () => {
    this.setState({ linkDataArray: [] , skipsDiagramUpdate: false})
  }

  public removeAll = () => {
    this.setState({ nodeDataArray: [], linkDataArray: [] , skipsDiagramUpdate: false})
  }

  public imageAddBackground = () => {
    this.setState({isImageAddModel: true})
  }

  public imageRemoveBackground = () => {
    this.setState({ imagePreviewUrl:null })
  }

  public fileChange = (e:any) => {
    this.setState({ file: e.target.files[0]})
  }

  public filePost = () => {
    const { file,imagePreviewUrl } = this.state; 
    if(file === null ) {
      return alert("파일을 선택해주세요.")
    } 
    
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    const fileExtension = file.name.split('.').pop();
    
    if(fileExtension === 'jpg' || fileExtension === 'png' || fileExtension === 'PNG' ) {
      reader.onloadend  = (e) => {
         this.setState({imagePreviewUrl : reader.result, isImageAddModel:false })
      }
      reader.readAsDataURL(file);
    } else {
      return alert("이미지 파일만 업로드 가능합니다.")
    }
  }

  public saveBtn = () => {
    const { nodeDataArray, linkDataArray, diagramId } = this.state;
    const data = {
      nodeDataArray: nodeDataArray,
      linkDataArray: linkDataArray,
    }
    DiagramViewService.insertTopologyNode(diagramId, data) 
      .then(() => {
         console.log("저장하기 성공")
        })
      .catch((err) => console.log(err))
  }

  

  public render = () => {

  const { nodeDataArray, linkDataArray, selectedKey, isDeviceModal, isDeviceData,skipsDiagramUpdate,changeDiagramUpdate, isImageAddModel,file,imagePreviewUrl } = this.state;
  console.log("node" ,nodeDataArray);
  console.log("link" ,linkDataArray);
  
  
  
  
  
    return (
      <div className={styles.topogolgy_container}>
        <div className={styles.topogolgy_topMenu}>
          <button className={styles.topogolgy_topButton} >
            <IoIosAddCircleOutline className={styles.topogolgy_addLogo} size="24" color='green' />
            오브젝트 추가
          </button>
          <button className={styles.topogolgy_topButton} onClick={this.addNodeBtn}>
            <IoIosAddCircleOutline className={styles.topogolgy_addLogo} size="24" color='green' />
            장비 추가
          </button>
          <button className={styles.topogolgy_topButton} onClick={this.saveBtn}>
            <IoIosAddCircleOutline className={styles.topogolgy_addLogo} size="24" color='green' />
            장비 그룹 추가
          </button>
          <button className={styles.topogolgy_topButton} onClick={this.saveBtn}>
            <IoIosAddCircleOutline className={styles.topogolgy_addLogo} size="24" color='green' />
            그룹 추가
          </button>
          <button className={styles.topogolgy_topButton} onClick={() => this.imageAddBackground()}>
            <IoIosAddCircleOutline className={styles.topogolgy_addLogo} size="24" color='green' />
            배경 이미지 추가
          </button>
          <button className={styles.topogolgy_topButton} onClick={() => this.imageRemoveBackground()}>
            <IoIosAddCircleOutline className={styles.topogolgy_addLogo} size="24" color='orange' />
            배경 이미지 삭제
          </button>
          <button className={styles.topogolgy_topButton} onClick={() => this.removeAll()}>
            <IoIosAddCircleOutline className={styles.topogolgy_addLogo} size="24" color='orange' />
            전체 삭제
          </button>
          <button className={styles.topogolgy_topButton} onClick={() => this.removeLinkAll()} >
            <IoIosAddCircleOutline className={styles.topogolgy_addLogo} size="24" color='orange' />
            전체 링크 삭제
          </button>
          <button className={styles.topogolgy_topButton_right} onClick={this.saveBtn}>
            <BsSave2 className={styles.topogolgy_addLogo_save} size="20" color='purple' />
            저장
          </button>
          <button className={styles.topogolgy_topButton_right} onClick={()=> this.props.history.push('/DiagramView')}>
            <IoMdArrowRoundBack className={styles.topogolgy_addLogo_list} size="20" color='skyblue' />
            목록
          </button>
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
          { isImageAddModel && 
            <>
            <Modal show={isImageAddModel} onHide={()=> this.setState({isImageAddModel:false})} size="lg" aria-labelledby="contained-modal-title-vcenter"   >
              <Modal.Header  className="header-Area">
              <Modal.Title id="contained-modal-title-vcenter" className="header_Text">
                장비 일괄 등록
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <Container>
                <Form.Group as={Row} className="mb-3" controlId="formHorizontalEquip">
                    <Form.Label column sm={3}>  
                    <span className="list_square">■</span>
                      파일
                    </Form.Label>

                    <div className="fileArea">
                      <input type="file" className="fileInput" onChange={this.fileChange} />
                    </div>
                </Form.Group>
              </Container>
            </Modal.Body>

                <Form.Group className="ButtonArea">
                  <Button className="saveBtn" onClick={()=> {this.filePost()}} > 추가 </Button>
                  <Button onClick={()=> this.setState({isImageAddModel: false})} className="hideBtn"  >닫기</Button>
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
          onDiagramEvent={(e) => this.handleDiagramEvent(e)}
          onModelChange={(obj) => this.handleModelChange(obj)}
          formData={imagePreviewUrl}
          
        />
      </div>
    );
  }
}