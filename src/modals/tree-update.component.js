import React, {Component} from 'react';
import { Modal,Button,Form, Container, Row,Col} from 'react-bootstrap';
import '../css/modal.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import GroupEquipmentService from '../services/groupEquipment.service';
import Folder from '../images/folder.png'
import Equipment from '../images/equipment.png'

const CustomIcon = () => {
   return <img style={{width:15,padding:1}} src={Equipment} alt="Custom Icon" />
}

export default class groupUpdate extends Component  {
  constructor(props) {
    super(props);
    this.state={
      checkView: false,
      parentTree:this.props.data,
      treeName:'',
      loading: false,
      groups:[],
    }
  }

  componentDidMount() {
    const { parentTree } = this.state;
    
    GroupEquipmentService.getGroupName(parentTree)
      .then(res => {
        const name = res.data
        name.forEach(n => {
          this.setState({treeName:n.treeName})
        });
      })
  }

treeUpdate = () => {
  const treeName = { treeName : this.state.treeName }
  this.setState({loading: true})
  GroupEquipmentService.updateGroupName(this.state.parentTree,treeName)
    .then(res => {
      console.log("수정 진행");
      this.setState({loading:false})
      alert("수정되었습니다.")
      window.location.reload();
      
    })
}

 onKeyPress = (e) => {
  if(e.key === 'Enter') {
    this.treeUpdate();
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
       그룹 수정
       <div className="addHideArea">
          <button onClick={()=> this.props.onHide()} className="addBtnHide"><span className="addSpanHide">X</span></button>
       </div>
     </Modal.Title>
   </Modal.Header>
   
    <Modal.Body>
   <Container>
     <Form.Group >
       <span className="addGrouplabel"><img style={{width:20,padding:1}} src={Folder}  /></span>
        <input placeholder={treeName} className="addGroupInput" onKeyPress={(e)=> this.onKeyPress(e)} onChange={(e)=> this.setState({treeName: e.target.value})} />
                
     </Form.Group>
     </Container>
     </Modal.Body>

      <Form.Group className="ButtonArea">
        <Button className="changeBtn" onClick={()=> {this.treeUpdate()}}> 수정 </Button>
      </Form.Group>
    </Modal>
      </>
    )
  }
}