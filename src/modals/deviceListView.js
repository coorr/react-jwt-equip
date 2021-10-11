import React from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import Tree, { TreeNode } from "rc-tree";
import AiwacsService from "../services/aiwacs.service";
import GroupEquipmentService from "../services/groupEquipment.service";
import { Modal,Button,Form, Container, Row,Col,InputGroup,FormControl,Image} from 'react-bootstrap';
import DeviceListComponent from "./deviceListComponent";
import EventBus from "../common/EventBus";
import Search from '../images/search.png';
import Select from 'react-select'
import "../css/equipmentManage.css"

import "../css/rc-tree.css"

const selectEquipmentOption = [{label:'그룹 미지정',value:'그룹 미지정'},{label:'전체',value:'전체'}]

class deviceListView extends React.Component {
  static propTypes = {
    keys: PropTypes.array
  };
  static defaultProps = {
    keys: ["0-0-0-0"]
  };
  constructor(props) {
    super(props);
    const keys = props.keys;
    this.state = {
      defaultExpandedKeys: keys,
      defaultSelectedKeys: keys,
      defaultCheckedKeys: keys,
      groupId:'',
      search:"",
      selectEquipment: {label:'그룹 미지정',value:'그룹 미지정'},
      // defaultExpandedkeys: ["0-1"],  // 처음 열릴 곳이 어디인지
      selectedKeys:[], // 선택한 키값
      droppedItems: [],   // 버리는 곳?
      groups:[],
      treeData: [],
      equipment:[],

      onCheckBtn:[],
     
    };
  }

  componentDidMount() {
    const {search,equipment,equipments} = this.state;

    GroupEquipmentService.getGroupEquipment()
          .then((res) => {
            const resDatas=res.data;
            const resData = [];

          resDatas.forEach((v,i) =>   {
              const innerArray = [];
              const innerData = { 
                key: v.groupId, 
                title: v.treeName, 
                children:  [],
              };
    
              if(v.equipments.length > 0) {
                for (let i = 0; i < v.equipments.length; i++) {
                  const obj = {};
                  obj.key = v.equipments[i].id;
                  obj.title = v.equipments[i].equipment;
                  innerArray.push(obj);
                }
                innerData.children = innerArray;                   
              }
              resData.push(innerData);
            });
            console.log(resData);
            this.setState({groups: resData})
          })

     GroupEquipmentService.unGroupEquipment()
      .then((res) => {
        console.log(res.data);
        const EquipDatas = res.data;
        const EquipArray=[];

        EquipDatas.filter((e) => {
          if(search  == "" ) {
            return e
          } else if(e.equipment.toLowerCase().includes(search.toLowerCase()) ||
                    e.nickname.toLowerCase().includes(search.toLowerCase()) ||
                    e.settingIp.toLowerCase().includes(search.toLowerCase()) ||
                    e.settingType.toLowerCase().includes(search.toLowerCase()))  {
            return e
          } 
        }).forEach((e,i) => { 
            const EquipTree={
              key:e.id,
              title:[e.equipment,'/',e.nickname,'/',e.settingIp,'/',e.settingType,'/','미지정']
            };
            EquipArray.push(EquipTree);
        })
        this.setState({equipment:EquipArray})
      })   
  }


  onExpand = (...args) => {
    console.log("onExpand", ...args);
  };
  onSelect = (selectedKeys, info) => {
    console.log("selected", selectedKeys, info);
    this.selKey = info.node.props.eventKey;

    if (this.tree) {
      console.log(
        "Selected DOM node:",
        selectedKeys.map((key) =>
          ReactDOM.findDOMNode(this.tree.domTreeNodes[key])
        )
      );
    }
  };

  onCheck = (groupId, info,checked) => {
    console.log("onCheck", groupId,info);
    console.log("onTow", checked);
    this.setState({groupId:groupId})
  };

  onEdit = () => {
    setTimeout(() => {
      console.log("current key: ", this.selKey);
    }, 0);
  };
  onDel = (e) => {
    if (!window.confirm("sure to delete?")) {
      return;
    }
    e.stopPropagation();
  };
  setTreeRef = (tree) => {
    this.tree = tree;
  };

  TreeAdd = () => {

  }
  TreeRemove = () => {
    console.log("groupId : "+ this.state.groupId);
    const groupId = {
      groupId:this.state.groupId,  // {groupId:6}
    }
    console.log(groupId);

    GroupEquipmentService.deleteGroup(groupId)
      .then(res => {
        console.log("삭제 시작");
        if(res.status == 200) {
          alert("삭제 되었습니다.");
        } else {
          alert("삭제 실패");
        }
      })
  }
  /* 전체 or 개별 */
  selectEquipment = (value) => {
    this.setState({selectEquipment: value})
    const {search} = this.state;
    if(value.value === '그룹 미지정') {
      GroupEquipmentService.unGroupEquipment()
      .then((res)=> {
        const EquipDatas = res.data;
        const EquipArray=[];

        EquipDatas.filter((e) => {
          if(search  == "" ) {
            return e
          } else if(e.equipment.toLowerCase().includes(search.toLowerCase()) ||
                    e.nickname.toLowerCase().includes(search.toLowerCase()) ||
                    e.settingIp.toLowerCase().includes(search.toLowerCase()) ||
                    e.settingType.toLowerCase().includes(search.toLowerCase()))  {
            return e
          } 
        }).forEach((e,i) => { 
            const EquipTree={
              key:e.id,
              title:[e.equipment,'/',e.nickname,'/',e.settingIp,'/',e.settingType,'/','미지정']
            };
            EquipArray.push(EquipTree);
        })
        this.setState({equipment:EquipArray})
      })
    } else {
     AiwacsService.getEquipment()
     .then((res) => {
       const EquipDatas = res.data;
       const EquipArray=[];

       EquipDatas.filter((e) => {
         if(search  == "" ) {
           return e
         } else if(e.equipment.toLowerCase().includes(search.toLowerCase()) ||
                   e.nickname.toLowerCase().includes(search.toLowerCase()) ||
                   e.settingIp.toLowerCase().includes(search.toLowerCase()) ||
                   e.settingType.toLowerCase().includes(search.toLowerCase()))  {
           return e
         } 
       }).forEach((e,i) => { 
           const EquipTree={
             key:e.id,
             title:[e.equipment,'/',e.nickname,'/',e.settingIp,'/',e.settingType,'/','미지정']
           };
           EquipArray.push(EquipTree);
       })
       this.setState({equipment:EquipArray})
     })  
    }
        
  }

  render() {
    const {equipment,search,groups,treeData,groupId, selectEquipment} = this.state;

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
              <Button className="buttonSelectEquipmentLeft" onClick={this.TreeAdd} >추가</Button> 
              <Button className="buttonSelectEquipmentLeft"   onClick={this.TreeRemove} >삭제</Button> 
              <Button className="buttonSelectEquipmentLeft"  onClick={this.TreeAdd} >수정</Button>
            </div>
          </div>
          <div className="searchArea">
            <div className="searchBox">
                <input className="searchInput" type="search" placeholder="검색" onChange={(e) => this.setState({search:e.target.value})} />
                <div className="searchIcon"><img src={Search} className="searchImg" /></div>
            </div>
          </div>

          

          <div className="draggable-demo">
        <div className="dd-demo-container">
         
            <div className="draggable-container">
              <Tree 
                multiple
                draggable
                checkable
                showLine
                treeData={groups}
                // defaultExpandAll
                defaultExpandedKeys={this.state.defaultExpandedkeys}
                selectedKeys={this.state.selectedKeys}
                onDragStart={this.onDragStart}
                onSelect={this.onSelect}
                onCheck={this.onCheck}
                autoExpandParent
                // autoExpandParent={false}   // 상위 자동확장 여부
                selectable={false}
                // onExpand={this.onExpand}
                // checkStrictly={true}

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
              <Select className="selectEquipment" options={selectEquipmentOption} value={selectEquipment}  onChange={value => this.selectEquipment(value)} />
              <input type="radio" className="inputSelectEquipment" checked />
              <label className="labelSelectEquipment" >All</label>

              <input type="radio" className="inputSelectEquipment" />
              <label className="labelSelectEquipment" >Agent</label>

              <input type="radio" className="inputSelectEquipment" />
              <label className="labelSelectEquipment" >SNMP</label>

              <input type="radio" className="inputSelectEquipment" />
              <label className="labelSelectEquipment" >ICMP</label>
              <Button className="buttonSelectEquipment">목록</Button>
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
          className="myCls"
          showLine
          checkable
          draggable
          defaultExpandAll
          defaultExpandedKeys={this.state.defaultExpandedKeys}
          defaultSelectedKeys={this.state.defaultSelectedKeys}
          defaultCheckedKeys={this.state.defaultCheckedKeys}
          onSelect={this.onSelect}
          onCheck={this.onCheck}
          selectable={false}
          treeData={equipment}
          // checkStrictly={false}
          // autoExpandParent={true}
          // checkStrictly={true}
        /> 
        </div>
        </div>
          </div>
      </>
    );
  }
}

export default deviceListView;
