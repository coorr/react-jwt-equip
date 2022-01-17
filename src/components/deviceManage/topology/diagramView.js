import React, { Component } from 'react';
import {  AgGridReact } from 'ag-grid-react';
import { Modal,Button,Form, Container, Row,Col } from 'react-bootstrap';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import "ag-grid-enterprise";
import styles from '../../../css/diagramEquipment.module.css';
import DiagramViewService from '../../../services/diagramView.service'
import { FaLastfmSquare } from 'react-icons/fa';




const modalOptions = {
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
      modelCreatedCheck: false,
      modelUpdateCheck: false,
      validatedCheck: false,
      groupId: '',
      groupName: '',
      content: '',
      diagramGroupData: [],
      formData: [],

      diagramColumnDefs: [
        { headerName: '그룹 명', field:'groupName' , headerCheckboxSelection: true, checkboxSelection:true, onCellClicked: this.onUpdateClick },
        { headerName: '설명' , field:'content' , onCellClicked: this.onUpdateClick},
        { headerName: '등록 일자', field:'createdAt' , onCellClicked: this.onUpdateClick},
        { headerName: '최초 등록자', field:'startCreatedName' , onCellClicked: this.onUpdateClick},
        { headerName: '수정 일자', field:'updatedAt' , onCellClicked: this.onUpdateClick},
        { headerName: '마지막 수정자', field:'endCreatedName' , onCellClicked: this.onUpdateClick},
        { headerName: '구성도 구성', cellRendererFramework: this.editTopology },
        { headerName: '구성도 조회', cellRendererFramework: this.selectTopology },
      ],
    }
  }

  componentDidMount() {
    DiagramViewService.getDiagramGroup()
      .then(res => {
        this.setState({diagramGroupData: res.data})
      })
  }

  
  onUpdateClick = (params) => {
    console.log(params);
    this.setState({
      modelUpdateCheck: true,
      modelCreatedCheck: true,
      content: params.data.content,
      groupName: params.data.groupName,
      groupId: params.data.id
    })
  }

  editTopology = (params) =>  {
    // console.log(params);
      return ( <button className={styles.edit_topology_style} onClick={() => this.editReadTopology(params.data.id)}>변경</button> )
  } 
  editReadTopology = (diagramId) => {
    this.props.history.push(`/DiagramView/${diagramId}`)


  }
  // <Route exact path="/DiagramView/:no"     component={showAdminBoard ? TopogolyEquipment : () => <div>Loading posts...</div>} />

  selectTopology = (params) =>{
    // console.log(params);
      return ( <button className={styles.select_topology_style}>조회</button> )
  } 

  clickFilter = () => {
    const { filterCheck } = this.state;
    if(filterCheck) {
      this.setState({filterCheck:false})
    } else {
      this.setState({filterCheck:true})
    }
  }

  handleSubmit = (e) => {
    const { groupName, content ,modelUpdateCheck, groupId } = this.state;
    const form=e.currentTarget;

    if(form.checkValidity() === false) {   // 유효성 체크
      e.preventDefault();
      e.stopPropagation();   
      return this.setState({ validatedCheck: true})
    } else if(modelUpdateCheck === false){   // 그룹 추가
      e.preventDefault();

      const diagramData = {
        groupName: groupName,
        content: content,
      }
      DiagramViewService.insertDiagramGroup(diagramData)
        .then(res => {
          alert("그룹이 추가되었습니다.")
          this.setState({diagramGroupData: res.data, modelCreatedCheck:false, groupName: '', content: '', groupId:'' })
        }).catch(err => alert(err)) 
    } else if(modelUpdateCheck === true) {   // 그룹 수정
      e.preventDefault();
      const updateData = {
        groupName: groupName,
        content: content,
        id: groupId,
      }
      DiagramViewService.updateDiagramGroup(updateData)
      .then(res => {
        alert("그룹이 수정되었습니다.")
        this.setState({diagramGroupData: res.data, modelCreatedCheck:false,modelUpdateCheck:false, groupName: '', content: '', groupId:'' })
      }).catch(err => console.log(err)) 
    }
    this.setState({ validatedCheck: false})

  }

  groupNameTextChange = (e) => { this.setState({groupName: e.target.value})}
  contentTextChange = (e) =>   { this.setState({content: e.target.value})}

  modelCancel = () => {
    this.setState({ 
      modelCreatedCheck: false,
      modelUpdateCheck:false,
      groupId: '',
      content: '',
      groupName:''
     })
  }

  onRemoveClick = () => {
    // const {  } = this.state;
    const activeNodes = this.diagram.getSelectedRows();
    console.log(activeNodes);
    const groupIdAry = [];
      activeNodes.map(c => {
        groupIdAry.push(c.id);
    });
    const equipId = groupIdAry.join('|');
    console.log("Remove : " + equipId); 
    DiagramViewService.deleteDiagramGroup(equipId)
    .then(res => {
      this.setState({diagramGroupData: res.data})
      alert("삭제되었습니다.");
    })
    .catch(err => alert("삭제 실패되었습니다."))
  }


  render() {
    const { filterCheck, modelCreatedCheck,validatedCheck, groupName, content, diagramGroupData, diagramColumnDefs, modelUpdateCheck, formData 
    } = this.state; 
    console.log(diagramGroupData);
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

          <div className={filterCheck ? styles.diagram_gridArea : styles.diagram_gridArea_Second}>
            <div className={styles.diagram_gridBtnBox}>
                <Button className="SaveBtn" onClick={() => this.setState({modelCreatedCheck: true})}>등록</Button>
                <Button className="SaveBtnRemove" onClick={() => this.onRemoveClick()}>삭제</Button>

                { modelCreatedCheck && (
                  <>
                  <Modal show={modelCreatedCheck} onHide={()=> this.setState({modelCreatedCheck: false})} dialogClassName="userModel" className="reportModelHw">
                    <Modal.Header className="header-Area">
                      <Modal.Title id="contained-modal-title-vcenter" className="header_Text">구성도 그룹</Modal.Title>
                    </Modal.Header>
                    <Form noValidate validated={validatedCheck} onSubmit={this.handleSubmit} >
                    <Modal.Body className="diagram_model_body">

                    <Form.Group as={Row} className="mb-3" controlId="formHorizontalEquip">
                      <Form.Label column sm={3}>
                        <span className="list_square">■</span>그룹 명
                      </Form.Label>
                      
                      <Col sm={9}>
                        <Form.Control type="text" placeholder="그룹 명" name="groupName" value={groupName}  onChange={this.groupNameTextChange} required />
                        <Form.Control.Feedback type="invalid">그룹 명을 입력해주세요.</Form.Control.Feedback>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3" >
                      <Form.Label column sm={3}>
                        <span className="list_square">■</span>설명
                      </Form.Label>

                      <Col sm={9}>
                        <Form.Control 
                        as="textarea" 
                        style={{height: '200px'}} 
                        type="text" 
                        placeholder="내용을 입력해주세요." 
                        name="content"  
                        value={content}
                        onChange={this.contentTextChange}   />
                      </Col>
                    </Form.Group>

                    </Modal.Body>
                    
                    <Form.Group className="reportDeviceFooter">
                      <Button variant="primary" type="submit" className="reportActiveBtn">저장</Button>
                      <Button onClick={() => this.modelCancel()} className="reporthideBtn">닫기</Button>
                    </Form.Group>
                    </Form>
                  </Modal>
                  </>
                )}
            </div>

            <div className="ag-theme-alpine" style={{ width:'96vw', height:'55vh',marginLeft:'0.5vw'}}>
              <AgGridReact
              headerHeight='30'
              floatingFiltersHeight='23'
              rowHeight='30'
              columnDefs={diagramColumnDefs}  
              defaultColDef={modalOptions.diagramDefaultColDef}
              rowData={diagramGroupData}
              rowSelection='multiple'
              // rowModelType={'infinite'} 
              // cacheBlockSize='30'
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