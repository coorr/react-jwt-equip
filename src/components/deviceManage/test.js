import React, {Component} from 'react';
import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';

import '../../css/diagramEquipment.module.css';
import { DiagramWrapper } from './topology/DiagramWrapper.tsx';
import { TopogolyEquipment } from './topology/topogolyEquipment.tsx';



export default class test extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodeDataArray: [],
      linkDataArray: [],
      modelData: {},
      skipsDiagramUpdate: false,
      onDiagramEvent: null,
      onModelChange: null,
    }
  }

  // componentDidMount() {
  //   if (!this.diagramRef.current) return;
  //   const diagram = this.diagramRef.current.getDiagram();
  //   if (diagram instanceof go.Diagram) {
  //     diagram.addDiagramListener('ChangedSelection', this.props.onDiagramEvent);
  //   }
  // }

  initDiagram() {
    const $ = go.GraphObject.make;
    // set your license key here before creating the diagram: go.Diagram.licenseKey = "...";
    const diagram =
      $(go.Diagram,
        {
          'undoManager.isEnabled': true,  // must be set to allow for model change listening
          // 'undoManager.maxHistoryLength': 0,  // uncomment disable undo/redo functionality
          'clickCreatingTool.archetypeNodeData': { text: 'new node', color: 'lightblue' },
          model: $(go.GraphLinksModel,
            {
              linkKeyProperty: 'key'  // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
            })
        });
  
    // define a simple Node template
  diagram.nodeTemplate =
    $(go.Node, 'Auto',  // the Shape will go around the TextBlock
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Shape, 'RoundedRectangle',
        { name: 'SHAPE', fill: 'white', strokeWidth: 0 },
        // Shape.fill is bound to Node.data.color
        new go.Binding('fill', 'color')),
      $(go.TextBlock,
        { margin: 8, editable: true },  // some room around the text
        new go.Binding('text').makeTwoWay()
      )
    );

    return diagram;
  }

  handleModelChange = (changes) =>  {
    this.setState({onModelChange : changes})
  }
  render() {
    const { onModelChange } = this.state;
    console.log(onModelChange);
      return (
          <>
            <div style={{marginLeft:'200px', marginTop:'200px'}}>
              <DiagramWrapper
                // initDiagram={this.initDiagram}
                // divClassName='diagram-component'
                nodeDataArray={[
                  { key: 0, text: 'Alpha', color: 'lightblue', loc: '0 0' },
                  { key: 1, text: 'Beta', color: 'orange', loc: '150 0' },
                  { key: 2, text: 'Gamma', color: 'lightgreen', loc: '0 150' },
                  { key: 3, text: 'Delta', color: 'pink', loc: '150 150' }
                ]}
                linkDataArray={[
                  { key: -1, from: 0, to: 1 },
                  { key: -2, from: 0, to: 2 },
                  { key: -3, from: 1, to: 1 },
                  { key: -4, from: 2, to: 3 },
                  { key: -5, from: 3, to: 0 },
                  { key: -6, from: 3, to: 0 },
                ]}
                onModelChange={(changes) => this.handleModelChange(changes)} // 노드를 움직였을 때 API
// 과장님 장비그룹추가 노드를 더블클릭하면 새로운 다이어그램 생성이 되는데 
              />
            </div>
          </>
      );
  }
}