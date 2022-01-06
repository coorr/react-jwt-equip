import React, { Component } from 'react';
import {Button, Modal, Form } from "react-bootstrap";
import {  AgGridReact } from 'ag-grid-react';

import "ag-grid-enterprise";
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

class DeviceModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDeviceData: this.props.data 
    }
  }

  applyDeviceModal = () => {
    const data = [
      {key:1, name:"222"}
    ]
    this.setState({isDeviceData :data })
    // this.props.data(this.state.isDeviceData)
    this.props.data();
    this.props.onHide();
  }

  render() {
    console.log("디바이스 장비 모델");
    console.log(this.props.isDeviceModal);
    console.log(this.state.isDeviceData);
    return (
      <>
      <Modal show={this.props.show} onHide={this.props.onHide} dialogClassName="userModel" className="reportModelHw">
        <Modal.Header className="header-Area">
          <Modal.Title id="contained-modal-title-vcenter" className="header_Text">장비</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="ag-theme-alpine" style={{ width: "43vw", height: "40vh" }}>
            <AgGridReact
              headerHeight="30"
              floatingFiltersHeight="27"
              rowHeight="30"
              rowSelection="multiple"
              // rowData={deviceData}
              // columnDefs={modalOptions.deviceColumnDefs}
              // defaultColDef={modalOptions.deviceDefaultColDef}
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
    );
  }
}

export default DeviceModal;