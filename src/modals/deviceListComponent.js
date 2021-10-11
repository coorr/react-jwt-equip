import React from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import Tree, { TreeNode } from "rc-tree";
import DropableContainer from "./dropableContainer";
import AiwacsService from "../services/aiwacs.service";

import "../css/rc-tree.css";

// const treeData = [
//   {
//     key: "0-0",
//     title: "Agent",
//     children: [
//       {
//         key: "0-0-0",
//         title: "새그룹",
//         children: [{ key: "0-0-0-0", title: "parent 1-1-0" }]
//       },
//       {
//         key: "0-0-1",
//         title: "새그룹",
//         children: [
//           { key: "0-0-1-0", title: "parent 1-2-0", disableCheckbox: true },
//           { key: "0-0-1-1", title: "parent 1-2-1" },
//           { key: "0-0-1-2", title: "parent 1-2-1" },
//           { key: "0-0-1-3", title: "parent 1-2-1" },
//           { key: "0-0-1-4", title: "parent 1-2-1" },
//           { key: "0-0-1-5", title: "parent 1-2-1" },
//           { key: "0-0-1-6", title: "parent 1-2-1" }
//         ]
//       }
//     ],
   
//   }
// ];


class deviceListComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      defaultExpandedkeys: ["0-1"],  // 처음 열릴 곳이 어디인지
      selectedKeys:[], // 선택한 키값
      droppedItems: [],   // 버리는 곳?
      groups:[],
      treeData: [],
      equipment:[],
    }
  }

  componentDidMount() {

    AiwacsService.groupGetV2()
      .then((res) => {
        const resDatas=res.data;
        const resData = [];

       resDatas.filter((v) => {

       }).
       forEach((v,i) =>   {
          const innerArray = [];
          const innerData = { 
            key: v.id, 
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
  }

  onSelect = (selectedKeys,{selected, selectedNodes, node, event, nativeEvent}) => {
      console.log("onSelect : " + selectedKeys);
      console.log({selected, selectedNodes, node, event, nativeEvent});
      this.setState({...this.state, selectedKeys});
      console.log({...this.state, selectedKeys});
  }

  onDrop = (e) => {
    console.log("드롭 이벤트가 떨어지는 곳? : " , e);
    console.log("onDrop --this.state.selectedKeys : " + this.state.selectedKeys );
   
    const allDroppedItems = [
      ...this.state.droppedItems,
      ...this.state.selectedKeys
    ]
    console.log("allDroppedItems" + allDroppedItems);

    this.setState({
      ...this.state, 
        droppedItems: Array.from(new Set(allDroppedItems))
    })
  }


  render() {
    const {groups,equipment,treeData} = this.state;
    console.log(groups);

    // console.log(equipment);

    return (
      <div className="draggable-demo">
        <div className="dd-demo-container">
         
            <div className="draggable-container">
              <Tree 
                multiple
                draggable
                checkable
                showLine
                treeData={groups}
                defaultExpandAll
                defaultExpandedKeys={this.state.defaultExpandedkeys}
                selectedKeys={this.state.selectedKeys}
                onDragStart={this.onDragStart}
                onSelect={this.onSelect}
                autoExpandParent
               />
               
            </div>
         </div>
      </div>
    );
  }
}

export default deviceListComponent;