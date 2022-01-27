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
  skipsDiagramUpdate: boolean;
  isDeviceModal: boolean;
  isDeviceData: Array<object>;
  isImageAddModel:boolean;
  diagramId: Number;
  imagePreviewUrl: any;
  file: any;
  imageData: string;
  isObjectAddModel: boolean;
  isIconKey:Number;
  isIconValue: any;
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

const iconArr:Array<object> = [
  
  {id:7 ,img:'http://localhost:8080/static/marker-green.png', size:'30 30', nodeBorder: 'white', loc:'-700 80'  , category:'icon'},
  {id:6 ,img:'http://localhost:8080/static/marker-blue.png', size:'30 30', nodeBorder: 'white', loc:'-700 80' , category:'icon' },
  {id:8 ,img:'http://localhost:8080/static/marker-red.png',  size:'30 30', nodeBorder: 'white', loc:'-700 80', category:'icon' },
];

export class TopogolyEquipment extends Component<Props , AppState> {
  deviceGridApi: any;
  constructor(props: Props) {
    super(props);
    this.state = {
      // nodeDataArray: [
      //   { key: 0, text: 'Alpha', color: 'white', loc: '0 0' },
      //   { key: 1, text: 'Beta', color: 'white', loc: '150 0' },
      //   { key: 2, text: 'Gamma', color: 'white', loc: '0 150' },
      //   // { key: 3, text: 'Delta', color: 'white', loc: '150 150' , size:'30 30' , nodeBorder: 'white', img: 'http://localhost:8080/static/marker-green.png' }
      // ],
      nodeDataArray: [],
      linkDataArray:[],
      modelData: { canRelink: true },
      file: null,
      
      skipsDiagramUpdate: false,

      isDeviceModal:false,
      isImageAddModel: false,
      isObjectAddModel: false,
      isDeviceData : [], 
      isIconKey:7,
      isIconValue: {id:7 ,img:'http://localhost:8080/static/marker-green.png', size:'30 30', nodeBorder: 'white', loc:'-700 80' , category:'icon' },
      
      diagramId:this.props.match.params.no,
      imagePreviewUrl: null,
      imageData: null,
    };
    
  }

  public componentDidMount(): void {
    const { diagramId, file } = this.state; 
    DiagramViewService.getTopologyNode(diagramId)
      .then(res => {   
        const reader = new FileReader();
        this.setState({
          nodeDataArray:res.data.nodeDataArray, 
          linkDataArray: res.data.linkDataArray,
          
        })
        if(res.data.image !== undefined) {
          this.setState({ imageData: res.data.image })
        }
      })
      
  }



  public handleDiagramEvent = (e: go.DiagramEvent)  => {

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
    
    const { nodeDataArray, linkDataArray, skipsDiagramUpdate } = this.state;
    

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
    console.log(nodeDataArray);
    
    AiwacsService.getEquipmentSnmp() 
      .then(res => {
        console.log(res.data);
        
        const nodeIp:Array<Number> = [];
        nodeDataArray.forEach((n) => {
          nodeIp.push(n.settingIp);
        })
        const deviceData = res.data.filter((v:any) => {
          return !nodeIp.includes(v.settingIp)
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
        obj.category='device'
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
    this.setState({ imagePreviewUrl:null , imageData: null })
  }

  public fileChange = (e:any) => {
    this.setState({ file: e.target.files[0]})
  }

  public filePost = (e:any) => {
    e.preventDefault();
    const { file,imagePreviewUrl } = this.state; 
    if(file === null ) {
      return alert("파일을 선택해주세요.")
    } 
    
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    const fileExtension = file.name.split('.').pop();
    
    if(fileExtension === 'jpg' || fileExtension === 'png' || fileExtension === 'PNG' ) {
      reader.onloadend  = (e) => {
        this.setState({imagePreviewUrl : reader.result, isImageAddModel:false , imageData:null})
      }
      reader.readAsDataURL(file);
      
    } else {
      return alert("이미지 파일만 업로드 가능합니다.")
    }
  }

  objectAddBtn = () => {
    this.setState({isObjectAddModel : true})
  }

  iconChange = (e:any,v:any) => {
    
    console.log(v);
    this.setState({isIconKey: v.id , isIconValue: v})
    
  }

  objectPost = (e:any) => {
    e.preventDefault();
    const { isIconValue } = this.state; 
    this.setState({ isObjectAddModel:false, nodeDataArray: this.state.nodeDataArray.concat(isIconValue), skipsDiagramUpdate:false })

  }

  public saveBtn = () => {
    const { nodeDataArray, linkDataArray, diagramId, file, imageData, imagePreviewUrl } = this.state;
    console.log(file);
    
    const formData = new FormData();
    formData.append('file', file);
    const data = {
      nodeDataArray: nodeDataArray,
      linkDataArray: linkDataArray,
    }
    
    if(imageData === null) {
      if(imagePreviewUrl !== null) {
        DiagramViewService.diagramInsertImage(diagramId,formData) 
        .then(() => {
          console.log("이미지 서버로 가기");
          
          })
        .catch((err) => console.log(err))
      } else {
        DiagramViewService.diagramDeleteImage(diagramId) 
        .then(() => {
          console.log("이미지 서버로 가기");
          
          })
        .catch((err) => console.log(err))
      }
    }
    DiagramViewService.insertTopologyNode(diagramId, data) 
      .then(() => {
         alert("저장되었습니다.")
        })
      .catch((err) => alert("실패했습니다."))  
    
    
  }

  

  public render = () => {

  const { nodeDataArray, linkDataArray, isDeviceModal, isDeviceData, isImageAddModel,imagePreviewUrl, imageData, isObjectAddModel,isIconKey, isIconValue } = this.state;
  console.log("node" ,nodeDataArray);
  console.log("link" ,linkDataArray);
  
  
    return (
      <div className={styles.topogolgy_container}>
        <div className={styles.topogolgy_topMenu}>
          <button className={styles.topogolgy_topButton} onClick={() => this.objectAddBtn()}>
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
                  <Button className="saveBtn" onClick={(e)=> {this.filePost(e)}} > 추가 </Button>
                  <Button onClick={()=> this.setState({isImageAddModel: false})} className="hideBtn"  >닫기</Button>
                </Form.Group>
              </Modal>
            </>
          }
          {
            isObjectAddModel && 
            <>
            <Modal show={isObjectAddModel} onHide={()=> this.setState({isObjectAddModel:false})} size="lg" aria-labelledby="contained-modal-title-vcenter"   >
              <Modal.Header  className="header-Area">
              <Modal.Title id="contained-modal-title-vcenter" className="header_Text">
                장비
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <Container>
                <Form.Group as={Row} className="mb-3" controlId="formHorizontalEquip">
                    <Form.Label column sm={3}>  
                    <span className="list_square">■</span>
                      카테고리
                    </Form.Label>

                    <div className="fileArea">
                      <select name="changeType" className="diagramChartSelect" >
                          <option value="icon">아이콘</option>
                          <option value="text">텍스트</option>
                      </select>
                    </div>
                </Form.Group>

                <Form.Group as={Row} className="mb-3" controlId="formHorizontalEquip">
                    <Form.Label column sm={3}>  
                    <span className="list_square">■</span>
                      유형
                    </Form.Label>

                    <div className="fileArea">
                      {
                        iconArr.map((v:any,i) => (
                          <div key={v}>
                            <input type="radio" checked={v.id === isIconKey} value={isIconValue} onChange={(e) => this.iconChange(e,v)} />
                            <img src={v.img} className={styles.diagram_category_icon} />
                          </div>
                        ))
                      }
                    </div>
                </Form.Group>
              </Container>
            </Modal.Body>
                <Form.Group className="ButtonArea">
                  <Button className="saveBtn" onClick={(e)=> {this.objectPost(e)}} > 추가 </Button>
                  <Button onClick={()=> this.setState({isObjectAddModel: false})} className="hideBtn"  >닫기</Button>
                </Form.Group>
              </Modal>
            </>
          }
        </div>

        <DiagramWrapper
          nodeDataArray={this.state.nodeDataArray }
          linkDataArray={this.state.linkDataArray }
          modelData={this.state.modelData } 
          skipsDiagramUpdate={this.state.skipsDiagramUpdate }
          onDiagramEvent={(e) => this.handleDiagramEvent(e) }
          onModelChange={(obj) => this.handleModelChange(obj) }
          dbImage={imageData }
          currentImage={imagePreviewUrl }
          
        />
      </div>
    );
  }
}