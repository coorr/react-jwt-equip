import React, {Component} from 'react';
import { Modal,Button,Form, Container, Row,Col} from 'react-bootstrap';
import '../css/modal.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Select from 'react-select'
import AiwacsService from '../services/aiwacs.service';
import { Redirect } from 'react-router';


const Type = [ {label: 'SNMP',value:'SNMP'},{label:'ICMP', value:'ICMP'} ]
const Template = [
  {label: 'None',value:'None'},{label: 'Cisco C6807-XL',value:'Cisco C6807-XL'},{label: 'Cisco 표준',value:'Cisco 표준'},{label: '지니안',value:'지니안'},
  {label: 'SECUI',value:'SECUI'},{label: 'HPE5130',value:'HPE5130'},{label: 'HPE5930',value:'HPE5930'},{label: 'HPE5900',value:'HPE5900'},
  {label: 'HPE10504',value:'HPE10504'},{label: 'HPE5510',value:'HPE5510'},{label: 'DASAN',value:'DASAN'},{label: 'Cisco6509',value:'Cisco6509'},
  {label: 'DASAN_100M',value:'DASAN_100M'},{label: 'Default',value:'Default'},{label: 'AXGATE',value:'AXGATE'},{label: 'AhnLab',value:'AhnLab'},
  {label: 'ALCATEL',value:'ALCATEL'},{label: 'Juniper',value:'Juniper'},{label: '펜타시큐리티',value:'펜타시큐리티'},{label: 'HPE5940',value:'HPE5940'},
  {label: 'Dell S3124',value:'Dell S3124'},{label: 'Piolink',value:'Piolink'},{label: 'UPS Single',value:'UPS Single'}, ]
const Catagory = [
  {label: 'Server',value:'Server'},{label: 'Network',value:'Network'},{label: 'L2 Switch',value:'L2 Switch'},
  {label: 'L3 Switch',value:'L3 Switch'},{label: 'L4 Switch',value:'L4 Switch'},{label: 'L7 Switch',value:'L7 Switch'},
  {label: 'Firewall',value:'Firewall'},{label: 'Security',value:'Security'},{label: 'Air Conditioner',value:'Air Conditioner'},
  {label: 'UPS',value:'UPS'},]
const Proxy = [{label:'127.0.0.1:8891',value: '127.0.0.1:8891'}];
const HardwareTitle = [{label:'일괄설정', value:'일괄설정'},{label:'개별항목설정', value:'개별항목설정'}];
const HardwareNumber = 
[{label:'5', value:'5'},{label:'10', value:'10'},{label:'15', value:'15'},{label:'20', value:'20'},{label:'30', value:'30'},{label:'60', value:'60'}
,{label:'120', value:'120'},{label:'150', value:'150'},{label:'180', value:'180'},{label:'240', value:'240'},{label:'300', value:'300'},{label:'600', value:'600'} ];

export default class modal extends Component  {
   constructor(props) {
     super(props);
     this.state={
        redirect:null,  
        validated: false,
        equipment: '',
        nickname: '',
        settingType: {label: 'SNMP' , value:'SNMP' },
        settingTemplate: {label: 'None' , value:'None'},
        settingCatagorys: [],
        checkList: [],
        settingCatagory: 'Server',
        settingIp: '', 
        settingOs: '',
        settingPerson:'',
        settingProxy: {label:'127.0.0.1:8891',value: '127.0.0.1:8891'},
        settingActive: true,
        deletedFlag: true,

        hwTitle: {label: '일괄설정' , value:'일괄설정'},    
        hwNumber: {label: '120' , value:'120'},
        hwCpu: {label: '120' , value:'120'},
        hwDisk: {label: '120' , value:'120'},
        hwNic: {label: '180' , value:'180'},
        hwSensor: {label: '120' , value:'120'},
        hwOpen: false,

        group:[],
      }
   }
   onChangeEquipment = (e) => { this.setState({equipment: e.target.value}) }
   onChageNickname =  (e) => { this.setState({nickname: e.target.value}) }
   onChangeType = (value) => { this.setState({settingType :value}) }
   onChangeTemplate = (value) => {this.setState({settingTemplate : value})}
   onChangeIp = (e)=> { this.setState({settingIp: e.target.value}) }
   onChangeOs= (e) => { this.setState({settingOs: e.target.value}) }
   onChangePerson = (e) => { this.setState({settingPerson: e.target.value}) }
   onChangeProxy = (value) => {this.setState({settingProxy : value})}
   onChangeActive = (e) => {
     if(e.target.checked) {
       this.setState({ settingActive: true })
     } else {
       this.setState({settingActive:false});
     }
   }
  onChangeHwTitle = (value) => {this.setState({hwTitle:value})}
  onChangeHwNumber = (value) => {
    this.setState({
      hwCpu:value,
      hwDisk:value,
      hwNic:value,
      hwSensor:value
    })
  }
  onChangeHwCpu = (value) => {this.setState({hwCpu:value})}
  onChangeHwDisk = (value) => {this.setState({hwDisk:value})}
  onChangeHwNic = (value) => {this.setState({hwNic:value})}
  onChangeHwSensor = (value) => {this.setState({hwSensor:value})}

componentDidMount() { }


   handleSubmit = (e) => { 
      const form=e.currentTarget;

      if(form.checkValidity() === false) {   // valid Check
        e.preventDefault();
        e.stopPropagation();   // 이벤트 멈춤

        console.log("체크 걸림");
      } else {
        console.log("체크에 풀림")
        const equipment = {
          equipment: this.state.equipment,
          nickname: this.state.nickname,
          settingType: this.state.settingType.value,
          settingTemplate: this.state.settingTemplate.value,
          settingIp: this.state.settingIp,
          settingCatagory: this.state.settingCatagory,
          settingOs: this.state.settingOs,
          settingPerson: this.state.settingPerson,
          settingProxy: this.state.settingProxy.value,
          settingActive: this.state.settingActive,
          hwCpu:this.state.hwCpu.value,
          hwDisk:this.state.hwDisk.value,
          hwNic:this.state.hwNic.value,
          hwSensor:this.state.hwSensor.value,
          deletedFlag:this.state.deletedFlag,

        }

      console.log("equipment : " +JSON.stringify(equipment));
      const userDetail = JSON.parse(localStorage.getItem('user'))
      console.log(userDetail);
        const historyRecord = {
          actionType: '',
          userName: userDetail.username,
          settingIp: '',
          menuDepth1: '장비 관리',
          menuDepth2: '',
          menuDepth3: '',
          menuDepth4: '',
          pageURL: '/equipmentManage',
          targetName: userDetail.username
        }
        console.log("historyRecord : " +JSON.stringify(historyRecord));
        AiwacsService.createEquipment(equipment)
        .then(
          res => {
          console.log("응답받는곳")
          this.setState({redirect: "/equipmentManage" })
          alert("저장되었습니다.")
          window.location.reload();
        },
          // error => {
          //   const resMessage =
          //     (error.response &&
          //       error.response.data &&
          //       error.response.data.message) ||
          //     error.message ||
          //     error.toString();

          //     console.log(resMessage);
          //   alert("중복된 IP를 가진 장비가 존재합니다.");
          // }
        )
        .catch(err =>  {
          console.log(err) 
        })
      }

      

      this.setState({
        validated:true   
      });
      e.preventDefault();
      e.stopPropagation();  

      
      console.log(this.state.group);
      console.log(this.state.equipment);
      console.log(this.state.nickname);
      console.log(this.state.settingType.value);
      console.log(this.state.settingTemplate.value);
      console.log(this.state.settingIp);
      console.log(this.state.settingCatagory);
      console.log(this.state.settingOs);
      console.log(this.state.settingPerson);
      console.log(this.state.settingProxy.value);
      console.log(this.state.settingActive);
      console.log(this.state.hwTitle);
      console.log(this.state.hwCpu);
      console.log(this.state.hwDisk);
      console.log(this.state.hwNic);
      console.log(this.state.hwSensor);
      console.log(this.state.deletedFlag);
    }


  render() {
    const userDetail = JSON.parse(localStorage.getItem('user'))
    console.log(userDetail);
    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} />
    }
    const {equipment,nickname,settingType,settingTemplate,settingIp,settingCatagory,settingOs,settingPerson,settingProxy,settingActive,
      hwTitle,hwNumber,hwCpu,hwDisk,hwNic,hwSensor,checkList} = this.state;

    return (
        <>
      <Modal
      show={this.props.show}
	  onHide={this.props.onHide}
      size="lg" // sm
      aria-labelledby="contained-modal-title-vcenter"
      centered
    > 
     
      <Modal.Header  className="header-Area">
     
        <Modal.Title id="contained-modal-title-vcenter" className="header_Text">
          장비 추가
        </Modal.Title>
      </Modal.Header>
      <Form noValidate validated={this.state.validated} onSubmit={this.handleSubmit} >
      <Modal.Body>
      

      
      
      <Container>
      <Form.Group as={Row} className="mb-3" controlId="formHorizontalEquip">
        {/* column sm={2} lable의 가로 간격 1,2,3 */}
        
        <Form.Label column sm={3}>  
        <span className="list_square">■</span>
          장비명
        </Form.Label>
        
        {/* sm={10}  input의 가로 간격 */}
        <Col sm={9}>
          <Form.Control type="text" placeholder="장비 명" name="equipment" value={equipment} onChange={this.onChangeEquipment} required />
          <Form.Control.Feedback type="invalid"> 장비 명을 입력하세요. </Form.Control.Feedback>
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3" controlId="formHorizontalNickName">
        <Form.Label column sm={3}>
        <span className="list_square">■</span>
          별칭
        </Form.Label>
        <Col sm={9}>
          <Form.Control type="text" placeholder="별칭" name="nickname" value={nickname} onChange={this.onChageNickname}  required />
          <Form.Control.Feedback type="invalid"> 별칭을 입력하세요.</Form.Control.Feedback>
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3" controlId="formHorizontalType">
        <Form.Label column sm={3}>
        <span className="list_square">■</span>
          타입
        </Form.Label>
        <Col sm={9}>
          <Select 
          options={Type}  
          onChange={value => this.onChangeType(value)}  
          value={Type.find(op => {return op.value === Type })} 
          defaultValue={settingType}
          isSearchable={false}
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3" controlId="formHorizontalTemplate">
        <Form.Label column sm={3}>
        <span className="list_square">■</span>
          템플릿 그룹
        </Form.Label>
        <Col sm={9}>
          <Select 
          options={Template}  
          onChange={value => this.onChangeTemplate(value)} 
          value={Template.find(op => {return op.value === Template})} 
          defaultValue={settingTemplate}
          isSearchable={false} 
           />
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3" controlId="formHorizontalTemplate">
        <Form.Label column sm={3} className="InterfaceBorder">
        <span className="list_square">■</span>
          SNMP 인터페이스
        </Form.Label>
        <Col sm={3}>
            IP
          <Form.Control type="text" placeholder="" name="settingIp" value={settingIp} onChange={this.onChangeIp}  required />
          <Form.Control.Feedback type="invalid"> IP 입력하세요.</Form.Control.Feedback>
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3" controlId="formHorizontalCatagory">
        <Form.Label column sm={3} className="CategoryBox">
        <span className="list_square">■</span>
          유형
        </Form.Label>
        <Col sm={9} className="CheckBox"  >
           <div className="radioBox"> 
              <input type="radio" value="Server" checked={settingCatagory=== 'Server'} onChange={(e)=> this.setState({settingCatagory:e.target.value})}/><span className="CatagoryFont">Server</span>
              <input type="radio" value="Network" checked={settingCatagory=== 'Network'} onChange={(e)=> this.setState({settingCatagory:e.target.value})}/><span className="CatagoryFont">Network</span>
              <input type="radio" value="L2 Switch" checked={settingCatagory=== 'L2 Switch'} onChange={(e)=> this.setState({settingCatagory:e.target.value})}/><span className="CatagoryFont">L2 Switch</span>
              <input type="radio" value="L3 Switch" checked={settingCatagory=== 'L3 Switch'} onChange={(e)=> this.setState({settingCatagory:e.target.value})}/><span className="CatagoryFont">L3 Switch</span>
              <input type="radio" value="L4 Switch" checked={settingCatagory=== 'L4 Switch'} onChange={(e)=> this.setState({settingCatagory:e.target.value})}/><span className="CatagoryFont">L4 Switch</span>
              <input type="radio" value="L7 Switch" checked={settingCatagory=== 'L7 Switch'} onChange={(e)=> this.setState({settingCatagory:e.target.value})}/><span className="CatagoryFont">L7 Switch</span>
              <input type="radio" value="Firewall" checked={settingCatagory=== 'Firewall'} onChange={(e)=> this.setState({settingCatagory:e.target.value})}/><span className="CatagoryFont">Firewall</span>
              <input type="radio" value="Security" checked={settingCatagory=== 'Security'} onChange={(e)=> this.setState({settingCatagory:e.target.value})}/><span className="CatagoryFont">Security</span>
              <input type="radio" value="Air Conditioner" checked={settingCatagory=== 'Air Conditioner'} onChange={(e)=> this.setState({settingCatagory:e.target.value})}/><span className="CatagoryFont">Air Conditioner</span>
              <input type="radio" value="UPS" checked={settingCatagory=== 'UPS'} onChange={(e)=> this.setState({settingCatagory:e.target.value})}/><span className="CatagoryFont">UPS</span>
          </div>
            
            
           
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3" controlId="formHorizontalOs">
        <Form.Label column sm={3}>
        <span className="list_square">■</span>
          OS
        </Form.Label>
        <Col sm={9}>
          <Form.Control type="text" placeholder="OS" name="settingOs" value={settingOs} onChange={this.onChangeOs}  required />
          <Form.Control.Feedback type="invalid"> OS 입력하세요.</Form.Control.Feedback>
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3" controlId="formHorizontalPerson">
        <Form.Label column sm={3}>
        <span className="list_square">■</span>
          제조사
        </Form.Label>
        <Col sm={9}>
        <Form.Control type="text" placeholder="제조사" name="settingPerson" value={settingPerson} onChange={this.onChangePerson}  required />
          <Form.Control.Feedback type="invalid"> 제조사 입력하세요.</Form.Control.Feedback>
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3" controlId="formHorizontalProxy">
        <Form.Label column sm={3}>
        <span className="list_square">■</span>
          프록시 설정
        </Form.Label>
        <Col sm={9}>
            <Select 
            options={Proxy}
           defaultValue={settingProxy} 
           onChange={value => this.onChangeProxy(value)} 
           value={Proxy.find(op => {return op === Proxy})} 
           isSearchable={false} />
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3" controlId="formHorizontalActive">
        <Form.Label column sm={3}>
        <span className="list_square">■</span>
          활성
        </Form.Label>
        <Col sm={9} className="activeCheck">
          <Form.Check type="checkbox" defaultChecked="true" value={settingActive} onChange={this.onChangeActive}  />
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3" controlId="formHorizontalActive">
       <Form.Label column sm={4} className="TimeFont" >
            타임 별 수집 초기(초)
       </Form.Label>

       {hwTitle.value === '일괄설정' && (
       <Form.Group as={Row} className="TimeBox" >
        <Form.Label  className="HardwareLabel">
        <span className="list_square_Two">■</span>
            하드웨어 자원 수집주기
        </Form.Label>

          <Col className="HardwareTitle col-md-3 mb-0 ml-1" >
            <Select options={HardwareTitle} defaultValue={hwTitle} onChange={value => this.onChangeHwTitle(value)} value={HardwareTitle.find(op => {return op === HardwareTitle})} />
          </Col>
          <Col className="HardwareTitle col-md-2 mb-0 ml-1" >
            <Select  options={HardwareNumber} defaultValue={hwNumber} onChange={value => this.onChangeHwNumber(value)} value={HardwareNumber.find(op => {return op === HardwareNumber})} />
          </Col>

          </Form.Group>
       )}
        {hwTitle.value === '개별항목설정' && (

          <Form.Group as={Row} className="TimeBoxSecond" >
          <Form.Label  className="HardwareLabel">
          <span className="list_square_Two">■</span>
              하드웨어 자원 수집주기
          </Form.Label>

            <Col className="HardwareTitle col-md-3 mb-0 ml-1" >
              <Select options={HardwareTitle} defaultValue={hwTitle} onChange={value => this.onChangeHwTitle(value)} value={HardwareTitle.find(op => {return op === HardwareTitle})} />
            </Col>

            <Form.Group as={Row} className="TimeBoxSecondBox" >
            <Form.Label className="systemSort">
              CPU/MEM
            </Form.Label>
            <Col className="HardwareTitle col-md-2 mb-0 ml-1" >
              <Select  options={HardwareNumber} defaultValue={hwCpu} onChange={value => this.onChangeHwCpu(value)} value={HardwareNumber.find(op => {return op === HardwareNumber})} />
            </Col>
            <Form.Label className="systemSortDisk">
              DISK
            </Form.Label>
            <Col className="HardwareTitle col-md-2 mb-0 ml-1" >
              <Select  options={HardwareNumber} defaultValue={hwDisk} onChange={value => this.onChangeHwDisk(value)} value={HardwareNumber.find(op => {return op === HardwareNumber})} />
            </Col>
            <Form.Label className="systemSortNic">
              NIC
            </Form.Label>
            <Col className="HardwareTitle col-md-2 mb-0 ml-1" >
              <Select  options={HardwareNumber} defaultValue={hwNic} onChange={value => this.onChangeHwNic(value)} value={HardwareNumber.find(op => {return op === HardwareNumber})} />
            </Col>
            <Form.Label className="systemSortSensor">
              센서
            </Form.Label>
            <Col className="HardwareTitle col-md-2 mb-0 ml-1" >
              <Select  options={HardwareNumber} defaultValue={hwSensor} onChange={value => this.onChangeHwSensor(value)} value={HardwareNumber.find(op => {return op === HardwareNumber})} />
            </Col>
          </Form.Group>
        </Form.Group>
        )}
        </Form.Group>
        </Container>
        </Modal.Body>
        {/* <Modal.Footer> */}
        <Form.Group className="ButtonArea">
            <Button variant="primary" type="submit" className="saveBtn"> 저장 </Button>
            <Button onClick={this.props.onHide} className="hideBtn"  >닫기</Button>
        </Form.Group>
        {/* </Modal.Footer> */}
        </Form>
    </Modal>
    </>
    );
  }
}