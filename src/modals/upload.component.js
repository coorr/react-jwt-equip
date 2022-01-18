import React, {Component} from 'react';
import { Modal,Button,Form, Container, Row,Col} from 'react-bootstrap';
import '../css/modal.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import AiwacsService from '../services/equipment.service';
import * as ExcelJs from 'exceljs';
import { saveAs } from 'file-saver';
import XLSX from 'xlsx';
import {  AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import "ag-grid-enterprise";

const SheetJSFT = [
   "xlsx", "xlsb", "xlsm", "xls", "xml", "csv", "txt", "ods", "fods", "uos", "sylk", "dif", "dbf", "prn", "qpw", "123", "wb*", "wq*", "html", "htm"
].map(function(x) { return "." + x; }).join(",");

const make_cols = refstr => {
   let o = [], C = XLSX.utils.decode_range(refstr).e.c + 1;
   for(var i = 0; i < C; ++i) o[i] = {name:XLSX.utils.encode_col(i), key:i}
   return o;
};

const hwNumber = "5,10,15,20,30,60,120,150,180,240,300,600";

export default class upload extends Component  {
  constructor(props) {
    super(props);
    this.state={
      file: null,
      excelData: [],
      cols: [],
      message:"",
      checkIpModal: true,
      ipCheckData:[],
      columnDefs: [
        { headerName: '장비명',field: 'equipment', minWidth:300 },
        { headerName: '호스트 명',field: 'nickname' , minWidth:312},
      ],
      defaultColDef:   {   // 열 정의
        sortable:true,  // 열 마우스 선택 정렬
        filter:'agTextColumnFilter',  // 열 도구 
        resizable:true,  // 사이즈 조절 (width, max, min)
        floatingFilter: true,
        flex:1,
      },
    }
  }
  /* 등록 양식 */
  excelDownload = async() => {
    const workbook = new ExcelJs.Workbook();
    const workSheet = workbook.addWorksheet("Sheet1");

    workSheet.columns = [
      { header: "장비 명", key: "equipment", width: 20, },     { header: "호스트 명", key: "nickname", width: 18,  },    { header: "장비 IP", key: "settingIp", width: 18, },             
      { header: "종류", key: "settingType", width: 17, },      { header: "제조사", key: "settingPerson", width: 10, },  { header: "템플릿 그룹", key: "settingTemplate", width: 13,},   
      { header: "프록시 명", key: "settingProxy", width: 13,  }, { header: "유형", key: "settingCatagory", width: 22,  }, { header: "CPU/MEM 수집초기(초)", key: "hwCpu", width: 20,  }, 
      { header: "DISK 수집초기(초)", key: "hwDisk", width: 21,}, { header: "NIC 수집초기(초)", key: "hwNic", width: 20,}, { header: "센서 수집초기(초)", key: "hwSensor", width: 20,  }, 
    ];

    workSheet.addRow({ equipment:'', nickname:'', settingIp:'', settingType:'', settingPerson:'', settingTemplate:'', 
                      settingProxy:'', settingCatagory:'' ,hwCpu:30, hwDisk:30,hwNic:30, hwSensor:30 })

    workSheet.eachRow(() => {
      workSheet.getRow(1).border= {
          top: {style:'thin'},
          left: {style:'thin'},
          bottom: {style:'thin'},
          right: {style:'thin'}
      }
      workSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb:'e7e6e6'}
      }
      workSheet.getRow(1).alignment = {
        horizontal: 'center',
      }
    })

    // 다운로드
    const mimeType = { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], mimeType);
    console.log(blob);
    saveAs(blob, "Equipment.xlsx");
  }
  /* 파일 Change */
  fileChange = (e) => { 
    e.preventDefault();
    e.stopPropagation();
    this.setState({file: e.target.files[0]});
   }
   /* 파일 upload */
  filePost = () => {
    const { file,cols,excelData, message,ipCheckData} = this.state; 
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;

    const fileExtension = file.name.split('.').pop();
    console.log(file.name);
    console.log(fileExtension);

    if(file === null ) {
      alert("파일을 선택해주세요")
    } else if(fileExtension !== 'xlsx' ) {
      alert("엑셀 파일만 업로드 가능합니다.")
    } else {
      reader.onload = (e) => {
        const bstr = e.target.result;  
        const wb = XLSX.read(bstr, {
          type: rABS ? 'binary' : 'array',
          bookVBA: true,
        });
        wb.SheetNames.forEach(SheetName => {
          wb.Sheets[SheetName].A1.w="equipment";     wb.Sheets[SheetName].B1.w="nickname";         wb.Sheets[SheetName].C1.w="settingIp"; 
          wb.Sheets[SheetName].D1.w="settingType";   wb.Sheets[SheetName].E1.w="settingPerson";    wb.Sheets[SheetName].F1.w="settingTemplate";  
          wb.Sheets[SheetName].G1.w="settingProxy";  wb.Sheets[SheetName].H1.w="settingCatagory";  wb.Sheets[SheetName].I1.w="hwCpu";
          wb.Sheets[SheetName].J1.w="hwDisk";        wb.Sheets[SheetName].K1.w="hwNic";            wb.Sheets[SheetName].L1.w="hwSensor";
        })

        const wname = wb.SheetNames[0];
        const ws = wb.Sheets[wname];
        const data = XLSX.utils.sheet_to_json(ws);

        console.log(JSON.stringify(data));
          if(window.confirm("등록 하시겠습니까?") === true) {
            AiwacsService.uploadExcel(data,window.location.pathname)
            .then(
              res => {
              this.setState({ipCheckData:res.data})
              console.log("res : " + JSON.stringify(res.data));
              
              if(res.data !== "") {
                this.setState({checkIpModal: false})
              } else  {
                alert("장비가 등록 되었습니다.")
                window.location.reload();
              }
            },
              error  => {
              console.log(error);
              alert("등록 실패했습니다.");
            })
          } else {
            return false;
          }
      }
    }
    if (rABS && file !== null ) {
      reader.readAsBinaryString(file);
    } else if(!rABS && file !== null ) {
      reader.readAsArrayBuffer(file);
    }
    
  }

  render() {
    const { file,checkIpModal,columnDefs, ipCheckData } = this.state;
    console.log(ipCheckData);
    return (
      <>
      <Modal show={this.props.show} onHide={this.props.onHide} size="lg" aria-labelledby="contained-modal-title-vcenter"   >
      <Modal.Header  className="header-Area">
     
     <Modal.Title id="contained-modal-title-vcenter" className="header_Text">
       장비 일괄 등록
     </Modal.Title>

   </Modal.Header>

   { checkIpModal ? (
    
     <>
    <Modal.Body>
   <Container>
     <Form.Group as={Row} className="mb-3" controlId="formHorizontalEquip">
        <Form.Label column sm={3}>  
        <span className="list_square">■</span>
          파일
        </Form.Label>

        <div className="fileArea">
          <input type="file" className="fileInput" onChange={this.fileChange} accept={SheetJSFT} />
        </div>
     </Form.Group>

     <Form.Group as={Row} className="mb-4" controlId="formHorizontalEquip">
        <Form.Label column sm={3}>  
        <span className="list_square">■</span>
          등록 양식
        </Form.Label>

        <div className="formArea">
            <Button className="formBtn" onClick={this.excelDownload}>
              <span className="formFont">다운로드</span>
            </Button>
        </div>
     </Form.Group>
     </Container>

     </Modal.Body>

      <Form.Group className="ButtonArea">
        <Button className="saveBtn" onClick={()=> {this.filePost()}}> 추가 </Button>
        <Button onClick={this.props.onHide} className="hideBtn"  >닫기</Button>
       </Form.Group>
  </>

     
   ) : (
     <>
     <Modal.Body>
      <Container>
          <div>
            <p style={{fontSize:'0.8em'}}>* 아래와 같이 이미 등록된 장비가 존재합니다. 해당 장비는 등록되지 않습니다.</p>
          </div>

            <div className="ag-theme-alpine" style={{ width:'615px', height:'20vh'}}>
                <AgGridReact
                  headerHeight='30'
                  floatingFiltersHeight='27'
                  rowHeight='30'
                  rowData={ipCheckData} 
                  columnDefs={columnDefs} 
                  // defaultColDef={defaultColDef}
                />        
            </div>
      </Container>
     </Modal.Body>

     <Form.Group className="ButtonAreaTwo">
         <Button onClick={this.props.onHide} className="hideBtn"  >닫기</Button>
     </Form.Group>
     </>
   )
   }
     

     
    </Modal>
      </>
    )
  }
}