import React, {Component} from 'react';
import { Modal,Button,Form, Container, Row,Col} from 'react-bootstrap';
import '../css/modal.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import GroupEquipmentService from '../services/groupEquipment.service';
import Equipment from '../images/equipment.png'
import Folder from '../images/folder.png'
import hide from '../images/hide.png'

const CustomIcon = () => {
   return <img style={{width:15,padding:1}} src={Equipment} alt="Custom Icon" />
}

export default class groupAdd extends Component  {
  constructor(props) {
    super(props);
    this.state={
      treeName:'새그룹',
      updateTreeName: '',
      checkView: false,
      parentTree: this.props.data,
    }
  }

 treeAdd = () => {
  const name = {
    treeName: this.state.treeName
  }
  GroupEquipmentService.insertGroupFirst(name)
    .then((res)=> {
      console.log("장비 추가")
      alert("저장되었습니다.")
      window.location.reload();
    })
 }

 onKeyPress = (e) => {
  if(e.key === 'Enter') {
    this.treeAdd();
  }
 }
  render() {
    const { parentTree,treeName } = this.state;
    console.log("parentTree : " + parentTree);
   
    return (
      <>
      <Modal show={this.props.show} onHide={this.props.onHide} size="sm" aria-labelledby="contained-modal-title-vcenter"   >
      <Modal.Header  className="header_area_add">
    
     <Modal.Title id="contained-modal-title-vcenter" className="header_add">
       그룹 추가
       <div className="addHideArea">
          <button onClick={()=> this.props.onHide()} className="addBtnHide"><span className="addSpanHide">X</span></button>
       </div>
     </Modal.Title>
   </Modal.Header>
   
    <Modal.Body>
   <Container>
     <Form.Group >
       <span className="addGrouplabel"><img style={{width:20,padding:1}} src={Folder} alt="Custom Icon" /></span>
        <input className="addGroupInput" placeholder="새그룹" value={treeName}  onKeyPress={(e)=> this.onKeyPress(e)} onChange={(e)=> this.setState({treeName: e.target.value})} />
                
     </Form.Group>
     </Container>
     </Modal.Body>

      <Form.Group className="ButtonArea">
        <Button className="changeBtn" onClick={()=> {this.treeAdd()}}> 추가 </Button>
      </Form.Group>
    </Modal>
      </>
    )
  }
}