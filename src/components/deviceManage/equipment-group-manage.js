import React from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import Tree, { TreeNode } from "rc-tree";
import AiwacsService from "../../services/aiwacs.service";
import GroupEquipmentService from "../../services/groupEquipment.service";
import { Modal,Button,Form, Container, Row,Col,InputGroup,FormControl,Image} from 'react-bootstrap';
import Search from '../../images/search.png';
import Select from 'react-select'
import "../../css/manageEquipmentList.css"
import Equipment from '../../images/equipment.png'
import ReactTooltip from 'react-tooltip';
import GroupAdd from "../../modals/tree-add.component";
import GroupUpdate from "../../modals/tree-update.component";

import "../../css/rc-tree.css"
import Folder from '../../images/folder.png'

const CustomIcon = () => {
   return <img style={{width:15,padding:1}} src={Equipment} alt="Custom Icon" />
}


// EquipDatas.filter((e) => {
//   if(search  == "" ) {
//     return e
//   } else if(e.equipment.toLowerCase().includes(search.toLowerCase()) ||
//             e.nickname.toLowerCase().includes(search.toLowerCase()) ||
//             e.settingIp.toLowerCase().includes(search.toLowerCase()) ||
//             e.settingType.toLowerCase().includes(search.toLowerCase()))  {
//     return e
//   } 
// }).forEach


class manageEquipmentList extends React.Component {
  static propTypes = {
    keys: PropTypes.array
  };
  static defaultProps = {
    keys: []
  };
  constructor(props) {
    super(props);
    const keys = props.keys;
    this.state = {
      defaultExpandedKeys: keys,
      defaultSelectedKeys: keys,
      defaultCheckedKeys: keys,
      checkedKey: [],
      groupId:'',
      search:"",
      selectedKeys:[], //
      groups:[],
      treeData: [],
      equipment:[],
      EquipArray:[],

      onCheckBtn:[],
      parentTree:[],
      childrenTree:[],
      deviceTree:[],
      dragDeviceTree:[],
      dragChildrenTree:[],
      expandkeys: [],
      expandChildrenkeys:[],
      
      addBtn: false,
      updateBtn: false,
      addTreeName:'새그룹',
      updateTreeName:'',
      inputEquipmentData:'all',
    };
  }
  eventChange =  () => {
      GroupEquipmentService.getGroupEquipment()
          .then((res) => {
            console.log("부모 업데이트");
            const resDatas=res.data;

            resDatas.forEach((v,i) =>   {
              v.children.forEach((e) => {
                if(e.isLeaf === undefined) {
                  e.icon = <CustomIcon />
                } 
             })
            });
            this.setState({groups: resDatas})
          })

      GroupEquipmentService.unGroupEquipment()
      .then((res) => {
        console.log("자식 업데이트");
        const EquipDatas = [res.data];
        const EquipArray=[];

        EquipDatas.forEach((e,i) => { 
            if(e.devices.length > 0) {
              for(let i=0; i < e.devices.length; i++) {
                const obj ={};
                obj.key = e.devices[i].id;
                obj.title = [e.devices[i].equipment,'/',e.devices[i].nickname,'/',e.devices[i].settingIp,'/',e.devices[i].settingType,'/',e.groups];
                obj.icon= <CustomIcon />
                
                EquipArray.push(obj);
              }
            }
        })
        this.setState({equipment:EquipArray,
                          childrenTree:[],deviceTree:[],dragDeviceTree:[]
        })
      }) 
      
      
  }

  componentDidUpdate(prevProps,prevState) {
  }

  componentDidMount() {
    GroupEquipmentService.getGroupEquipment()
          .then((res) => {
          console.log(res.data);
          const resDatas=res.data;

          resDatas.forEach((v,i) =>   {
              v.children.forEach((e) => {
                if(e.isLeaf === undefined) {
                  e.icon = <CustomIcon />
                }
                if(e.children !== undefined) {
                  e.children.forEach((c) => {
                    if(c.isLeaf === undefined) {
                      c.icon = <CustomIcon />
                    } 
                  })
                }
             })
            });
            this.setState({groups: resDatas})
          })

     GroupEquipmentService.unGroupEquipment()
      .then((res) => {
        // console.log(res.data);
        const EquipDatas = [res.data];
        const EquipArray=[];

        EquipDatas.forEach((e,index) => { 
            if(e.devices.length > 0) {
              for(let i=0; i < e.devices.length; i++) {
                const obj ={};
                obj.key = e.devices[i].id;
                obj.title = [e.devices[i].equipment,'/',e.devices[i].nickname,'/',e.devices[i].settingIp,'/',e.devices[i].settingType,'/',e.groups];
                obj.icon= <CustomIcon />
                
                EquipArray.push(obj);
              }
            }
        })
        this.setState({equipment:EquipArray, EquipArray:EquipDatas})
      })   

    
  }
  
  pathEquipmentGroupManage = () => { this.props.history.push("/admin") }

  onExpand = (expandkey,info) => {
    console.log(expandkey);
    console.log(info);

    const expandChildrenkeys = [];
    const expandChildren = info.node.props.children;
    expandChildren.map(e => {
      expandChildrenkeys.push(e.key);
     });
    this.setState({expandChildrenkeys: expandChildrenkeys})
    this.setState({expandkeys : expandkey})
    
  }

  onCheck = (checkKey, info) => {
    console.log(checkKey,info);

    const { expandkeys } = this.state;
    const groupId = [];
    const equipId = [];
    const groupName=  [];
    const groupIdData = info.checkedNodes;

    expandkeys.map(e => { console.log(e)})
    
    groupIdData.map(c => {
      if(c.props.isLeaf === false) {
        groupId.push(c.key)
      } else {
        equipId.push(c.key)
      }
      groupName.push(c.props.title)
    })

    this.setState({
      parentTree:groupId,
      childrenTree:equipId,
      updateTreeName:groupName[0],
    })
  };

  onCheckDevice = (checkKey, info,) => {
    console.log(checkKey);
    const { deviceTree } = this.state;
    const deviceId = [];
    const checkKeyNodes = info.checkedNodes;
    
    console.log(info);

    checkKeyNodes.map(c => {
      deviceId.push(c.key)
    })
    this.setState({deviceTree: deviceId})

  }

  TreeRemove = (checkKey) => {
    const { parentTree, childrenTree} = this.state;

    if(parentTree.length > 0) {
      GroupEquipmentService.deleteGroupEquipmentMapping('parent',parentTree)
        .then(() => {
          console.log("부모 삭제");
          alert("삭제 되었습니다.");
          // this.eventChange();
          window.location.reload();
          
                  
        })
    } else if(childrenTree.length > 0 ){
      GroupEquipmentService.deleteGroupEquipmentMapping('children',childrenTree)
        .then((res) => {
        console.log("자식 삭제");
         alert("삭제 되었습니다.");
        //  this.eventChange();
         window.location.reload();
       })
    } else {
        alert("삭제할 항목을 체크해주세요.")
      }
  }

  TreeUpdate = () => {
    const { parentTree } = this.state;

    if(parentTree.length === 0) {
      alert("수정할 항목을 선택해주세요.")
    } else if(parentTree.length > 1) {
      alert("수정할 항목을 하나만 선택해주세요.")
    } else {
      this.setState({updateBtn: true})
    }
  }

  TreeAdd = () => {
    const { parentTree, childrenTree  } = this.state;
    if(parentTree.length >= 2) {
      alert("한개만 체크해주세요.");
    } else {
      this.setState({addBtn: true})
    }
  }

  onDrop = (event,node) => {
    console.log(event.node.props.children);
    const { deviceTree, dragDeviceTree, childrenTree, dragChildrenTree  } = this.state; 
    
    var deviceCount = 0;
    // var groupCount = 0;
    console.log("deviceTree : ", deviceTree);
    console.log(deviceTree.length);
    for(var i=0; i< deviceTree.length; i++) {
      const insertMappingDevice = {
        group_id: event.node.props.eventKey,
        equipment_id: deviceTree[i]
      }
      GroupEquipmentService.insertGroupEquipmentMapping(insertMappingDevice) 
      .then(res=> {
        console.log("insert Equipment")
        deviceCount+=1;
        if(deviceCount === deviceTree.length) {
          this.eventChange();
        }
      })
    }
   
      console.log("deviceTree : " + deviceTree);
      console.log("dragDeviceTree: " + dragDeviceTree);
      if(dragDeviceTree.length > 0 && deviceTree.length === 0 ) {
        const insertMappingDrag = {
          group_id: event.node.props.eventKey,
          equipment_id: dragDeviceTree,
        }
        GroupEquipmentService.insertGroupEquipmentMapping(insertMappingDrag) 
        .then(res=> {
          console.log("insert Drag ")
          this.eventChange();
        })
      }

      console.log("childrenTree : " + childrenTree);
      for(var c=0; c < childrenTree.length; c++ ) {
        const insertMappingChildren = {
          group_id: event.node.props.eventKey,
          equipment_id: childrenTree[c]
        }
        GroupEquipmentService.insertGroupEquipmentMapping(insertMappingChildren) 
        .then(res=> {
          console.log("insert Children ")
          // this.eventChange();
          window.location.reload();
        })
      }

      console.log("dragChildrenTree : " + dragChildrenTree);
      if(dragChildrenTree.length > 0 && childrenTree.length === 0) {
        const insertChildrenDrag = {
          group_id: event.node.props.eventKey,
          equipment_id: dragChildrenTree
        }
        GroupEquipmentService.insertGroupEquipmentMapping(insertChildrenDrag) 
        .then(res=> {
          console.log("insert Drag Children ")
          this.eventChange();
          // window.location.reload();
        })
      }
  }

  onDragStart = (event,node) => {
    const deviceKeyArray = event.node.props.eventKey;
    this.setState({dragDeviceTree:deviceKeyArray})
    
  }
  onDragStartLeft = (event) => {
    const childrenKeyArray = event.node.props.eventKey;
    console.log(childrenKeyArray);
    this.setState({dragChildrenTree:childrenKeyArray})
  }

  /* 그룹 추가 */
  addTreeNameBtn = () => {
    const { parentTree, addTreeName  } = this.state;
    const name = { treeName: this.state.addTreeName }
    
    if(parentTree.length === 0 ) {
      GroupEquipmentService.insertGroupFirst(name)
      .then((res)=> {
        console.log("장비 추가")
        alert("저장되었습니다.")
        this.setState({addBtn:false})
        this.eventChange();
      })
    } else if(parentTree.length > 0 && parentTree.length < 2) {
      console.log(" parentTree ,addTreeName   : ", parentTree,addTreeName);
      const groupChildren = {
        parent : parentTree[0], 
        treeName : addTreeName,
        depth: 1,
      }
      GroupEquipmentService.insertGroupSecond(groupChildren)
        .then(res => {
          console.log("Second Depth");
          alert("저장되었습니다.")
          this.setState({addBtn:false})
          this.eventChange();
        })
    } else { 
      alert("한개만 체크해주세요.")
    }
    

   }
  addOnKeyPress = (e) => {
    if(e.key === 'Enter') {
      this.addTreeNameBtn();
    }
   }

  /* 그룹 수정 */
  updateTreeNameBtn = () => {
    const treeName = { treeName : this.state.updateTreeName }

    GroupEquipmentService.updateGroupName(this.state.parentTree,treeName)
      .then(res => {
        console.log("수정 진행");
        alert("수정되었습니다.")
        this.setState({updateBtn:false})
        this.eventChange();
        
      })
  }
  
   updateOnKeyPress = (e) => {
    if(e.key === 'Enter') {
      this.updateTreeNameBtn();
    }
   }

   selectEquipmentAll = (e) => {
     const { EquipArray }  = this.state;
     const type = e.target.value;

     this.setState({inputEquipmentData : e.target.value})

     
     console.log(EquipArray);

      if(type === 'all') {
        this.setState({equipment : EquipArray})
        }
      if(type === 'snmp') {

      } 
   }
   
  

  render() {
    const {equipment,search,groups,treeData,groupId,  parentTree,childrenTree,deviceTree,dragDeviceTree, addTreeName, updateTreeName, inputEquipmentData} = this.state;
    console.log("parentTree : " + parentTree);
    console.log("childrenTree : " + childrenTree);
    console.log("deviceTree : " + deviceTree);
    console.log("dragDeviceTree : " + dragDeviceTree);
    console.log("expandkeys : " + this.state.expandkeys);
    console.log("expandChildrenkeys : "+ this.state.expandChildrenkeys);
    

    return (
      <>
      <div className="Container">
        
        <div className="sideBarArea">
        </div>

        {/* 왼쪽 화면 */}
         <div className="treeParantLift">
         <div className="treeTopBarArea"> 
            <div className="TopBarBoxLeft">
              <div className="TobBarTextLeft">장비 그룹</div>
              <div className="buttonSelectEquipmentSize" >
              <Button className="buttonSelectEquipmentLeft" onClick={() => this.TreeAdd()} >추가</Button> 
              <Button className="buttonSelectEquipmentLeft"   onClick={()=> this.TreeUpdate()}  >수정</Button>
              <Button className="buttonSelectEquipmentLeftTwo"   onClick={() => this.TreeRemove()} >삭제</Button> 
              </div>
            </div>
          </div>
          <div className="searchArea">
            <div className="searchBox">
                <input className="searchInput" type="search" placeholder="검색" onChange={(e) => this.setState({search:e.target.value})} />
                <div className="searchIcon"><img src={Search} className="searchImg" /></div>
            </div>
          </div>
          
          { this.state.addBtn ? 
            <>
            <Modal show={this.state.addBtn} onHide={() => this.setState({addBtn:false})} size="sm" aria-labelledby="contained-modal-title-vcenter"   >
            <Modal.Header  className="header_area_add">
          
           <Modal.Title id="contained-modal-title-vcenter" className="header_add">
             그룹 추가
             <div className="addHideArea">
                <button onClick={() => this.setState({addBtn:false})} className="addBtnHide"><span className="addSpanHide">X</span></button>
             </div>
           </Modal.Title>
         </Modal.Header>
         
          <Modal.Body>
         <Container>
           <Form.Group >
             <span className="addGrouplabel"><img style={{width:20,padding:1}} src={Folder} alt="Custom Icon" /></span>
              <input className="addGroupInput" placeholder="새그룹" value={addTreeName}  onKeyPress={(e)=> this.addOnKeyPress(e)} onChange={(e)=> this.setState({addTreeName: e.target.value})} />
                      
           </Form.Group>
           </Container>
           </Modal.Body>
      
            <Form.Group className="ButtonArea">
              <Button className="changeBtn" onClick={()=> {this.addTreeNameBtn()}}> 추가 </Button>
            </Form.Group>
          </Modal>
            </>
            : null 
          }
          
          { this.state.updateBtn ? 
            <>
            <Modal show={this.state.updateBtn} onHide={() => this.setState({updateBtn:false})} size="sm" aria-labelledby="contained-modal-title-vcenter"   >
            <Modal.Header  className="header_area_add">
          
           <Modal.Title id="contained-modal-title-vcenter" className="header_add">
             그룹 수정
             <div className="addHideArea">
                <button onClick={()=> this.setState({updateBtn:false})} className="addBtnHide"><span className="addSpanHide">X</span></button>
             </div>
           </Modal.Title>
         </Modal.Header>
         
          <Modal.Body>
         <Container>
           <Form.Group >
            <span className="addGrouplabel"><img style={{width:20,padding:1}} src={Folder}  /></span>
            <input placeholder={updateTreeName} className="addGroupInput" onKeyPress={(e)=> this.updateOnKeyPress(e)} onChange={(e)=> this.setState({updateTreeName: e.target.value})} />
                      
           </Form.Group>
           </Container>
           </Modal.Body>
      
            <Form.Group className="ButtonArea">
              <Button className="changeBtn" onClick={()=> {this.updateTreeNameBtn()}}> 수정 </Button>
            </Form.Group>
          </Modal>
            </>
            : null 
          }

      <div className="draggable-demo">
        <div className="dd-demo-container">
         
            <div className="draggable-container">
              <Tree 
                className="treeLeft"
                ref={this.setTreeRef}
                multiple
                draggable
                checkable
                showLine
                selectable
                treeData={groups}
                // defaultExpandedKeys={this.state.defaultExpandedKeys}
                defaultCheckedKeys={this.state.defaultCheckedKeys}
                onDragStart={this.onDragStartLeft}
                // onSelect={this.onSelect}
                onExpand={this.onExpand}
                onCheck={this.onCheck}
                selectable={false}
                checkStrictly={true}
                onDrop={this.onDrop}
                onNodeExpand={this.state.testNode}
                // expandedKeys={this.state.testNode}
                // checkedKeys={this.state.defaultCheckedKeys}
                
                
               />
               
            </div>
         </div>
      </div>
        </div>


        {/* 오른쪽 화면 */}
        <div className="treeParant">
          <div className="treeTopBarArea"> 
            <div className="TopBarBox">
              <div className="TobBarText">장비</div>
              <div className="TobBarRight">
                <input type="radio" className="inputSelectEquipments" value="all" checked={inputEquipmentData==='all'} onChange={(e)=> {this.selectEquipmentAll(e)}}  />
                <label className="labelSelectEquipment" >All</label>

                <input type="radio" className="inputSelectEquipment" value="agent" checked={inputEquipmentData==='agent'}  onChange={(e)=> {this.selectEquipmentAll(e)}} />
                <label className="labelSelectEquipment" >Agent</label>

                <input type="radio" className="inputSelectEquipment" value="snmp" checked={inputEquipmentData==='snmp'}  onChange={(e)=> {this.selectEquipmentAll(e)}} />
                <label className="labelSelectEquipment" >SNMP</label>

                <input type="radio" className="inputSelectEquipment" value="icmp" checked={inputEquipmentData==='icmp'}  onChange={(e)=> {this.selectEquipmentAll(e)}} />
                <label className="labelSelectEquipment" >ICMP</label>
                <Button className="buttonSelectEquipment" onClick={()=> this.pathEquipmentGroupManage()}>목록</Button>
              </div>
            </div>
            
          </div>

          <div className="searchArea">
            <div className="searchBox">
                <input className="searchInput" type="search" placeholder="검색" onChange={(e) => this.setState({search:e.target.value})} />
                <div className="searchIcon"><img src={Search} className="searchImg" /></div>
            </div>
          </div>

          

        <div style={{marginLeft:'2%',marginTop:'1%'}}>
        <Tree
          ref={this.setTreeRef}
          className="treeRight"
          showLine
          multiple
          checkable
          draggable
          onSelect={this.onSelect}
          selectable={false}
          treeData={equipment}
          onCheck={this.onCheckDevice}
          onDragStart={this.onDragStart}
          defaultCheckedKeys={this.state.defaultCheckedKeys}
          defaultExpandedKeys={this.state.defaultExpandedKeys}
          
          // checkStrictly={true}
          

        /> 
        </div>
        </div>
          </div>
      </>
    );
  }
}

export default manageEquipmentList;
