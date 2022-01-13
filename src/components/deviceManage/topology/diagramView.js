import React, { Component } from 'react';
import {  AgGridReact } from 'ag-grid-react';
import { Modal,Button,Form, Container, Row,Col } from 'react-bootstrap';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import "ag-grid-enterprise";
import styles from '../../../css/diagramEquipment.module.css';
import DiagramViewService from '../../../services/diagramView.service'


const modalOptions = {
  diagramColumnDefs: [
    { headerName: '그룹 명', field:'groupName' , headerCheckboxSelection: true, checkboxSelection:true },
    { headerName: '설명' , field:'content'},
    { headerName: '등록 일자', field:'createdAt' },
    { headerName: '최초 등록자', field:'startCreatedName'},
    { headerName: '수정 일자', field:'updatedAt'},
    { headerName: '마지막 수정자', field:'endCreatedName'},
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
      modelCreatedCheck: false,
      validatedCheck: false,
      groupName: '',
      content: '',
      diagramGroupData: [],
    }
  }

  componentDidMount() {
    // const { diagramGroupData } = this.state;

    DiagramViewService.getTopologyNode()
      .then(res => {
        this.setState({diagramGroupData: res.data})
      })
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
    const { groupName, content  } = this.state;
    const form=e.currentTarget;

      if(form.checkValidity() === false) {   // valid Check
        e.preventDefault();
        e.stopPropagation();   // 이벤트 멈춤
      } else {
        e.preventDefault();

        const diagramData = {
          groupName: groupName,
          content: content,
        }
        DiagramViewService.insertDiagramGroup(diagramData)
          .then(res => {
            console.log("다이어그램 그룹 추가");
            this.setState({diagramGroupData: res.data })
          })
      }
      this.setState({ validatedCheck: true})

  }

  groupNameTextChange = (e) => { this.setState({groupName: e.target.value})}
  contentTextChange = (e) =>   { this.setState({content: e.target.value})}


  render() {
    const { filterCheck, modelCreatedCheck,validatedCheck, groupName, content, diagramGroupData } = this.state; 
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
                <Button className="SaveBtnRemove" onClick={this.onRemoveClick}>삭제</Button>

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
                      <Button onClick={() => this.setState({ modelCreatedCheck: false })} className="reporthideBtn">닫기</Button>
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
              rowHeight='25'
              columnDefs={modalOptions.diagramColumnDefs}  
              defaultColDef={modalOptions.diagramDefaultColDef}
              rowData={diagramGroupData}
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